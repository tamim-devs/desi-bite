import { MongoClient, Db } from 'mongodb';
import fs from 'fs';
import path from 'path';
import type {
  Product,
  User,
  Sale,
  StockTransaction,
  PaymentRecord,
  AppNotification,
  AdminLog,
  BusinessSettings,
  MongoStatus,
} from '../src/types.ts';

interface DatabaseSchema {
  products: Product[];
  users: User[];
  sales: Sale[];
  stockTransactions: StockTransaction[];
  payments: PaymentRecord[];
  notifications: AppNotification[];
  logs: AdminLog[];
  settings: BusinessSettings;
}

// Writable storage directory helper (with safe fallback for read-only serverless filesystems like Vercel)
export function getWritableDataDir(): string {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const testFile = path.join(dataDir, '.write-test');
    fs.writeFileSync(testFile, 'ok', 'utf-8');
    fs.unlinkSync(testFile);
    return dataDir;
  } catch {
    // If process.cwd() is read-only (e.g. Vercel serverless environment), fallback to /tmp
    const tmpDir = path.join('/tmp', 'deshi_bite_data');
    if (!fs.existsSync(tmpDir)) {
      try {
        fs.mkdirSync(tmpDir, { recursive: true });
      } catch (e) {
        // ignore
      }
    }
    return tmpDir;
  }
}

const CONFIG_FILE = path.join(getWritableDataDir(), 'mongo_config.json');

// Global connection state cached across serverless lambda invocations
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let isConnected = false;
let lastError: string | null = null;
let activeUri: string = process.env.MONGODB_URI || '';
const DB_NAME = process.env.MONGODB_DB_NAME || 'deshi_bite';
let inFlightConnectPromise: Promise<{ success: boolean; message: string }> | null = null;

// Load saved URI if exists from writable config or /tmp fallback
try {
  const possibleConfigFiles = [
    CONFIG_FILE,
    path.join('/tmp', 'deshi_bite_data', 'mongo_config.json'),
    path.join(process.cwd(), 'data', 'mongo_config.json'),
  ];
  for (const cf of possibleConfigFiles) {
    if (fs.existsSync(cf)) {
      const raw = fs.readFileSync(cf, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.uri && !activeUri) {
        activeUri = parsed.uri;
        break;
      }
    }
  }
} catch (e) {
  // ignore
}

// If activeUri is still empty, inspect .env and .env.example files
if (!activeUri) {
  try {
    const envPaths = [path.join(process.cwd(), '.env'), path.join(process.cwd(), '.env.example')];
    for (const envPath of envPaths) {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        const match = content.match(/^MONGODB_URI=(.+)$/m);
        if (match && match[1] && !match[1].startsWith('your_') && match[1].trim() !== '') {
          activeUri = match[1].trim();
          break;
        }
      }
    }
  } catch (e) {
    // ignore
  }
}

export function maskMongoUri(uri: string): string {
  if (!uri) return '';
  return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/i, '$1*****$3');
}

export function getActiveUri(): string {
  return activeUri;
}

export function isMongoActive(): boolean {
  return isConnected && cachedDb !== null;
}

export async function connectMongo(customUri?: string): Promise<{ success: boolean; message: string }> {
  let uriToUse = customUri?.trim() || activeUri?.trim() || process.env.MONGODB_URI?.trim() || '';

  // Clean accidental wrapping quotes or spaces from copy-paste
  uriToUse = uriToUse.replace(/^["']|["']$/g, '').trim();

  if (!uriToUse) {
    try {
      const envPaths = [path.join(process.cwd(), '.env'), path.join(process.cwd(), '.env.example')];
      for (const envPath of envPaths) {
        if (fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, 'utf-8');
          const match = content.match(/^MONGODB_URI=(.+)$/m);
          if (match && match[1] && !match[1].startsWith('your_') && match[1].trim() !== '') {
            uriToUse = match[1].trim().replace(/^["']|["']$/g, '');
            break;
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }

  if (!uriToUse) {
    isConnected = false;
    lastError = 'No MongoDB URI configured. Running in local persistence mode.';
    return { success: false, message: lastError };
  }

  // If already connected with the same URI, verify connection and return immediately
  if (isConnected && cachedClient && cachedDb && activeUri === uriToUse) {
    try {
      await cachedDb.command({ ping: 1 });
      return { success: true, message: `Connected to MongoDB database "${cachedDb.databaseName}"` };
    } catch {
      // Ping failed, reconnect
      isConnected = false;
      cachedClient = null;
      cachedDb = null;
    }
  }

  // If connection is already in progress, await the ongoing promise to avoid duplicate connection pools
  if (inFlightConnectPromise) {
    return inFlightConnectPromise;
  }

  inFlightConnectPromise = (async () => {
    try {
      if (cachedClient) {
        try {
          await cachedClient.close();
        } catch (e) {
          // ignore
        }
      }

      console.log(`[MongoDB] Connecting to MongoDB Atlas (${maskMongoUri(uriToUse)})...`);

      // Determine target database name (extract from URI path if present, otherwise default to deshi_bite)
      let targetDbName = DB_NAME;
      try {
        const pseudoUrl = uriToUse.replace('mongodb+srv://', 'http://').replace('mongodb://', 'http://');
        const parsed = new URL(pseudoUrl);
        const extractedDb = parsed.pathname.replace(/^\//, '').split('?')[0].trim();
        if (extractedDb) {
          targetDbName = extractedDb;
        }
      } catch {
        // ignore
      }

      // Optimized timeouts for serverless / cloud deployments
      const client = new MongoClient(uriToUse, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        retryWrites: true,
        maxPoolSize: 10,
        minPoolSize: 0,
      });

      await client.connect();
      const testDb = client.db(targetDbName);
      await testDb.command({ ping: 1 });

      cachedClient = client;
      cachedDb = testDb;
      isConnected = true;
      lastError = null;
      activeUri = uriToUse;

      // Save configuration for local/preview persistence
      try {
        const dir = getWritableDataDir();
        const targetConfig = path.join(dir, 'mongo_config.json');
        fs.writeFileSync(
          targetConfig,
          JSON.stringify({ uri: uriToUse, dbName: targetDbName, updatedAt: new Date().toISOString() }),
          'utf-8'
        );
      } catch (e) {
        // ignore
      }

      console.log(`[MongoDB] Connected successfully to MongoDB Cloud database: "${targetDbName}"`);
      return { success: true, message: `Connected to MongoDB database "${targetDbName}" successfully!` };
    } catch (err: any) {
      isConnected = false;
      cachedClient = null;
      cachedDb = null;
      let errMsg = err.message || 'Failed to connect to MongoDB';
      if (
        errMsg.includes('Server selection timed out') ||
        errMsg.includes('ETIMEDOUT') ||
        errMsg.includes('ECONNREFUSED')
      ) {
        errMsg = `${errMsg}. Ensure that '0.0.0.0/0' (Allow Access From Anywhere) is added to your MongoDB Atlas Network Access IP whitelist.`;
      } else if (errMsg.includes('Authentication failed') || errMsg.includes('bad auth')) {
        errMsg = `${errMsg}. Check username and password. Special characters in password must be URL encoded.`;
      }
      lastError = errMsg;
      console.warn(`[MongoDB] Connection notice: ${lastError}`);
      return { success: false, message: lastError };
    } finally {
      inFlightConnectPromise = null;
    }
  })();

  return inFlightConnectPromise;
}

export async function getMongoStatus(): Promise<MongoStatus> {
  const dt = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka' });

  if (!isConnected || !cachedDb) {
    return {
      connected: false,
      database: DB_NAME,
      hasUri: Boolean(activeUri),
      maskedUri: maskMongoUri(activeUri),
      error: lastError,
      lastChecked: dt,
      source: 'local',
    };
  }

  try {
    const [productsCount, usersCount, salesCount, stockCount, paymentsCount, logsCount, notifsCount] = await Promise.all([
      cachedDb.collection('products').countDocuments(),
      cachedDb.collection('users').countDocuments(),
      cachedDb.collection('sales').countDocuments(),
      cachedDb.collection('stock_transactions').countDocuments(),
      cachedDb.collection('payments').countDocuments(),
      cachedDb.collection('logs').countDocuments(),
      cachedDb.collection('notifications').countDocuments(),
    ]);

    return {
      connected: true,
      database: cachedDb.databaseName || DB_NAME,
      hasUri: true,
      maskedUri: maskMongoUri(activeUri),
      error: null,
      lastChecked: dt,
      source: 'mongodb',
      counts: {
        products: productsCount,
        users: usersCount,
        sales: salesCount,
        stockTransactions: stockCount,
        payments: paymentsCount,
        logs: logsCount,
        notifications: notifsCount,
      },
    };
  } catch (err: any) {
    return {
      connected: false,
      database: DB_NAME,
      hasUri: Boolean(activeUri),
      maskedUri: maskMongoUri(activeUri),
      error: err.message || 'Error pinging MongoDB collections',
      lastChecked: dt,
      source: 'local',
    };
  }
}

// Push all local data into MongoDB (useful on initial connection or manual sync)
export async function pushAllToMongo(schema: DatabaseSchema): Promise<boolean> {
  if (!isConnected || !cachedDb) return false;

  try {
    const promises: Promise<any>[] = [];

    // Products
    if (schema.products && schema.products.length > 0) {
      const ops = schema.products.map((p) => ({
        replaceOne: {
          filter: { id: p.id },
          replacement: { ...p, _id: p.id as any },
          upsert: true,
        },
      }));
      promises.push(cachedDb.collection('products').bulkWrite(ops));
    }

    // Users
    if (schema.users && schema.users.length > 0) {
      const ops = schema.users.map((u) => ({
        replaceOne: {
          filter: { id: u.id },
          replacement: { ...u, _id: u.id as any },
          upsert: true,
        },
      }));
      promises.push(cachedDb.collection('users').bulkWrite(ops));
    }

    // Sales
    if (schema.sales && schema.sales.length > 0) {
      const ops = schema.sales.map((s) => ({
        replaceOne: {
          filter: { id: s.id },
          replacement: { ...s, _id: s.id as any },
          upsert: true,
        },
      }));
      promises.push(cachedDb.collection('sales').bulkWrite(ops));
    }

    // Stock Transactions
    if (schema.stockTransactions && schema.stockTransactions.length > 0) {
      const ops = schema.stockTransactions.map((st) => ({
        replaceOne: {
          filter: { id: st.id },
          replacement: { ...st, _id: st.id as any },
          upsert: true,
        },
      }));
      promises.push(cachedDb.collection('stock_transactions').bulkWrite(ops));
    }

    // Payments
    if (schema.payments && schema.payments.length > 0) {
      const ops = schema.payments.map((pm) => ({
        replaceOne: {
          filter: { id: pm.id },
          replacement: { ...pm, _id: pm.id as any },
          upsert: true,
        },
      }));
      promises.push(cachedDb.collection('payments').bulkWrite(ops));
    }

    // Notifications
    if (schema.notifications && schema.notifications.length > 0) {
      const ops = schema.notifications.map((n) => ({
        replaceOne: {
          filter: { id: n.id },
          replacement: { ...n, _id: n.id as any },
          upsert: true,
        },
      }));
      promises.push(cachedDb.collection('notifications').bulkWrite(ops));
    }

    // Logs
    if (schema.logs && schema.logs.length > 0) {
      const ops = schema.logs.map((l) => ({
        replaceOne: {
          filter: { id: l.id },
          replacement: { ...l, _id: l.id as any },
          upsert: true,
        },
      }));
      promises.push(cachedDb.collection('logs').bulkWrite(ops));
    }

    // Settings
    if (schema.settings) {
      promises.push(
        cachedDb.collection('settings').replaceOne(
          { _id: 'global_settings' as any },
          { ...schema.settings, _id: 'global_settings' as any },
          { upsert: true }
        )
      );
    }

    await Promise.all(promises);
    return true;
  } catch (err) {
    console.error('[MongoDB] Error pushing state to MongoDB:', err);
    return false;
  }
}

// Pull latest state from MongoDB
export async function pullAllFromMongo(): Promise<DatabaseSchema | null> {
  if (!isConnected || !cachedDb) return null;

  try {
    const [products, users, sales, stockTransactions, payments, notifications, logs, settingsDoc] = await Promise.all([
      cachedDb.collection('products').find().toArray(),
      cachedDb.collection('users').find().toArray(),
      cachedDb.collection('sales').find().sort({ timestamp: -1 }).toArray(),
      cachedDb.collection('stock_transactions').find().sort({ timestamp: -1 }).toArray(),
      cachedDb.collection('payments').find().sort({ timestamp: -1 }).toArray(),
      cachedDb.collection('notifications').find().sort({ timestamp: -1 }).toArray(),
      cachedDb.collection('logs').find().sort({ timestamp: -1 }).toArray(),
      cachedDb.collection('settings').findOne({ _id: 'global_settings' as any }),
    ]);

    // If collections are completely empty, return null so caller can seed initial products/admin
    if (products.length === 0 && users.length === 0) {
      return null;
    }

    return {
      products: products.map((p: any) => {
        const { _id, ...rest } = p;
        return rest as Product;
      }),
      users: users.map((u: any) => {
        const { _id, ...rest } = u;
        return rest as User;
      }),
      sales: sales.map((s: any) => {
        const { _id, ...rest } = s;
        return rest as Sale;
      }),
      stockTransactions: stockTransactions.map((st: any) => {
        const { _id, ...rest } = st;
        return rest as StockTransaction;
      }),
      payments: payments.map((pm: any) => {
        const { _id, ...rest } = pm;
        return rest as PaymentRecord;
      }),
      notifications: notifications.map((n: any) => {
        const { _id, ...rest } = n;
        return rest as AppNotification;
      }),
      logs: logs.map((l: any) => {
        const { _id, ...rest } = l;
        return rest as AdminLog;
      }),
      settings: settingsDoc
        ? (({ _id, ...s }: any) => s as BusinessSettings)(settingsDoc)
        : ({} as BusinessSettings),
    };
  } catch (err) {
    console.error('[MongoDB] Error pulling data from MongoDB:', err);
    return null;
  }
}

// Real-time write operations to MongoDB
export async function mongoUpsert(collectionName: string, id: string, doc: any): Promise<void> {
  if (!isConnected || !cachedDb) return;
  try {
    await cachedDb.collection(collectionName).replaceOne(
      { id },
      { ...doc, _id: id as any },
      { upsert: true }
    );
  } catch (err) {
    console.warn(`[MongoDB] Failed to upsert document in ${collectionName}:`, err);
  }
}

export async function mongoDelete(collectionName: string, id: string): Promise<void> {
  if (!isConnected || !cachedDb) return;
  try {
    await cachedDb.collection(collectionName).deleteOne({ id });
  } catch (err) {
    console.warn(`[MongoDB] Failed to delete document in ${collectionName}:`, err);
  }
}
