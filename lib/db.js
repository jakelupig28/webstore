import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { PRODUCTS } from '../data/products';

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

const FALLBACK_FILE = path.join(process.cwd(), 'data', 'fallback_db.json');

function enrichDefaultProducts() {
  return PRODUCTS.map((p) => ({
    ...p,
    variants: (p.variants || []).map((v) => ({
      ...v,
      stock: typeof v.stock === 'number' ? v.stock : v.availableForSale ? 15 : 0,
      availableForSale: typeof v.stock === 'number' ? v.stock > 0 : Boolean(v.availableForSale)
    }))
  }));
}

let memoryStore = {
  users: [
    {
      id: 1,
      name: 'LARO SPORTS Admin',
      email: 'admin@larosports.com',
      password_hash: DEFAULT_ADMIN_HASH,
      role: 'admin',
      birthdate: '2000-01-01',
      age: 26,
      gender: 'Male',
      address: 'LARO SPORTS HQ, Metro Manila',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Demo Customer',
      email: 'customer@larosports.com',
      password_hash: DEFAULT_CUSTOMER_HASH,
      role: 'customer',
      birthdate: '2002-05-15',
      age: 24,
      gender: 'Male',
      address: '142 Katipunan Ave, Quezon City, Metro Manila',
      created_at: new Date().toISOString()
    }
  ],
  orders: [],
  order_items: [],
  products_overrides: {},
  custom_products: []
};

function loadFallbackStore() {
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      const raw = fs.readFileSync(FALLBACK_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.users)) {
        memoryStore = {
          ...memoryStore,
          ...parsed,
          products_overrides: parsed.products_overrides || {},
          custom_products: parsed.custom_products || []
        };
      }
    }
  } catch {
    // Ignore read errors
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
    const bootstrapConn = await mysql.createConnection(MYSQL_CONFIG);
    await bootstrapConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await bootstrapConn.end();

    pool = mysql.createPool({
      ...MYSQL_CONFIG,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(120) NOT NULL,
        \`email\` VARCHAR(150) NOT NULL UNIQUE,
        \`password_hash\` VARCHAR(255) NOT NULL,
        \`role\` ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
        \`birthdate\` VARCHAR(20) DEFAULT '',
        \`age\` INT NULL,
        \`gender\` VARCHAR(40) DEFAULT '',
        \`address\` TEXT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Auto-migrate existing users table if created before new profile columns
    const alterCols = [
      'ALTER TABLE `users` ADD COLUMN `birthdate` VARCHAR(20) DEFAULT ""',
      'ALTER TABLE `users` ADD COLUMN `age` INT NULL',
      'ALTER TABLE `users` ADD COLUMN `gender` VARCHAR(40) DEFAULT ""',
      'ALTER TABLE `users` ADD COLUMN `address` TEXT NULL'
    ];
    for (const sql of alterCols) {
      try {
        await pool.query(sql);
      } catch {
        // Column already exists
      }
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`products_inventory\` (
        \`product_id\` VARCHAR(100) PRIMARY KEY,
        \`title\` VARCHAR(150) NOT NULL,
        \`handle\` VARCHAR(150) NOT NULL,
        \`category\` VARCHAR(80) NOT NULL,
        \`price\` DECIMAL(10, 2) NOT NULL,
        \`image_url\` VARCHAR(255) DEFAULT '',
        \`description\` TEXT NULL,
        \`variants_json\` LONGTEXT NOT NULL,
        \`is_custom\` TINYINT(1) DEFAULT 0,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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

    await pool.query(
      `INSERT IGNORE INTO \`users\` (\`name\`, \`email\`, \`password_hash\`, \`role\`, \`birthdate\`, \`age\`, \`gender\`, \`address\`) VALUES
        ('LARO SPORTS Admin', 'admin@larosports.com', ?, 'admin', '2000-01-01', 26, 'Male', 'LARO SPORTS HQ, Metro Manila'),
        ('Demo Customer', 'customer@larosports.com', ?, 'customer', '2002-05-15', 24, 'Male', '142 Katipunan Ave, Quezon City, Metro Manila')`,
      [DEFAULT_ADMIN_HASH, DEFAULT_CUSTOMER_HASH]
    );

    mysqlReady = true;
    return pool;
  } catch {
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
  return store.users.find((u) => u.email.toLowerCase() === normalized) || null;
}

export async function findUserById(id) {
  const db = await getPool();
  if (db) {
    const [rows] = await db.query(
      'SELECT `id`, `name`, `email`, `role`, `birthdate`, `age`, `gender`, `address`, `created_at` FROM `users` WHERE `id` = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  }
  const store = loadFallbackStore();
  const u = store.users.find((item) => Number(item.id) === Number(id));
  if (!u) return null;
  const { password_hash, ...safeUser } = u;
  return safeUser;
}

export async function createUser({
  name,
  email,
  passwordHash,
  role = 'customer',
  birthdate = '',
  age = null,
  gender = '',
  address = ''
}) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const validRole = role === 'admin' ? 'admin' : 'customer';
  const numericAge = age !== null && age !== '' ? Number(age) : null;

  const db = await getPool();
  if (db) {
    const [result] = await db.query(
      'INSERT INTO `users` (`name`, `email`, `password_hash`, `role`, `birthdate`, `age`, `gender`, `address`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name.trim(), normalizedEmail, passwordHash, validRole, birthdate || '', numericAge, gender || '', address || '']
    );
    return {
      id: result.insertId,
      name: name.trim(),
      email: normalizedEmail,
      role: validRole,
      birthdate: birthdate || '',
      age: numericAge,
      gender: gender || '',
      address: address || '',
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
    birthdate: birthdate || '',
    age: numericAge,
    gender: gender || '',
    address: address || '',
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
      'SELECT `id`, `name`, `email`, `role`, `birthdate`, `age`, `gender`, `address`, `created_at` FROM `users` ORDER BY `created_at` DESC'
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
  const idx = store.users.findIndex((u) => Number(u.id) === Number(userId));
  if (idx > -1) {
    store.users[idx].role = validRole;
    saveFallbackStore(store);
    return true;
  }
  return false;
}

// ==========================================================
// PRODUCT INVENTORY & STORE CATALOG MANAGEMENT
// ==========================================================
export async function getCatalogProducts() {
  const baseProducts = enrichDefaultProducts();
  const db = await getPool();

  if (db) {
    const [rows] = await db.query('SELECT * FROM `products_inventory`');
    const rowMap = new Map(rows.map((r) => [r.product_id, r]));

    const merged = baseProducts.map((p) => {
      const override = rowMap.get(p.id);
      if (!override) return p;
      let parsedVariants = p.variants;
      try {
        parsedVariants = JSON.parse(override.variants_json);
      } catch {}
      return {
        ...p,
        title: override.title || p.title,
        category: override.category || p.category,
        price: Number(override.price) || p.price,
        description: override.description || p.description,
        images: override.image_url ? [override.image_url] : p.images,
        variants: parsedVariants
      };
    });

    const customRows = rows.filter((r) => r.is_custom && !baseProducts.some((b) => b.id === r.product_id));
    const customProducts = customRows.map((r) => {
      let parsedVariants = [];
      try {
        parsedVariants = JSON.parse(r.variants_json);
      } catch {}
      return {
        id: r.product_id,
        numericId: String(Date.now()).slice(-4),
        title: r.title,
        handle: r.handle,
        description: r.description || 'LARO SPORTS™ Official Streetwear Drop.',
        descriptionHtml: `<p><strong>LARO SPORTS™ — PAIN STAIN 2025</strong></p><p>${r.description || ''}</p>`,
        tags: [r.category, 'PAIN STAIN 2025'],
        price: Number(r.price) || 400,
        currencyCode: 'PHP',
        images: [r.image_url || '/brand/basiclogo_nobg.png'],
        variants: parsedVariants,
        category: r.category,
        isCustom: true
      };
    });

    return [...customProducts, ...merged];
  }

  // Fallback store
  const store = loadFallbackStore();
  const overrides = store.products_overrides || {};
  const merged = baseProducts.map((p) => {
    const ov = overrides[p.id];
    if (!ov) return p;
    return {
      ...p,
      ...ov,
      price: Number(ov.price ?? p.price),
      variants: ov.variants || p.variants
    };
  });

  return [...(store.custom_products || []), ...merged];
}

export async function updateProductInventory({ productId, title, category, price, variants }) {
  const catalog = await getCatalogProducts();
  const existing = catalog.find((p) => p.id === productId);
  if (!existing) throw new Error('Product not found');

  const updatedTitle = title !== undefined ? title : existing.title;
  const updatedCategory = category !== undefined ? category : existing.category;
  const updatedPrice = price !== undefined ? Number(price) : Number(existing.price);

  const updatedVariants = (variants || existing.variants).map((v) => {
    const stock = Math.max(0, Number(v.stock ?? (v.availableForSale ? 15 : 0)));
    return {
      ...v,
      price: updatedPrice,
      stock,
      availableForSale: stock > 0
    };
  });

  const db = await getPool();
  if (db) {
    await db.query(
      `INSERT INTO \`products_inventory\` (
        \`product_id\`, \`title\`, \`handle\`, \`category\`, \`price\`, \`image_url\`, \`description\`, \`variants_json\`, \`is_custom\`
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        \`title\` = VALUES(\`title\`),
        \`category\` = VALUES(\`category\`),
        \`price\` = VALUES(\`price\`),
        \`variants_json\` = VALUES(\`variants_json\`)`,
      [
        productId,
        updatedTitle,
        existing.handle,
        updatedCategory,
        updatedPrice,
        existing.images?.[0] || '',
        existing.description || '',
        JSON.stringify(updatedVariants),
        existing.isCustom ? 1 : 0
      ]
    );
    return true;
  }

  const store = loadFallbackStore();
  const customIdx = (store.custom_products || []).findIndex((c) => c.id === productId);
  if (customIdx > -1) {
    store.custom_products[customIdx] = {
      ...store.custom_products[customIdx],
      title: updatedTitle,
      category: updatedCategory,
      price: updatedPrice,
      variants: updatedVariants
    };
  } else {
    store.products_overrides = store.products_overrides || {};
    store.products_overrides[productId] = {
      title: updatedTitle,
      category: updatedCategory,
      price: updatedPrice,
      variants: updatedVariants
    };
  }
  saveFallbackStore(store);
  return true;
}

export async function addCustomProduct({
  title,
  category = 'T-Shirts',
  price = 400,
  imageUrl = '/brand/basiclogo_nobg.png',
  description = 'Product Details: Fabric: Premium Cotton 230-240 GSM. Oversized Boxy Fit.',
  stockPerSize = { S: 15, M: 15, L: 15, XL: 15 }
}) {
  const cleanTitle = String(title || 'New Streetwear Item').trim();
  const handle = cleanTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);
  const productId = `laro_custom_${Date.now()}`;
  const numPrice = Number(price) || 400;

  const sizeKeys = Object.keys(stockPerSize || { S: 15, M: 15, L: 15, XL: 15 });
  const variants = sizeKeys.map((sz) => {
    const st = Math.max(0, Number(stockPerSize[sz] ?? 15));
    return {
      id: `${handle}-${sz.toLowerCase()}`,
      title: sz,
      price: numPrice,
      stock: st,
      availableForSale: st > 0
    };
  });

  const db = await getPool();
  if (db) {
    await db.query(
      `INSERT INTO \`products_inventory\` (
        \`product_id\`, \`title\`, \`handle\`, \`category\`, \`price\`, \`image_url\`, \`description\`, \`variants_json\`, \`is_custom\`
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        productId,
        cleanTitle,
        handle,
        category,
        numPrice,
        imageUrl || '/brand/basiclogo_nobg.png',
        description,
        JSON.stringify(variants)
      ]
    );
    return { id: productId, handle };
  }

  const store = loadFallbackStore();
  store.custom_products = store.custom_products || [];
  store.custom_products.unshift({
    id: productId,
    numericId: String(Date.now()).slice(-4),
    title: cleanTitle,
    handle,
    description,
    descriptionHtml: `<p><strong>LARO SPORTS™ — PAIN STAIN 2025</strong></p><p>${description}</p>`,
    tags: [category, 'PAIN STAIN 2025'],
    price: numPrice,
    currencyCode: 'PHP',
    images: [imageUrl || '/brand/basiclogo_nobg.png'],
    variants,
    category,
    isCustom: true
  });
  saveFallbackStore(store);
  return { id: productId, handle };
}

export async function deleteCustomProduct(productId) {
  const db = await getPool();
  if (db) {
    await db.query('DELETE FROM `products_inventory` WHERE `product_id` = ?', [productId]);
    return true;
  }
  const store = loadFallbackStore();
  store.custom_products = (store.custom_products || []).filter((p) => p.id !== productId);
  if (store.products_overrides && store.products_overrides[productId]) {
    delete store.products_overrides[productId];
  }
  saveFallbackStore(store);
  return true;
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
  // Deduct stock for ordered items
  try {
    const catalog = await getCatalogProducts();
    for (const item of items) {
      const prod = catalog.find(
        (p) => p.id === item.productId || p.title === item.productTitle
      );
      if (prod && Array.isArray(prod.variants)) {
        const updatedVariants = prod.variants.map((v) => {
          if (v.title === item.variantTitle || v.id === item.productId) {
            const currentStock = typeof v.stock === 'number' ? v.stock : v.availableForSale ? 15 : 0;
            const nextStock = Math.max(0, currentStock - (Number(item.quantity) || 1));
            return { ...v, stock: nextStock, availableForSale: nextStock > 0 };
          }
          return v;
        });
        await updateProductInventory({
          productId: prod.id,
          variants: updatedVariants
        });
      }
    }
  } catch {
    // Continue order creation even if stock adjustment fails
  }

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
    const orderIds = orders.map((o) => o.id);
    const [items] = await db.query('SELECT * FROM `order_items` WHERE `order_id` IN (?)', [
      orderIds
    ]);

    return orders.map((order) => ({
      ...order,
      items: items.filter((i) => i.order_id === order.id)
    }));
  }

  const store = loadFallbackStore();
  let orders = store.orders;
  if (!isAdmin) {
    orders = store.orders.filter(
      (o) =>
        (userId && Number(o.user_id) === Number(userId)) ||
        (email && String(o.customer_email).toLowerCase() === String(email).toLowerCase())
    );
  }
  return orders.map((order) => ({
    ...order,
    items: store.order_items.filter((i) => Number(i.order_id) === Number(order.id))
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
  const idx = store.orders.findIndex((o) => Number(o.id) === Number(orderId));
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
  store.orders = store.orders.filter((o) => Number(o.id) !== Number(orderId));
  store.order_items = store.order_items.filter((i) => Number(i.order_id) !== Number(orderId));
  saveFallbackStore(store);
  return true;
}

export async function getDatabaseStatus() {
  const db = await getPool();
  return {
    connected: Boolean(db),
    engine: db ? 'XAMPP MySQL' : 'Local Store',
    database: DB_NAME,
    host: MYSQL_CONFIG.host,
    port: MYSQL_CONFIG.port
  };
}
