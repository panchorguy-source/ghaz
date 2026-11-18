import {useCallback, useEffect, useMemo, useState, type FormEvent} from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogOut,
  MessageCircle,
  RefreshCw,
  Search,
  StickyNote,
  UserPlus,
} from 'lucide-react';

export type LeadStatus =
  | 'Baru'
  | 'Sedang Dihubungi'
  | 'Berjaya Daftar'
  | 'Tidak Berminat';

export interface AdminEnquiry {
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

interface AdminDashboardProps {
  onNavigateHome: () => void;
}

type AuthMode = 'login' | 'signup';

const LEAD_STATUS_OPTIONS: LeadStatus[] = [
  'Baru',
  'Sedang Dihubungi',
  'Berjaya Daftar',
  'Tidak Berminat',
];

const SESSION_TOKEN_STORAGE = 'gis_crm_admin_token';
const SESSION_USER_STORAGE = 'gis_crm_admin_username';
const SESSION_FULLNAME_STORAGE = 'gis_crm_admin_fullname';

function statusBadgeStyle(status: LeadStatus): string {
  switch (status) {
    case 'Baru':
      return 'border-blue-200 bg-blue-50 text-blue-900';
    case 'Sedang Dihubungi':
      return 'border-amber-200 bg-amber-50 text-amber-900';
    case 'Berjaya Daftar':
      return 'border-emerald-200 bg-emerald-50 text-emerald-900';
    case 'Tidak Berminat':
      return 'border-slate-200 bg-slate-100 text-slate-700';
  }
}

function formatMalaysianDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('ms-MY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function toWhatsAppPhoneLink(rawPhone: string, name: string, programme: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  let intl = digits;
  if (digits.startsWith('0')) {
    intl = `60${digits.slice(1)}`;
  } else if (!digits.startsWith('60')) {
    intl = `60${digits}`;
  }
  const text = encodeURIComponent(
    `Salam sejahtera ${name}, saya penasihat pengajian daripada Global Institute of Studies (GIS) Nilai berhubung pertanyaan anda bagi ${programme}.`
  );
  return `https://wa.me/${intl}?text=${text}`;
}

export function AdminDashboard({onNavigateHome}: AdminDashboardProps) {
  const [sessionToken, setSessionToken] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return sessionStorage.getItem(SESSION_TOKEN_STORAGE) || '';
  });
  const [signedInUser, setSignedInUser] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return sessionStorage.getItem(SESSION_USER_STORAGE) || '';
  });
  const [signedInFullName, setSignedInFullName] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return sessionStorage.getItem(SESSION_FULLNAME_STORAGE) || '';
  });

  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // Login fields
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign up fields (3 fields only)
  const [signupFullName, setSignupFullName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [welcomeBanner, setWelcomeBanner] = useState('');

  const [enquiries, setEnquiries] = useState<AdminEnquiry[]>([]);
  const [usingDefaultCredentials, setUsingDefaultCredentials] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [actionError, setActionError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | LeadStatus>('Semua');
  const [programmeFilter, setProgrammeFilter] = useState('Semua');

  // Inline note editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedNoticeId, setSavedNoticeId] = useState<string | null>(null);

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(SESSION_TOKEN_STORAGE);
    sessionStorage.removeItem(SESSION_USER_STORAGE);
    sessionStorage.removeItem(SESSION_FULLNAME_STORAGE);
    setSessionToken('');
    setSignedInUser('');
    setSignedInFullName('');
    setWelcomeBanner('');
    setEnquiries([]);
  }, []);

  const fetchEnquiries = useCallback(
    async (tokenToUse: string) => {
      setLoading(true);
      setActionError('');
      try {
        const response = await fetch('/api/admin/enquiries', {
          headers: {
            Authorization: `Bearer ${tokenToUse}`,
            'x-admin-key': tokenToUse,
          },
        });
        const data = await response.json().catch(() => null);

        if (response.status === 401 || response.status === 429) {
          clearSession();
          setAuthError(
            data?.error || 'Sesi log masuk tamat. Sila log masuk semula.'
          );
          return false;
        }

        if (!response.ok || !data?.ok) {
          setActionError(
            data?.error || 'Gagal memuatkan senarai pertanyaan daripada pelayan.'
          );
          return false;
        }

        setEnquiries(Array.isArray(data.enquiries) ? data.enquiries : []);
        setUsingDefaultCredentials(Boolean(data.usingDefaultAdminCredentials));
        if (data.staffUser?.fullName) {
          setSignedInFullName(data.staffUser.fullName);
          sessionStorage.setItem(SESSION_FULLNAME_STORAGE, data.staffUser.fullName);
        }
        if (data.staffUser?.username) {
          setSignedInUser(data.staffUser.username);
          sessionStorage.setItem(SESSION_USER_STORAGE, data.staffUser.username);
        }
        return true;
      } catch {
        setActionError('Ralat rangkaian semasa menghubungi pelayan.');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [clearSession]
  );

  useEffect(() => {
    if (sessionToken) {
      void fetchEnquiries(sessionToken);
    }
  }, [sessionToken, fetchEnquiries]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedUser = usernameInput.trim();
    if (!trimmedUser || !passwordInput) {
      setAuthError('Sila masukkan nama pengguna dan kata laluan.');
      return;
    }

    setLoading(true);
    setAuthError('');
    setActionError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          username: trimmedUser,
          password: passwordInput,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok || typeof data.token !== 'string') {
        setAuthError(
          data?.error || 'Nama pengguna atau kata laluan tidak sah.'
        );
        return;
      }

      const resolvedUsername = data.username || trimmedUser;
      const resolvedFullName = data.fullName || resolvedUsername;

      sessionStorage.setItem(SESSION_TOKEN_STORAGE, data.token);
      sessionStorage.setItem(SESSION_USER_STORAGE, resolvedUsername);
      sessionStorage.setItem(SESSION_FULLNAME_STORAGE, resolvedFullName);
      setSessionToken(data.token);
      setSignedInUser(resolvedUsername);
      setSignedInFullName(resolvedFullName);
      setUsingDefaultCredentials(Boolean(data.usingDefaultAdminCredentials));
      setWelcomeBanner('');
      setPasswordInput('');
    } catch {
      setAuthError('Ralat rangkaian semasa mengesahkan log masuk.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fullName = signupFullName.trim();
    const username = signupUsername.trim();

    if (fullName.length < 2) {
      setAuthError('Sila masukkan nama penuh (sekurang-kurangnya 2 aksara).');
      return;
    }
    if (!/^[a-zA-Z0-9]{3,40}$/.test(username)) {
      setAuthError(
        'Nama pengguna mestilah sekurang-kurangnya 3 aksara dan hanya menggunakan huruf serta nombor sahaja.'
      );
      return;
    }
    if (signupPassword.length < 4) {
      setAuthError('Kata laluan mestilah sekurang-kurangnya 4 aksara.');
      return;
    }

    setLoading(true);
    setAuthError('');
    setActionError('');

    try {
      const response = await fetch('/api/admin/signup', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          fullName,
          username,
          password: signupPassword,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok || typeof data.token !== 'string') {
        setAuthError(
          data?.error || 'Pendaftaran akaun gagal. Sila semak maklumat anda.'
        );
        return;
      }

      const resolvedUsername = data.username || username;
      const resolvedFullName = data.fullName || fullName;

      sessionStorage.setItem(SESSION_TOKEN_STORAGE, data.token);
      sessionStorage.setItem(SESSION_USER_STORAGE, resolvedUsername);
      sessionStorage.setItem(SESSION_FULLNAME_STORAGE, resolvedFullName);
      setSessionToken(data.token);
      setSignedInUser(resolvedUsername);
      setSignedInFullName(resolvedFullName);
      setUsingDefaultCredentials(false);
      setWelcomeBanner(
        data.message || `Akaun untuk ${resolvedFullName} berjaya didaftarkan.`
      );
      setSignupFullName('');
      setSignupUsername('');
      setSignupPassword('');
    } catch {
      setAuthError('Ralat rangkaian semasa mendaftarkan akaun baharu.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    setUsernameInput('');
    setPasswordInput('');
    setAuthError('');
    setActionError('');
    setAuthMode('login');
  };

  const handleUpdateLead = async (
    id: string,
    patch: {status?: LeadStatus; notes?: string}
  ) => {
    setSavingId(id);
    setActionError('');
    try {
      const response = await fetch(`/api/admin/enquiries/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
          'x-admin-key': sessionToken,
        },
        body: JSON.stringify(patch),
      });

      const data = await response.json().catch(() => null);
      if (response.status === 401) {
        clearSession();
        setAuthError('Sesi pentadbir tamat. Sila log masuk semula.');
        return;
      }

      if (!response.ok || !data?.ok || !data.enquiry) {
        setActionError(
          data?.error || 'Gagal mengemas kini rekod pertanyaan.'
        );
        return;
      }

      setEnquiries((prev) =>
        prev.map((row) => (row.id === id ? data.enquiry : row))
      );

      if (patch.notes !== undefined) {
        setEditingNoteId(null);
      }

      setSavedNoticeId(id);
      window.setTimeout(() => {
        setSavedNoticeId((current) => (current === id ? null : current));
      }, 2200);
    } catch {
      setActionError('Ralat rangkaian semasa mengemas kini rekod.');
    } finally {
      setSavingId(null);
    }
  };

  const uniqueProgrammes = useMemo(() => {
    const set = new Set<string>();
    for (const item of enquiries) {
      if (item.programmeInterest) {
        set.add(item.programmeInterest);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [enquiries]);

  const counts = useMemo(() => {
    return {
      total: enquiries.length,
      baru: enquiries.filter((e) => e.status === 'Baru').length,
      dihubungi: enquiries.filter((e) => e.status === 'Sedang Dihubungi').length,
      berjaya: enquiries.filter((e) => e.status === 'Berjaya Daftar').length,
    };
  }, [enquiries]);

  const filteredEnquiries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return enquiries.filter((item) => {
      if (statusFilter !== 'Semua' && item.status !== statusFilter) {
        return false;
      }
      if (
        programmeFilter !== 'Semua' &&
        item.programmeInterest !== programmeFilter
      ) {
        return false;
      }
      if (!query) return true;
      return (
        item.name.toLowerCase().includes(query) ||
        item.phone.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.programmeInterest.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
      );
    });
  }, [enquiries, programmeFilter, searchQuery, statusFilter]);

  const handleExportCsv = () => {
    const headers = [
      'ID Rujukan',
      'Tarikh',
      'Nama Penuh',
      'No. Telefon',
      'E-mel',
      'Program Minat',
      'Sumber',
      'Status',
      'Nota Susulan',
    ];

    const escapeCsv = (val: string) => {
      const safe = /^[=+\-@\t\r]/.test(val) ? `'${val}` : val;
      return `"${safe.replace(/"/g, '""')}"`;
    };

    const rows = filteredEnquiries.map((row) =>
      [
        row.id,
        formatMalaysianDate(row.timestamp),
        row.name,
        row.phone,
        row.email,
        row.programmeInterest,
        row.source,
        row.status,
        row.notes,
      ]
        .map((v) => escapeCsv(v || ''))
        .join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gis-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Unauthenticated view: Tabbed Login & Staff Sign Up
  if (!sessionToken) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2.5 whitespace-nowrap">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-900 text-xs font-bold text-amber-300"
              >
                GIS
              </span>
              <span className="font-display text-base font-bold text-slate-950">
                Portal Staf GIS
              </span>
            </div>

            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Laman Utama</span>
            </button>
          </div>
        </header>

        <main className="mx-auto flex max-w-md flex-col justify-center px-4 py-12 sm:py-16">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-900">
              {authMode === 'login' ? (
                <Lock className="h-5 w-5" aria-hidden="true" />
              ) : (
                <UserPlus className="h-5 w-5" aria-hidden="true" />
              )}
            </div>

            <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-slate-950">
              {authMode === 'login'
                ? 'Log Masuk CRM Penasihat GIS'
                : 'Daftar Akaun Baharu (Sign Up)'}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {authMode === 'login'
                ? 'Masukkan nama pengguna dan kata laluan untuk mengurus pertanyaan pelajar serta nota susulan.'
                : 'Cipta akaun pengguna baharu untuk mengakses papan pemuka CRM pertanyaan pelajar GIS.'}
            </p>

            {/* Segmented Switcher between Log Masuk and Daftar Akaun Baharu */}
            <div
              role="tablist"
              aria-label="Mod akses pengguna"
              className="mt-6 grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={authMode === 'login'}
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
                className={`min-h-10 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 sm:text-sm ${
                  authMode === 'login'
                    ? 'bg-white text-blue-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Log Masuk
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={authMode === 'signup'}
                onClick={() => {
                  setAuthMode('signup');
                  setAuthError('');
                }}
                className={`min-h-10 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 sm:text-sm ${
                  authMode === 'signup'
                    ? 'bg-white text-blue-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Daftar Akaun Baharu
              </button>
            </div>

            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="admin-username-input"
                    className="block text-sm font-semibold text-slate-900"
                  >
                    Nama Pengguna (Username)
                  </label>
                  <input
                    id="admin-username-input"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={usernameInput}
                    onChange={(e) => {
                      setUsernameInput(e.target.value);
                      if (authError) setAuthError('');
                    }}
                    placeholder="Contoh: ghaz"
                    className="mt-1.5 block min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-950 placeholder:text-slate-400 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="admin-password-input"
                    className="block text-sm font-semibold text-slate-900"
                  >
                    Kata Laluan (Password)
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="admin-password-input"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        if (authError) setAuthError('');
                      }}
                      placeholder="Masukkan kata laluan"
                      className="block min-h-12 w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-4 pr-11 text-base text-slate-950 placeholder:text-slate-400 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword
                          ? 'Sembunyikan kata laluan'
                          : 'Tunjukkan kata laluan'
                      }
                      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                {authError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      <span>Mengesahkan...</span>
                    </>
                  ) : (
                    <span>Log Masuk ke CRM</span>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="signup-fullname-input"
                    className="block text-sm font-semibold text-slate-900"
                  >
                    Nama Penuh
                  </label>
                  <input
                    id="signup-fullname-input"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    value={signupFullName}
                    onChange={(e) => {
                      setSignupFullName(e.target.value);
                      if (authError) setAuthError('');
                    }}
                    placeholder="Contoh: Puan Azrina"
                    className="mt-1.5 block min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-950 placeholder:text-slate-400 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="signup-username-input"
                    className="block text-sm font-semibold text-slate-900"
                  >
                    Nama Pengguna (Username)
                  </label>
                  <input
                    id="signup-username-input"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={signupUsername}
                    onChange={(e) => {
                      setSignupUsername(e.target.value);
                      if (authError) setAuthError('');
                    }}
                    placeholder="Huruf dan nombor sahaja (min. 3 aksara)"
                    className="mt-1.5 block min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-950 placeholder:text-slate-400 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="signup-password-input"
                    className="block text-sm font-semibold text-slate-900"
                  >
                    Kata Laluan (Password)
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="signup-password-input"
                      name="password"
                      type={showSignupPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={signupPassword}
                      onChange={(e) => {
                        setSignupPassword(e.target.value);
                        if (authError) setAuthError('');
                      }}
                      placeholder="Minimum 4 aksara"
                      className="block min-h-12 w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-4 pr-11 text-base text-slate-950 placeholder:text-slate-400 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword((prev) => !prev)}
                      aria-label={
                        showSignupPassword
                          ? 'Sembunyikan kata laluan'
                          : 'Tunjukkan kata laluan'
                      }
                      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
                    >
                      {showSignupPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                {authError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-300 disabled:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      <span>Mendaftarkan Akaun...</span>
                    </>
                  ) : (
                    <span>Daftar &amp; Log Masuk ke CRM</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    );
  }

  const displayStaffName = signedInFullName || signedInUser || 'Staf GIS';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Bar Contract with Logged-in Staff Full Name */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-900 text-xs font-bold text-amber-300"
            >
              GIS
            </span>
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <span className="truncate font-display text-base font-bold text-slate-950">
                CRM Pertanyaan GIS
              </span>
              <span aria-hidden="true" className="hidden text-slate-300 sm:inline">
                /
              </span>
              <span className="hidden truncate font-medium text-slate-700 sm:inline">
                {displayStaffName}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => void fetchEnquiries(sessionToken)}
              disabled={loading}
              className="inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 sm:text-sm"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span className="hidden sm:inline">Muat Semula</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredEnquiries.length === 0}
              className="inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 sm:text-sm"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Eksport CSV</span>
            </button>

            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 sm:text-sm"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="hidden md:inline">Laman Utama</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 sm:text-sm"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Log Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Mobile staff identity line */}
        <p className="mb-4 text-sm font-medium text-slate-600 sm:hidden">
          Staf aktif: <strong className="text-slate-950">{displayStaffName}</strong>
        </p>

        {welcomeBanner && (
          <div
            role="status"
            className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
              <span className="font-medium">{welcomeBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setWelcomeBanner('')}
              className="text-xs font-semibold text-emerald-800 hover:underline"
            >
              Tutup
            </button>
          </div>
        )}

        {usingDefaultCredentials && (
          <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
            <p>
              Peringatan keselamatan: Anda sedang log masuk menggunakan akaun pentadbir lalai. Tetapkan <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">ADMIN_USERNAME</code> dan <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">ADMIN_PASSWORD</code> sebelum laman dibuka kepada umum.
            </p>
          </div>
        )}

        {actionError && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Flat single-elevation summary metrics bar */}
        <section
          aria-label="Ringkasan status lead"
          className="grid grid-cols-2 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white sm:grid-cols-4 sm:divide-x sm:divide-y-0"
        >
          <div className="p-4 sm:p-5">
            <p className="text-xs font-medium text-slate-500">Jumlah Pertanyaan</p>
            <p className="mt-1 font-display text-2xl font-bold text-slate-950 tabular-nums">
              {counts.total}
            </p>
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-xs font-medium text-blue-800">Baru</p>
            <p className="mt-1 font-display text-2xl font-bold text-blue-950 tabular-nums">
              {counts.baru}
            </p>
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-xs font-medium text-amber-800">Sedang Dihubungi</p>
            <p className="mt-1 font-display text-2xl font-bold text-amber-950 tabular-nums">
              {counts.dihubungi}
            </p>
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-xs font-medium text-emerald-800">Berjaya Daftar</p>
            <p className="mt-1 font-display text-2xl font-bold text-emerald-950 tabular-nums">
              {counts.berjaya}
            </p>
          </div>
        </section>

        {/* Search & Filter Toolbar */}
        <section
          aria-label="Carian dan penapisan lead"
          className="mt-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 lg:max-w-md">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Cari nama, telefon, e-mel atau program"
                placeholder="Cari nama, no. telefon, e-mel atau program..."
                className="block min-h-11 w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-950 placeholder:text-slate-400 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                role="group"
                aria-label="Tapis mengikut status"
                className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1"
              >
                {(['Semua', ...LEAD_STATUS_OPTIONS] as const).map((status) => {
                  const active = statusFilter === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`min-h-9 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 ${
                        active
                          ? 'bg-white text-blue-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>

              <select
                aria-label="Tapis mengikut program minat"
                value={programmeFilter}
                onChange={(e) => setProgrammeFilter(e.target.value)}
                className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-100 sm:text-sm"
              >
                <option value="Semua">Semua Program</option>
                {uniqueProgrammes.map((prog) => (
                  <option key={prog} value={prog}>
                    {prog}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Data Grid / Table */}
        <section aria-label="Senarai pertanyaan pelajar" className="mt-6">
          {loading && enquiries.length === 0 ? (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-6">
              {[1, 2, 3, 4].map((row) => (
                <div
                  key={row}
                  className="h-12 animate-pulse rounded-lg bg-slate-100"
                />
              ))}
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center">
              <p className="font-display text-lg font-bold text-slate-900">
                {enquiries.length === 0
                  ? 'Belum ada rekod pertanyaan direkodkan'
                  : 'Tiada rekod sepadan dengan carian anda'}
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                {enquiries.length === 0
                  ? 'Apabila ibu bapa atau pelajar menghantar borang pertanyaan di laman utama, maklumat mereka akan dipaparkan di sini.'
                  : 'Cuba tukar kata kunci carian atau tetapkan semula penapis status dan program.'}
              </p>
              {enquiries.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('Semua');
                    setProgrammeFilter('Semua');
                  }}
                  className="mt-5 inline-flex min-h-10 items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Tetapkan Semula Penapis
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop & Tablet Table */}
              <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white lg:block">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/90 text-xs font-semibold text-slate-600">
                      <th className="px-4 py-3.5">Tarikh</th>
                      <th className="px-4 py-3.5">Nama Penuh</th>
                      <th className="px-4 py-3.5">No. Telefon</th>
                      <th className="px-4 py-3.5">E-mel</th>
                      <th className="px-4 py-3.5">Program Minat</th>
                      <th className="px-4 py-3.5">Sumber</th>
                      <th className="px-4 py-3.5">Status Semasa</th>
                      <th className="px-4 py-3.5">Nota Susulan &amp; Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredEnquiries.map((lead) => {
                      const isEditing = editingNoteId === lead.id;
                      const isSaving = savingId === lead.id;
                      const justSaved = savedNoticeId === lead.id;

                      return (
                        <tr
                          key={lead.id}
                          className="align-top transition-colors hover:bg-slate-50/70"
                        >
                          <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600 tabular-nums">
                            <div>{formatMalaysianDate(lead.timestamp)}</div>
                            <div className="mt-0.5 text-[11px] text-slate-400">
                              {lead.id}
                            </div>
                          </td>

                          <td className="px-4 py-3.5 font-semibold text-slate-950">
                            {lead.name}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3.5 text-slate-700 tabular-nums">
                            <a
                              href={`tel:${lead.phone.replace(/\s+/g, '')}`}
                              className="hover:text-blue-900 hover:underline"
                            >
                              {lead.phone}
                            </a>
                          </td>

                          <td className="px-4 py-3.5 text-slate-600">
                            <a
                              href={`mailto:${lead.email}`}
                              className="break-all hover:text-blue-900 hover:underline"
                            >
                              {lead.email}
                            </a>
                          </td>

                          <td className="max-w-[200px] px-4 py-3.5 text-slate-800">
                            {lead.programmeInterest}
                          </td>

                          <td className="px-4 py-3.5 text-xs text-slate-600">
                            {lead.source}
                          </td>

                          <td className="px-4 py-3.5">
                            <select
                              aria-label={`Status untuk ${lead.name}`}
                              value={lead.status}
                              disabled={isSaving}
                              onChange={(e) =>
                                void handleUpdateLead(lead.id, {
                                  status: e.target.value as LeadStatus,
                                })
                              }
                              className={`min-h-9 rounded-lg border px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-200 ${statusBadgeStyle(
                                lead.status
                              )}`}
                            >
                              {LEAD_STATUS_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                            {justSaved && (
                              <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                                <Check className="h-3 w-3" aria-hidden="true" />
                                Disimpan
                              </span>
                            )}
                          </td>

                          <td className="min-w-[250px] px-4 py-3.5">
                            {isEditing ? (
                              <div className="space-y-2">
                                <textarea
                                  rows={2}
                                  maxLength={500}
                                  aria-label={`Nota susulan untuk ${lead.name}`}
                                  value={noteDraft}
                                  onChange={(e) => setNoteDraft(e.target.value)}
                                  placeholder="Tulis nota ringkas susulan..."
                                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                />
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={() =>
                                      void handleUpdateLead(lead.id, {
                                        notes: noteDraft,
                                      })
                                    }
                                    className="inline-flex min-h-8 items-center gap-1 rounded-md bg-blue-900 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                                  >
                                    {isSaving ? 'Menyimpan...' : 'Simpan Nota'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingNoteId(null)}
                                    className="inline-flex min-h-8 items-center rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                  >
                                    Batal
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {lead.notes ? (
                                  <p className="text-xs leading-relaxed text-slate-700">
                                    {lead.notes}
                                  </p>
                                ) : (
                                  <p className="text-xs italic text-slate-400">
                                    Tiada nota susulan
                                  </p>
                                )}
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingNoteId(lead.id);
                                      setNoteDraft(lead.notes || '');
                                    }}
                                    className="inline-flex min-h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                  >
                                    <StickyNote className="h-3.5 w-3.5" aria-hidden="true" />
                                    <span>{lead.notes ? 'Ubah Nota' : 'Tambah Nota'}</span>
                                  </button>
                                  <a
                                    href={toWhatsAppPhoneLink(
                                      lead.phone,
                                      lead.name,
                                      lead.programmeInterest
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex min-h-8 items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
                                  >
                                    <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                                    <span>WhatsApp</span>
                                  </a>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile & Small Tablet Cards */}
              <div className="space-y-4 lg:hidden">
                {filteredEnquiries.map((lead) => {
                  const isEditing = editingNoteId === lead.id;
                  const isSaving = savingId === lead.id;
                  const justSaved = savedNoticeId === lead.id;

                  return (
                    <article
                      key={lead.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h2 className="font-display text-base font-bold text-slate-950">
                            {lead.name}
                          </h2>
                          <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
                            {formatMalaysianDate(lead.timestamp)} · {lead.id}
                          </p>
                        </div>

                        <select
                          aria-label={`Status untuk ${lead.name}`}
                          value={lead.status}
                          disabled={isSaving}
                          onChange={(e) =>
                            void handleUpdateLead(lead.id, {
                              status: e.target.value as LeadStatus,
                            })
                          }
                          className={`min-h-10 rounded-lg border px-3 py-1.5 text-xs font-semibold ${statusBadgeStyle(
                            lead.status
                          )}`}
                        >
                          {LEAD_STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>

                      <dl className="mt-4 grid grid-cols-1 gap-2 border-t border-slate-100 pt-3 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-xs text-slate-500">No. Telefon</dt>
                          <dd className="font-medium text-slate-900 tabular-nums">
                            <a href={`tel:${lead.phone.replace(/\s+/g, '')}`}>
                              {lead.phone}
                            </a>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-slate-500">E-mel</dt>
                          <dd className="break-all font-medium text-slate-900">
                            <a href={`mailto:${lead.email}`}>{lead.email}</a>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-slate-500">Program Minat</dt>
                          <dd className="font-medium text-slate-900">
                            {lead.programmeInterest}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-slate-500">Sumber</dt>
                          <dd className="text-slate-700">{lead.source}</dd>
                        </div>
                      </dl>

                      <div className="mt-4 border-t border-slate-100 pt-3">
                        {isEditing ? (
                          <div className="space-y-2">
                            <textarea
                              rows={2}
                              maxLength={500}
                              aria-label={`Nota susulan untuk ${lead.name}`}
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              placeholder="Tulis nota ringkas susulan..."
                              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={() =>
                                  void handleUpdateLead(lead.id, {
                                    notes: noteDraft,
                                  })
                                }
                                className="inline-flex min-h-10 items-center rounded-lg bg-blue-900 px-3.5 py-2 text-xs font-semibold text-white"
                              >
                                {isSaving ? 'Menyimpan...' : 'Simpan Nota'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingNoteId(null)}
                                className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            <p className="text-xs leading-relaxed text-slate-700">
                              <strong className="font-semibold text-slate-900">
                                Nota:
                              </strong>{' '}
                              {lead.notes || 'Tiada nota susulan.'}
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingNoteId(lead.id);
                                  setNoteDraft(lead.notes || '');
                                }}
                                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800"
                              >
                                <StickyNote className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>{lead.notes ? 'Ubah Nota' : 'Tambah Nota'}</span>
                              </button>
                              <a
                                href={toWhatsAppPhoneLink(
                                  lead.phone,
                                  lead.name,
                                  lead.programmeInterest
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800"
                              >
                                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>WhatsApp</span>
                              </a>
                              {justSaved && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                  Disimpan
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
