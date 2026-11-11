import { createHash, randomBytes } from 'node:crypto';
import { send, readRaw } from './http.js';

const problems = {
  'invalid-json': [400, 'Malformed JSON'],
  validation: [400, 'Invalid request'],
  'idempotency-key-missing': [400, 'Idempotency-Key required'],
  'not-found': [404, 'Not found'],
  'idempotency-key-in-flight': [409, 'Request in progress'],
  'unknown-menu-item': [422, 'Unknown menu item'],
  'idempotency-key-reused': [422, 'Idempotency-Key reused'],
  internal: [500, 'Internal error'],
};

function problem(res, slug, detail, errors) {
  const [status, title] = problems[slug];
  const body = { type: `https://menu.example/problems/${slug}`, title, status, detail };
  if (errors !== undefined) body.errors = errors;
  send(res, status, body, { 'content-type': 'application/problem+json' });
}

const integer = (value, min, max = Number.MAX_SAFE_INTEGER) =>
  Number.isSafeInteger(value) && value >= min && value <= max;
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

// Sort object members recursively; preserve every JSON value and array position,
// including unknown request fields and keys such as "__proto__".
function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (object(value)) {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function validateOrder(body) {
  if (!object(body)) return [{ pointer: '', detail: 'must be an object' }];
  const errors = [];
  if (!integer(body.tableId, 1, 200)) {
    errors.push({ pointer: '/tableId', detail: 'must be an integer from 1 to 200' });
  }
  if (!Array.isArray(body.items)) {
    errors.push({ pointer: '/items', detail: 'must be an array of 1 to 20 lines' });
  } else {
    if (body.items.length < 1 || body.items.length > 20) {
      errors.push({ pointer: '/items', detail: 'must contain 1 to 20 lines' });
    }
    body.items.forEach((item, index) => {
      if (!object(item)) {
        errors.push({ pointer: `/items/${index}`, detail: 'must be an object' });
        return;
      }
      if (!integer(item.menuItemId, 1)) {
        errors.push({ pointer: `/items/${index}/menuItemId`, detail: 'must be a positive integer' });
      }
      if (!integer(item.qty, 1, 20)) {
        errors.push({ pointer: `/items/${index}/qty`, detail: 'must be an integer from 1 to 20' });
      }
    });
  }
  return errors;
}

// Share active requests between handlers created over the same connection.
// Completed requests live in SQLite and survive process restarts.
const activeConnections = new WeakMap();

export function createV1(db) {
  let active = activeConnections.get(db);
  if (!active) activeConnections.set(db, active = new Map());

  // Prepare lazily: constructing the app does not require new tables until a
  // corresponding endpoint is used. Schema changes belong only to migrations.
  const statements = new Map();
  function sql(query) {
    if (!statements.has(query)) statements.set(query, db.prepare(query));
    return statements.get(query);
  }
  const menu = (id) => sql('SELECT id, name, price_vnd FROM menu_items WHERE id = ?').get(id);
  const stored = (key) => sql('SELECT fingerprint, response_body, location FROM v1_idempotency WHERE key = ?').get(key);

  function orderView(row) {
    return {
      id: row.id,
      tableId: row.table_id,
      items: sql('SELECT menu_item_id, qty, unit_price_vnd FROM order_items WHERE order_id = ? ORDER BY line')
        .all(row.id).map((line) => ({ menuItemId: line.menu_item_id, qty: line.qty, unitPriceVnd: line.unit_price_vnd })),
      totalVnd: row.total_vnd,
      createdAt: row.created_at,
    };
  }

  function replay(res, previous, fingerprint) {
    if (previous.fingerprint !== fingerprint) {
      return problem(res, 'idempotency-key-reused', 'This key was already used with a different JSON body.');
    }
    send(res, 201, JSON.parse(previous.response_body), {
      Location: previous.location,
      'Idempotent-Replayed': 'true',
    });
  }

  async function placeOrder(req, res) {
    const key = req.headers['idempotency-key'];
    if (typeof key !== 'string' || key.length < 1 || [...key].length > 255) {
      return problem(res, 'idempotency-key-missing', 'Supply an Idempotency-Key of 1 to 255 characters.');
    }

    // Claim before awaiting the body, but report JSON syntax errors before an
    // in-flight conflict as required by the ordered validation algorithm.
    const owner = Symbol();
    const alreadyActive = active.has(key);
    if (!alreadyActive) active.set(key, owner);
    try {
      const raw = await readRaw(req);
      let body;
      try { body = JSON.parse(raw); }
      catch { return problem(res, 'invalid-json', 'The request body is not valid JSON.'); }

      if (alreadyActive) {
        return problem(res, 'idempotency-key-in-flight', 'A request with this key is still being processed.');
      }
      const fingerprint = createHash('sha256').update(canonical(body)).digest('hex');
      const previous = stored(key);
      if (previous) return replay(res, previous, fingerprint);

      const errors = validateOrder(body);
      if (errors.length) return problem(res, 'validation', `${errors.length} request fields are invalid.`, errors);

      let result;
      db.exec('BEGIN IMMEDIATE');
      try {
        // Another connection may have completed this key while we read the
        // request; recheck while holding the SQLite write transaction.
        const concurrent = stored(key);
        if (concurrent) {
          result = { previous: concurrent };
        } else {
          const unknown = [];
          const items = body.items.map((line, index) => {
            const item = menu(line.menuItemId);
            if (!item) unknown.push({ pointer: `/items/${index}/menuItemId`, detail: 'does not name an existing menu item' });
            return { menuItemId: line.menuItemId, qty: line.qty, unitPriceVnd: item?.price_vnd };
          });
          if (unknown.length) {
            result = { unknown };
          } else {
            const totalVnd = items.reduce((sum, line) => sum + line.unitPriceVnd * line.qty, 0);
            const createdAt = new Date().toISOString();
            const inserted = sql('INSERT INTO orders (table_id, total_vnd, created_at) VALUES (?, ?, ?)')
              .run(body.tableId, totalVnd, createdAt);
            const id = Number(inserted.lastInsertRowid);
            items.forEach((line, index) => {
              sql('INSERT INTO order_items (order_id, line, menu_item_id, qty, unit_price_vnd) VALUES (?, ?, ?, ?, ?)')
                .run(id, index, line.menuItemId, line.qty, line.unitPriceVnd);
            });
            const order = { id, tableId: body.tableId, items, totalVnd, createdAt };
            const location = `/v1/orders/${id}`;
            sql('INSERT INTO v1_idempotency (key, fingerprint, response_body, location, created_at) VALUES (?, ?, ?, ?, ?)')
              .run(key, fingerprint, JSON.stringify(order), location, createdAt);
            result = { order, location };
          }
        }
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
      if (result.previous) return replay(res, result.previous, fingerprint);
      if (result.unknown) {
        return problem(res, 'unknown-menu-item', `${result.unknown.length} order lines name unknown menu items.`, result.unknown);
      }
      send(res, 201, result.order, { Location: result.location });
    } finally {
      if (active.get(key) === owner) active.delete(key);
    }
  }

  function listOrders(res, params) {
    const errors = [];
    function queryInteger(name, min, max, fallback) {
      if (!params.has(name)) return fallback;
      const raw = params.get(name);
      const value = Number(raw);
      if (params.getAll(name).length !== 1 || !/^\d+$/.test(raw) || !integer(value, min, max)) {
        errors.push({ parameter: name, detail: `must be an integer from ${min} to ${max}` });
        return fallback;
      }
      return value;
    }
    const tableId = queryInteger('tableId', 1, 200, null);
    const limit = queryInteger('limit', 1, 100, 20);
    let cursor;
    if (params.has('cursor')) {
      const token = params.get('cursor');
      if (params.getAll('cursor').length === 1 && /^[A-Za-z0-9_-]{32}$/.test(token)) {
        cursor = sql('SELECT table_id, upper_id, last_id FROM v1_cursors WHERE token = ?').get(token);
      }
      if (!cursor || cursor.table_id !== tableId) {
        errors.push({ parameter: 'cursor', detail: 'must be an issued cursor for the same tableId filter' });
      }
    }
    if (errors.length) return problem(res, 'validation', `${errors.length} query parameters are invalid.`, errors);

    const upperId = cursor?.upper_id ?? sql('SELECT COALESCE(MAX(id), 0) AS id FROM orders').get().id;
    const rows = sql(`SELECT id, table_id, total_vnd, created_at FROM orders
      WHERE id <= ? AND (? IS NULL OR id < ?) AND (? IS NULL OR table_id = ?)
      ORDER BY id DESC LIMIT ?`).all(upperId, cursor?.last_id ?? null, cursor?.last_id ?? null, tableId, tableId, limit + 1);
    const page = rows.slice(0, limit);
    let nextCursor = null;
    if (rows.length > limit) {
      nextCursor = randomBytes(24).toString('base64url');
      sql('INSERT INTO v1_cursors (token, table_id, upper_id, last_id, created_at) VALUES (?, ?, ?, ?, ?)')
        .run(nextCursor, tableId, upperId, page.at(-1).id, new Date().toISOString());
    }
    send(res, 200, { items: page.map(orderView), nextCursor });
  }

  return async function handleV1(req, res, url) {
    try {
      const itemPath = /^\/v1\/menu\/([^/]+)$/.exec(url.pathname);
      const orderPath = /^\/v1\/orders\/([^/]+)$/.exec(url.pathname);
      if (req.method === 'GET' && itemPath) {
        const id = Number(itemPath[1]);
        const row = /^\d+$/.test(itemPath[1]) && integer(id, 1) ? menu(id) : undefined;
        if (row) send(res, 200, { id: row.id, name: row.name, priceVnd: row.price_vnd });
        else problem(res, 'not-found', 'The requested menu item does not exist.');
      } else if (req.method === 'POST' && url.pathname === '/v1/orders') {
        await placeOrder(req, res);
      } else if (req.method === 'GET' && url.pathname === '/v1/orders') {
        listOrders(res, url.searchParams);
      } else if (req.method === 'GET' && orderPath) {
        const id = Number(orderPath[1]);
        const row = /^\d+$/.test(orderPath[1]) && integer(id, 1)
          ? sql('SELECT id, table_id, total_vnd, created_at FROM orders WHERE id = ?').get(id) : undefined;
        if (row) send(res, 200, orderView(row));
        else problem(res, 'not-found', 'The requested order does not exist.');
      } else {
        problem(res, 'not-found', 'The requested route does not exist.');
      }
    } catch {
      if (!res.headersSent) problem(res, 'internal', 'An unexpected error occurred.');
      else if (!res.writableEnded) res.end();
    }
    return true;
  };
}
