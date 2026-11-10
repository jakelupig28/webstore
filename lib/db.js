import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const MYSQL_CONFIG = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  connectTimeout: 4000
};

const DB_NAME = process.env.MYSQL_DATABASE || 'laro_sports_db';

const DEFAULT_ADMIN_HASH =
  'larosalt2025:58518420f55c65cfbd4acbf93dbecdc3c904d433dc5c36ee75faa6f3e6792b19b04901c987ed7716c972d31330aedbf4403dbf058f8550b2030a2b0037a07053';
const DEFAULT_CUSTOMER_HASH =
  'larosalt2025:160678ec17b3984817dd09c1336f36565b01dbc6002cbd5029da0e4a4c90bfb05def29aea641fce5851743818cdc6bdc848288e05fbf01e8a228051b3d9b0638';

let pool = null;
let mysqlReady = false;

// Fallback store when XAMPP MySQL isn't reachable (e.g. cloud preview)
const FALLBACK_FILE = path.join(process.cwd(), 'data', 'fallback_db.json');
let memoryStore = {
  users: [
    {
      id: 1,
      name: 'LARO SPORTS Admin',
      email: 'admin@larosports.com',
      password_hash: DEFAULT_ADMIN_HASH,
      role: 'admin',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Demo Customer',
      email: 'customer@larosports.com',
      password_hash: DEFAULT_CUSTOMER_HASH,
      role: 'customer',
      created_at: new Date().toISOString()
    }
  ],
  orders: [],
  order_items: []
};

function loadFallbackStore() {
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      const raw = fs.readFileSync(FALLBACK_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.users)) {
        memoryStore = parsed;
      }
    }
  } catch {
    // Ignore read errors on serverless
  }
  return memoryStore;
}

function saveFallbackStore(store) {
  memoryStore = store;
  try {
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch {
    // Ignore write errors on read-only serverless
  }
}

export async function getPool() {
  if (pool && mysqlReady) {
    try {
      await pool.query('SELECT 1');
      return pool;
    } catch {
      pool = null;
      mysqlReady = false;
    }
  }

  try {
    // 1. Connect without database to ensure laro_sports_db exists
    const bootstrapConn = await mysql.createConnection(MYSQL_CONFIG);
    await bootstrapConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await bootstrapConn.end();

    // 2. Create connection pool to laro_sports_db
    pool = mysql.createPool({
      ...MYSQL_CONFIG,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // 3. Ensure tables exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(120) NOT NULL,
        \`email\` VARCHAR(150) NOT NULL UNIQUE,
        \`password_hash\` VARCHAR(255) NOT NULL,
        \`role\` ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`orders\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`order_number\` VARCHAR(32) NOT NULL UNIQUE,
        \`user_id\` INT NULL,
        \`customer_name\` VARCHAR(120) NOT NULL,
        \`customer_email\` VARCHAR(150) NOT NULL,
        \`customer_phone\` VARCHAR(40) NOT NULL,
        \`shipping_address\` TEXT NOT NULL,
        \`city\` VARCHAR(100) NOT NULL,
        \`province\` VARCHAR(100) NOT NULL DEFAULT '',
        \`postal_code\` VARCHAR(20) NOT NULL,
        \`payment_method\` VARCHAR(50) NOT NULL DEFAULT 'COD',
        \`notes\` TEXT NULL,
        \`total_amount\` DECIMAL(10, 2) NOT NULL,
        \`status\` ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Pending',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_orders_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`order_items\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`order_id\` INT NOT NULL,
        \`product_id\` VARCHAR(100) NOT NULL,
        \`product_title\` VARCHAR(150) NOT NULL,
        \`variant_title\` VARCHAR(80) NOT NULL,
        \`quantity\` INT NOT NULL,
        \`price\` DECIMAL(10, 2) NOT NULL,
        \`image_url\` VARCHAR(255) DEFAULT '',
        CONSTRAINT \`fk_order_items_order\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Seed default admin and customer accounts if not present
    await pool.query(
      `INSERT IGNORE INTO \`users\` (\`name\`, \`email\`, \`password_hash\`, \`role\`) VALUES
        ('LARO SPORTS Admin', 'admin@larosports.com', ?, 'admin'),
        ('Demo Customer', 'customer@larosports.com', ?, 'customer')`,
      [DEFAULT_ADMIN_HASH, DEFAULT_CUSTOMER_HASH]
    );

    mysqlReady = true;
    return pool;
  } catch (err) {
    mysqlReady = false;
    pool = null;
    return null;
  }
}

export async function findUserByEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  const db = await getPool();
  if (db) {
    const [rows] = await db.query('SELECT * FROM `users` WHERE LOWER(`email`) = ? LIMIT 1', [normalized]);
    return rows[0] || null;
  }
  const store = loadFallbackStore();
  return store.users.find(u => u.email.toLowerCase() === normalized) || null;
}

export async function findUserById(id) {
  const db = await getPool();
  if (db) {
    const [rows] = await db.query(
      'SELECT `id`, `name`, `email`, `role`, `created_at` FROM `users` WHERE `id` = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  }
  const store = loadFallbackStore();
  const u = store.users.find(item => Number(item.id) === Number(id));
  if (!u) return null;
  const { password_hash, ...safeUser } = u;
  return safeUser;
}

export async function createUser({ name, email, passwordHash, role = 'customer' }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const validRole = role === 'admin' ? 'admin' : 'customer';
  const db = await getPool();
  if (db) {
    const [result] = await db.query(
      'INSERT INTO `users` (`name`, `email`, `password_hash`, `role`) VALUES (?, ?, ?, ?)',
      [name.trim(), normalizedEmail, passwordHash, validRole]
    );
    return {
      id: result.insertId,
      name: name.trim(),
      email: normalizedEmail,
      role: validRole,
      created_at: new Date().toISOString()
    };
  }
  const store = loadFallbackStore();
  const nextId = store.users.reduce((max, u) => Math.max(max, Number(u.id) || 0), 0) + 1;
  const newUser = {
    id: nextId,
    name: name.trim(),
    email: normalizedEmail,
    password_hash: passwordHash,
    role: validRole,
    created_at: new Date().toISOString()
  };
  store.users.push(newUser);
  saveFallbackStore(store);
  const { password_hash, ...safeUser } = newUser;
  return safeUser;
}

export async function getAllUsers() {
  const db = await getPool();
  if (db) {
    const [rows] = await db.query(
      'SELECT `id`, `name`, `email`, `role`, `created_at` FROM `users` ORDER BY `created_at` DESC'
    );
    return rows;
  }
  const store = loadFallbackStore();
  return store.users.map(({ password_hash, ...u }) => u);
}

export async function updateUserRole(userId, role) {
  const validRole = role === 'admin' ? 'admin' : 'customer';
  const db = await getPool();
  if (db) {
    await db.query('UPDATE `users` SET `role` = ? WHERE `id` = ?', [validRole, userId]);
    return true;
  }
  const store = loadFallbackStore();
  const idx = store.users.findIndex(u => Number(u.id) === Number(userId));
  if (idx > -1) {
    store.users[idx].role = validRole;
    saveFallbackStore(store);
    return true;
  }
  return false;
}

export async function createOrder({
  orderNumber,
  userId = null,
  customerName,
  customerEmail,
  customerPhone,
  shippingAddress,
  city,
  province = '',
  postalCode,
  paymentMethod = 'COD',
  notes = '',
  totalAmount,
  items = []
}) {
  const db = await getPool();
  if (db) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [orderResult] = await conn.query(
        `INSERT INTO \`orders\` (
          \`order_number\`, \`user_id\`, \`customer_name\`, \`customer_email\`, \`customer_phone\`,
          \`shipping_address\`, \`city\`, \`province\`, \`postal_code\`, \`payment_method\`,
          \`notes\`, \`total_amount\`, \`status\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
        [
          orderNumber,
          userId || null,
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress,
          city,
          province,
          postalCode,
          paymentMethod,
          notes,
          Number(totalAmount) || 0
        ]
      );
      const orderId = orderResult.insertId;

      for (const item of items) {
        await conn.query(
          `INSERT INTO \`order_items\` (
            \`order_id\`, \`product_id\`, \`product_title\`, \`variant_title\`, \`quantity\`, \`price\`, \`image_url\`
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            String(item.productId || 'item'),
            String(item.productTitle || 'Product'),
            String(item.variantTitle || 'Default'),
            Number(item.quantity) || 1,
            Number(item.price) || 0,
            String(item.imageUrl || '')
          ]
        );
      }

      await conn.commit();
      return { id: orderId, orderNumber, engine: 'mysql' };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  // Fallback
  const store = loadFallbackStore();
  const nextOrderId = store.orders.reduce((max, o) => Math.max(max, Number(o.id) || 0), 0) + 1;
  const newOrder = {
    id: nextOrderId,
    order_number: orderNumber,
    user_id: userId || null,
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    shipping_address: shippingAddress,
    city,
    province,
    postal_code: postalCode,
    payment_method: paymentMethod,
    notes,
    total_amount: Number(totalAmount) || 0,
    status: 'Pending',
    created_at: new Date().toISOString()
  };
  store.orders.unshift(newOrder);

  for (const item of items) {
    const nextItemId = store.order_items.reduce((max, i) => Math.max(max, Number(i.id) || 0), 0) + 1;
    store.order_items.push({
      id: nextItemId,
      order_id: nextOrderId,
      product_id: String(item.productId || 'item'),
      product_title: String(item.productTitle || 'Product'),
      variant_title: String(item.variantTitle || 'Default'),
      quantity: Number(item.quantity) || 1,
      price: Number(item.price) || 0,
      image_url: String(item.imageUrl || '')
    });
  }
  saveFallbackStore(store);
  return { id: nextOrderId, orderNumber, engine: 'fallback' };
}

export async function getOrders({ userId = null, email = null, isAdmin = false }) {
  const db = await getPool();
  if (db) {
    let orders = [];
    if (isAdmin) {
      const [rows] = await db.query('SELECT * FROM `orders` ORDER BY `created_at` DESC');
      orders = rows;
    } else if (userId || email) {
      const [rows] = await db.query(
        'SELECT * FROM `orders` WHERE `user_id` = ? OR LOWER(`customer_email`) = LOWER(?) ORDER BY `created_at` DESC',
        [userId || -1, email || '']
      );
      orders = rows;
    }

    if (orders.length === 0) return [];
    const orderIds = orders.map(o => o.id);
    const [items] = await db.query(
      'SELECT * FROM `order_items` WHERE `order_id` IN (?)',
      [orderIds]
    );

    return orders.map(order => ({
      ...order,
      items: items.filter(i => i.order_id === order.id)
    }));
  }

  const store = loadFallbackStore();
  let orders = store.orders;
  if (!isAdmin) {
    orders = store.orders.filter(
      o =>
        (userId && Number(o.user_id) === Number(userId)) ||
        (email && String(o.customer_email).toLowerCase() === String(email).toLowerCase())
    );
  }
  return orders.map(order => ({
    ...order,
    items: store.order_items.filter(i => Number(i.order_id) === Number(order.id))
  }));
}

export async function updateOrderStatus(orderId, status) {
  const allowed = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  const validStatus = allowed.includes(status) ? status : 'Pending';
  const db = await getPool();
  if (db) {
    await db.query('UPDATE `orders` SET `status` = ? WHERE `id` = ?', [validStatus, orderId]);
    return true;
  }
  const store = loadFallbackStore();
  const idx = store.orders.findIndex(o => Number(o.id) === Number(orderId));
  if (idx > -1) {
    store.orders[idx].status = validStatus;
    saveFallbackStore(store);
    return true;
  }
  return false;
}

export async function deleteOrder(orderId) {
  const db = await getPool();
  if (db) {
    await db.query('DELETE FROM `orders` WHERE `id` = ?', [orderId]);
    return true;
  }
  const store = loadFallbackStore();
  store.orders = store.orders.filter(o => Number(o.id) !== Number(orderId));
  store.order_items = store.order_items.filter(i => Number(i.order_id) !== Number(orderId));
  saveFallbackStore(store);
  return true;
}

export async function getDatabaseStatus() {
  const db = await getPool();
  return {
    connected: Boolean(db),
    engine: db ? 'XAMPP MySQL (laro_sports_db)' : 'Local Fallback Store (Start XAMPP MySQL on port 3306)',
    database: DB_NAME,
    host: MYSQL_CONFIG.host,
    port: MYSQL_CONFIG.port
  };
}

