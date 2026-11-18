import 'dotenv/config';
import express, {type Request, type Response} from 'express';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.resolve(__dirname, 'data');
const ENQUIRIES_FILE = path.join(DATA_DIR, 'enquiries.json');

interface EnquiryRecord {
  id: string;
  timestamp: string;
  name: string;
  phone: string;
  email: string;
  programmeInterest: string;
  source: string;
  syncedToSheets: boolean;
}

// Simple in-memory sliding-window rate limiter per IP
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX_REQUESTS = 8;
const rateBuckets = new Map<string, number[]>();

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

function sanitizeCell(value: string): string {
  const trimmed = value.trim().slice(0, 240);
  // Neutralize spreadsheet formula prefixes
  if (/^[=+\-@\t\r]/.test(trimmed)) {
    return `'${trimmed}`;
  }
  return trimmed;
}

function isValidMalaysianPhone(raw: string): boolean {
  const cleaned = raw.replace(/[\s\-()]/g, '');
  // Accepts 01X-XXXXXXX / 011-XXXXXXXX / 0X-XXXXXXX / +601... / 601...
  return /^(?:\+?60|0)(?:1\d{8,9}|[2-9]\d{7,8})$/.test(cleaned);
}

function isValidEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw.trim());
}

function persistEnquiry(record: EnquiryRecord): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {recursive: true});
  }
  let existing: EnquiryRecord[] = [];
  if (fs.existsSync(ENQUIRIES_FILE)) {
    try {
      const raw = fs.readFileSync(ENQUIRIES_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        existing = parsed;
      }
    } catch {
      existing = [];
    }
  }
  existing.push(record);
  fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify(existing, null, 2), 'utf8');
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

  app.post('/api/enquiries', async (req: Request, res: Response) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (isRateLimited(clientIp)) {
      res.status(429).json({
        ok: false,
        error: 'Terlalu banyak percubaan dalam masa singkat. Sila cuba sebentar lagi atau hubungi penasihat kami melalui WhatsApp.',
      });
      return;
    }

    const body = req.body ?? {};
    // Honeypot check: silently reject automated spam without storing
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
    let sheetsConfigured = Boolean(sheetsEndpoint);

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
    };

    try {
      persistEnquiry(record);
    } catch (err) {
      console.error('Failed to persist enquiry record:', err);
      res.status(500).json({
        ok: false,
        error: 'Maaf, berlaku ralat semasa merekodkan pertanyaan anda. Sila hubungi kami melalui WhatsApp.',
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
