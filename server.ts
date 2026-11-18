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

const DEFAULT_DEV_ADMIN_KEY = 'gis-admin-2026';

// In-memory sliding-window rate limiters per IP
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX_REQUESTS = 8;
const rateBuckets = new Map<string, number[]>();

const ADMIN_FAIL_WINDOW_MS = 15 * 60 * 1000;
const ADMIN_MAX_FAILS = 15;
const adminFailBuckets = new Map<string, number[]>();

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
  // Neutralize spreadsheet formula prefixes
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

function getConfiguredAdminKey(): {key: string; usingDefault: boolean} {
  const envKey = process.env.ADMIN_API_KEY?.trim();
  if (envKey) {
    return {key: envKey, usingDefault: false};
  }
  return {key: DEFAULT_DEV_ADMIN_KEY, usingDefault: true};
}

function timingSafeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

function extractAdminKey(req: Request): string {
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

function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (isAdminRateLimited(clientIp)) {
    res.status(429).json({
      ok: false,
      error: 'Terlalu banyak cubaan log masuk gagal. Sila tunggu sebentar sebelum mencuba lagi.',
    });
    return;
  }

  const supplied = extractAdminKey(req);
  const {key: expected} = getConfiguredAdminKey();

  if (!supplied || !timingSafeEquals(supplied, expected)) {
    recordAdminFailure(clientIp);
    res.status(401).json({
      ok: false,
      error: 'Akses tidak dibenarkan. Sila masukkan kunci pentadbir yang sah.',
    });
    return;
  }

  clearAdminFailures(clientIp);
  next();
}

async function startServer() {
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

  // Protected CRM admin endpoints
  app.get('/api/admin/enquiries', requireAdminAuth, (_req: Request, res: Response) => {
    const records = readEnquiries().sort((a, b) =>
      b.timestamp.localeCompare(a.timestamp)
    );
    const {usingDefault} = getConfiguredAdminKey();

    res.json({
      ok: true,
      enquiries: records,
      usingDefaultAdminKey: usingDefault,
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
