import crypto from 'crypto';
import 'dotenv/config';
import express, {type NextFunction, type Request, type Response} from 'express';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.resolve(__dirname, 'data');
const ENQUIRIES_FILE = path.join(DATA_DIR, 'enquiries.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

export const LEAD_STATUSES = [
  'Baru',
  'Sedang Dihubungi',
  'Berjaya Daftar',
  'Tidak Berminat',
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

interface EnquiryRecord {
  id: string;
  timestamp: string;
  name: string;
  phone: string;
  email: string;
  programmeInterest: string;
  source: string;
  syncedToSheets: boolean;
  status: LeadStatus;
  notes: string;
  updatedAt?: string;
}

interface StaffUserRecord {
  id: string;
  fullName: string;
  username: string;
  passwordHash: string;
  createdAt: string;
  isDefault?: boolean;
}

interface AuthenticatedRequest extends Request {
  staffUser?: {
    username: string;
    fullName: string;
  };
}

const DEFAULT_ADMIN_USERNAME = 'ghaz';
const DEFAULT_ADMIN_PASSWORD = '1234';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

// In-memory sliding-window rate limiters per IP
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX_REQUESTS = 8;
const rateBuckets = new Map<string, number[]>();

const ADMIN_FAIL_WINDOW_MS = 15 * 60 * 1000;
const ADMIN_MAX_FAILS = 15;
const adminFailBuckets = new Map<string, number[]>();

const SIGNUP_WINDOW_MS = 15 * 60 * 1000;
const SIGNUP_MAX_REQUESTS = 10;
const signupBuckets = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateBuckets.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (timestamps.length >= RATE_MAX_REQUESTS) {
    rateBuckets.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  rateBuckets.set(ip, timestamps);
  return false;
}

function isSignupRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (signupBuckets.get(ip) || []).filter((t) => now - t < SIGNUP_WINDOW_MS);
  if (timestamps.length >= SIGNUP_MAX_REQUESTS) {
    signupBuckets.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  signupBuckets.set(ip, timestamps);
  return false;
}

function isAdminRateLimited(ip: string): boolean {
  const now = Date.now();
  const fails = (adminFailBuckets.get(ip) || []).filter((t) => now - t < ADMIN_FAIL_WINDOW_MS);
  adminFailBuckets.set(ip, fails);
  return fails.length >= ADMIN_MAX_FAILS;
}

function recordAdminFailure(ip: string): void {
  const now = Date.now();
  const fails = (adminFailBuckets.get(ip) || []).filter((t) => now - t < ADMIN_FAIL_WINDOW_MS);
  fails.push(now);
  adminFailBuckets.set(ip, fails);
}

function clearAdminFailures(ip: string): void {
  adminFailBuckets.delete(ip);
}

function sanitizeCell(value: string, maxLength = 240): string {
  const trimmed = value.trim().slice(0, maxLength);
  if (/^[=+\-@\t\r]/.test(trimmed)) {
    return `'${trimmed}`;
  }
  return trimmed;
}

function isValidMalaysianPhone(raw: string): boolean {
  const cleaned = raw.replace(/[\s\-()]/g, '');
  return /^(?:\+?60|0)(?:1\d{8,9}|[2-9]\d{7,8})$/.test(cleaned);
}

function isValidEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw.trim());
}

function isValidLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === 'string' && (LEAD_STATUSES as readonly string[]).includes(value);
}

function normalizeRecord(raw: Partial<EnquiryRecord>): EnquiryRecord {
  return {
    id: typeof raw.id === 'string' ? raw.id : `GIS-${Date.now().toString(36).toUpperCase()}`,
    timestamp: typeof raw.timestamp === 'string' ? raw.timestamp : new Date().toISOString(),
    name: typeof raw.name === 'string' ? raw.name : '',
    phone: typeof raw.phone === 'string' ? raw.phone : '',
    email: typeof raw.email === 'string' ? raw.email : '',
    programmeInterest:
      typeof raw.programmeInterest === 'string' && raw.programmeInterest.trim()
        ? raw.programmeInterest
        : 'Pertanyaan Umum',
    source: typeof raw.source === 'string' && raw.source.trim() ? raw.source : 'Laman Utama GIS',
    syncedToSheets: Boolean(raw.syncedToSheets),
    status: isValidLeadStatus(raw.status) ? raw.status : 'Baru',
    notes: typeof raw.notes === 'string' ? raw.notes : '',
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : undefined,
  };
}

function readEnquiries(): EnquiryRecord[] {
  if (!fs.existsSync(ENQUIRIES_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(ENQUIRIES_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map((item) => normalizeRecord(item));
  } catch {
    return [];
  }
}

function writeEnquiries(records: EnquiryRecord[]): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {recursive: true});
  }
  fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify(records, null, 2), 'utf8');
}

function persistEnquiry(record: EnquiryRecord): void {
  const existing = readEnquiries();
  existing.push(record);
  writeEnquiries(existing);
}

function timingSafeEquals(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a, 'utf8').digest();
  const hashB = crypto.createHash('sha256').update(b, 'utf8').digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  if (!salt || !keyHex) return false;
  try {
    const expectedBuffer = Buffer.from(keyHex, 'hex');
    const actualBuffer = crypto.scryptSync(password, salt, 64);
    if (expectedBuffer.length !== actualBuffer.length) return false;
    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  } catch {
    return false;
  }
}

function getDefaultEnvAdmin(): {
  username: string;
  password: string;
  usingDefault: boolean;
} {
  const envUser = process.env.ADMIN_USERNAME?.trim();
  const envPass = process.env.ADMIN_PASSWORD?.trim();
  return {
    username: envUser || DEFAULT_ADMIN_USERNAME,
    password: envPass || DEFAULT_ADMIN_PASSWORD,
    usingDefault: !envUser && !envPass,
  };
}

function ensureUsersSeeded(): StaffUserRecord[] {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {recursive: true});
  }

  let users: StaffUserRecord[] = [];
  if (fs.existsSync(USERS_FILE)) {
    try {
      const raw = fs.readFileSync(USERS_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        users = parsed.filter(
          (u): u is StaffUserRecord =>
            Boolean(u) &&
            typeof u.username === 'string' &&
            typeof u.passwordHash === 'string' &&
            typeof u.fullName === 'string'
        );
      }
    } catch {
      users = [];
    }
  }

  if (users.length === 0) {
    const {username, password} = getDefaultEnvAdmin();
    const defaultAdmin: StaffUserRecord = {
      id: 'STAFF-ADMIN-DEFAULT',
      fullName: 'Pentadbir GIS',
      username,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
      isDefault: true,
    };
    users = [defaultAdmin];
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  }

  return users;
}

function readUsers(): StaffUserRecord[] {
  return ensureUsersSeeded();
}

function writeUsers(users: StaffUserRecord[]): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {recursive: true});
  }
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

function getSigningSecret(): string {
  const {username, password} = getDefaultEnvAdmin();
  const explicitSecret = process.env.ADMIN_SESSION_SECRET?.trim();
  return crypto
    .createHash('sha256')
    .update(explicitSecret || `gis-crm-signing:${username}:${password}`)
    .digest('hex');
}

function issueSessionToken(user: {username: string; fullName: string}): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const nonce = crypto.randomBytes(12).toString('hex');
  const payload = Buffer.from(
    JSON.stringify({
      username: user.username,
      fullName: user.fullName,
      expiresAt,
      nonce,
    }),
    'utf8'
  ).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSigningSecret())
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

function verifySessionToken(token: string): {username: string; fullName: string} | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  if (!payload || !signature) return null;

  const expectedSig = crypto
    .createHmac('sha256', getSigningSecret())
    .update(payload)
    .digest('base64url');

  if (!timingSafeEquals(signature, expectedSig)) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      username?: unknown;
      fullName?: unknown;
      expiresAt?: unknown;
    };
    if (
      typeof decoded.username !== 'string' ||
      typeof decoded.expiresAt !== 'number' ||
      Date.now() > decoded.expiresAt
    ) {
      return null;
    }

    const users = readUsers();
    const matchedUser = users.find(
      (u) => u.username.toLowerCase() === decoded.username?.toString().toLowerCase()
    );
    const envAdmin = getDefaultEnvAdmin();
    const isEnvAdmin =
      decoded.username.toLowerCase() === envAdmin.username.toLowerCase();

    if (!matchedUser && !isEnvAdmin) {
      return null;
    }

    return {
      username: matchedUser?.username || envAdmin.username,
      fullName:
        matchedUser?.fullName ||
        (typeof decoded.fullName === 'string' && decoded.fullName) ||
        envAdmin.username,
    };
  } catch {
    return null;
  }
}

function extractAdminToken(req: Request): string {
  const headerKey = req.header('x-admin-key');
  if (typeof headerKey === 'string' && headerKey.trim()) {
    return headerKey.trim();
  }
  const authHeader = req.header('authorization');
  if (typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }
  return '';
}

function requireAdminAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (isAdminRateLimited(clientIp)) {
    res.status(429).json({
      ok: false,
      error: 'Terlalu banyak cubaan log masuk gagal. Sila tunggu sebentar sebelum mencuba lagi.',
    });
    return;
  }

  const token = extractAdminToken(req);
  const verified = token ? verifySessionToken(token) : null;

  if (!verified) {
    recordAdminFailure(clientIp);
    res.status(401).json({
      ok: false,
      error: 'Sesi tidak sah atau telah tamat. Sila log masuk semula.',
    });
    return;
  }

  clearAdminFailures(clientIp);
  req.staffUser = verified;
  next();
}

async function startServer() {
  // Ensure data/users.json exists with hashed default admin credentials on startup
  ensureUsersSeeded();

  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({limit: '32kb'}));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      sheetsConfigured: Boolean(process.env.GOOGLE_APPS_SCRIPT_WEB_APP_URL?.trim()),
    });
  });

  // Public lead submission endpoint
  app.post('/api/enquiries', async (req: Request, res: Response) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (isRateLimited(clientIp)) {
      res.status(429).json({
        ok: false,
        error:
          'Terlalu banyak percubaan dalam masa singkat. Sila cuba sebentar lagi atau hubungi penasihat kami melalui WhatsApp.',
      });
      return;
    }

    const body = req.body ?? {};
    if (typeof body.website === 'string' && body.website.trim().length > 0) {
      res.status(400).json({
        ok: false,
        error: 'Permintaan tidak sah.',
      });
      return;
    }

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const programmeInterest =
      typeof body.programmeInterest === 'string' && body.programmeInterest.trim().length > 0
        ? body.programmeInterest.trim()
        : 'Pertanyaan Umum';
    const source =
      typeof body.source === 'string' && body.source.trim().length > 0
        ? body.source.trim()
        : 'Laman Utama GIS';

    if (name.length < 2 || name.length > 120) {
      res.status(400).json({
        ok: false,
        field: 'name',
        error: 'Sila masukkan nama penuh yang sah (sekurang-kurangnya 2 aksara).',
      });
      return;
    }

    if (!isValidMalaysianPhone(phone)) {
      res.status(400).json({
        ok: false,
        field: 'phone',
        error: 'Sila masukkan nombor telefon Malaysia yang sah (contoh: 012-3456789).',
      });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({
        ok: false,
        field: 'email',
        error: 'Sila masukkan alamat e-mel yang sah.',
      });
      return;
    }

    const referenceId = `GIS-${Date.now().toString(36).toUpperCase()}`;
    const timestamp = new Date().toISOString();

    const payload = {
      timestamp,
      name: sanitizeCell(name),
      phone: sanitizeCell(phone),
      email: sanitizeCell(email),
      source: sanitizeCell(source),
      programmeInterest: sanitizeCell(programmeInterest),
    };

    const sheetsEndpoint = process.env.GOOGLE_APPS_SCRIPT_WEB_APP_URL?.trim() || '';
    let syncedToSheets = false;
    const sheetsConfigured = Boolean(sheetsEndpoint);

    if (sheetsEndpoint) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        const upstream = await fetch(sheetsEndpoint, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (upstream.ok) {
          const text = await upstream.text();
          try {
            const parsed = JSON.parse(text);
            syncedToSheets = Boolean(parsed?.ok || parsed?.status === 'saved');
          } catch {
            syncedToSheets = false;
          }
        }
      } catch (err) {
        console.error('Google Sheets forwarding failed:', err);
        syncedToSheets = false;
      }
    }

    const record: EnquiryRecord = {
      id: referenceId,
      timestamp,
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      programmeInterest: payload.programmeInterest,
      source: payload.source,
      syncedToSheets,
      status: 'Baru',
      notes: '',
    };

    try {
      persistEnquiry(record);
    } catch (err) {
      console.error('Failed to persist enquiry record:', err);
      res.status(500).json({
        ok: false,
        error:
          'Maaf, berlaku ralat semasa merekodkan pertanyaan anda. Sila hubungi kami melalui WhatsApp.',
      });
      return;
    }

    res.status(201).json({
      ok: true,
      referenceId,
      savedLocally: true,
      sheetsConfigured,
      syncedToSheets,
    });
  });

  // Direct user sign up endpoint (rate-limited; no invite code required)
  app.post('/api/admin/signup', (req: Request, res: Response) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (isAdminRateLimited(clientIp) || isSignupRateLimited(clientIp)) {
      res.status(429).json({
        ok: false,
        error: 'Terlalu banyak cubaan pendaftaran dalam masa singkat. Sila tunggu sebentar.',
      });
      return;
    }

    const body = req.body ?? {};
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (fullName.length < 2 || fullName.length > 100) {
      res.status(400).json({
        ok: false,
        error: 'Sila masukkan nama penuh yang sah (sekurang-kurangnya 2 aksara).',
      });
      return;
    }

    if (!/^[a-zA-Z0-9]{3,40}$/.test(username)) {
      res.status(400).json({
        ok: false,
        error:
          'Nama pengguna mestilah sekurang-kurangnya 3 aksara dan hanya menggunakan huruf serta nombor sahaja.',
      });
      return;
    }

    if (password.length < 4 || password.length > 128) {
      res.status(400).json({
        ok: false,
        error: 'Kata laluan mestilah sekurang-kurangnya 4 aksara.',
      });
      return;
    }

    const users = readUsers();
    const envAdmin = getDefaultEnvAdmin();
    const duplicate =
      users.some((u) => u.username.toLowerCase() === username.toLowerCase()) ||
      envAdmin.username.toLowerCase() === username.toLowerCase();

    if (duplicate) {
      res.status(409).json({
        ok: false,
        error: 'Nama pengguna ini telah didaftarkan. Sila pilih nama pengguna lain.',
      });
      return;
    }

    const newUser: StaffUserRecord = {
      id: `STAFF-${Date.now().toString(36).toUpperCase()}`,
      fullName: fullName.slice(0, 100),
      username,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
      isDefault: false,
    };

    try {
      writeUsers([...users, newUser]);
    } catch (err) {
      console.error('Failed to persist staff user:', err);
      res.status(500).json({
        ok: false,
        error: 'Gagal menyimpan akaun staf baharu pada pelayan.',
      });
      return;
    }

    clearAdminFailures(clientIp);
    const token = issueSessionToken({
      username: newUser.username,
      fullName: newUser.fullName,
    });

    res.status(201).json({
      ok: true,
      token,
      username: newUser.username,
      fullName: newUser.fullName,
      usingDefaultAdminCredentials: false,
      message: `Akaun staf untuk ${newUser.fullName} berjaya didaftarkan.`,
    });
  });

  // Admin login endpoint (checks data/users.json + env default admin -> signed session token)
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (isAdminRateLimited(clientIp)) {
      res.status(429).json({
        ok: false,
        error: 'Terlalu banyak cubaan log masuk gagal. Sila tunggu sebentar sebelum mencuba lagi.',
      });
      return;
    }

    const body = req.body ?? {};
    const suppliedUser = typeof body.username === 'string' ? body.username.trim() : '';
    const suppliedPass = typeof body.password === 'string' ? body.password : '';

    if (!suppliedUser || !suppliedPass) {
      res.status(400).json({
        ok: false,
        error: 'Sila masukkan nama pengguna dan kata laluan.',
      });
      return;
    }

    const users = readUsers();
    const matchedUser = users.find(
      (u) => u.username.toLowerCase() === suppliedUser.toLowerCase()
    );
    const envAdmin = getDefaultEnvAdmin();

    let authenticatedUser: {username: string; fullName: string; isDefault: boolean} | null = null;

    if (matchedUser && verifyPassword(suppliedPass, matchedUser.passwordHash)) {
      authenticatedUser = {
        username: matchedUser.username,
        fullName: matchedUser.fullName,
        isDefault: Boolean(matchedUser.isDefault),
      };
    } else if (
      timingSafeEquals(suppliedUser.toLowerCase(), envAdmin.username.toLowerCase()) &&
      timingSafeEquals(suppliedPass, envAdmin.password)
    ) {
      authenticatedUser = {
        username: envAdmin.username,
        fullName: matchedUser?.fullName || 'Pentadbir GIS',
        isDefault: envAdmin.usingDefault,
      };
    }

    if (!authenticatedUser) {
      recordAdminFailure(clientIp);
      res.status(401).json({
        ok: false,
        error: 'Nama pengguna atau kata laluan tidak sah.',
      });
      return;
    }

    clearAdminFailures(clientIp);
    const token = issueSessionToken({
      username: authenticatedUser.username,
      fullName: authenticatedUser.fullName,
    });

    res.json({
      ok: true,
      token,
      username: authenticatedUser.username,
      fullName: authenticatedUser.fullName,
      usingDefaultAdminCredentials: authenticatedUser.isDefault && envAdmin.usingDefault,
    });
  });

  // Protected CRM admin endpoints
  app.get('/api/admin/enquiries', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
    const records = readEnquiries().sort((a, b) =>
      b.timestamp.localeCompare(a.timestamp)
    );
    const {usingDefault} = getDefaultEnvAdmin();

    res.json({
      ok: true,
      enquiries: records,
      staffUser: req.staffUser,
      usingDefaultAdminCredentials:
        usingDefault && req.staffUser?.username === getDefaultEnvAdmin().username,
    });
  });

  app.patch('/api/admin/enquiries/:id', requireAdminAuth, (req: Request, res: Response) => {
    const {id} = req.params;
    const body = req.body ?? {};

    const hasStatus = Object.prototype.hasOwnProperty.call(body, 'status');
    const hasNotes = Object.prototype.hasOwnProperty.call(body, 'notes');

    if (!hasStatus && !hasNotes) {
      res.status(400).json({
        ok: false,
        error: 'Sila nyatakan status atau nota untuk dikemas kini.',
      });
      return;
    }

    if (hasStatus && !isValidLeadStatus(body.status)) {
      res.status(400).json({
        ok: false,
        error: `Status tidak sah. Pilihan dibenarkan: ${LEAD_STATUSES.join(', ')}.`,
      });
      return;
    }

    if (hasNotes && typeof body.notes !== 'string') {
      res.status(400).json({
        ok: false,
        error: 'Format nota tidak sah.',
      });
      return;
    }

    const records = readEnquiries();
    const targetIndex = records.findIndex((item) => item.id === id);

    if (targetIndex === -1) {
      res.status(404).json({
        ok: false,
        error: 'Rekod pertanyaan tidak dijumpai.',
      });
      return;
    }

    const current = records[targetIndex];
    const updated: EnquiryRecord = {
      ...current,
      status: hasStatus ? (body.status as LeadStatus) : current.status,
      notes: hasNotes ? sanitizeCell(body.notes, 500) : current.notes,
      updatedAt: new Date().toISOString(),
    };

    records[targetIndex] = updated;

    try {
      writeEnquiries(records);
    } catch (err) {
      console.error('Failed to update enquiry record:', err);
      res.status(500).json({
        ok: false,
        error: 'Gagal menyimpan perubahan rekod pada pelayan.',
      });
      return;
    }

    res.json({
      ok: true,
      enquiry: updated,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const {createServer: createViteServer} = await import('vite');
    const vite = await createViteServer({
      server: {middlewareMode: true},
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GIS Landing Page server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});
