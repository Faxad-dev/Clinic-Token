// Admin / Reception Authentication Store
// Strict credential access:
// Username: Fahad
// Password: Fahadali.938.

const ADMIN_SESSION_STORAGE_KEY = 'AURA_ADMIN_SESSION_V1';

export interface AdminUser {
  username: string;
  role: 'Chief Administrator' | 'OPD Reception Officer';
  displayName: string;
  loggedAt: string;
}

const AUTHORIZED_ADMIN = {
  username: 'Fahad',
  password: 'Fahadali.938',
  validPasswords: ['Fahadali.938', 'Fahadali.938.'],
  displayName: 'Fahad (Chief Administrator)',
  role: 'Chief Administrator' as const,
};

class AdminAuthService {
  private currentAdmin: AdminUser | null = null;
  private listeners: Set<(admin: AdminUser | null) => void> = new Set();

  constructor() {
    this.currentAdmin = this.loadSession();
  }

  private loadSession(): AdminUser | null {
    try {
      const stored = localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.username === AUTHORIZED_ADMIN.username) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return null;
  }

  private saveSession(admin: AdminUser | null) {
    try {
      if (admin) {
        localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(admin));
      } else {
        localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }

  public getAuthenticatedAdmin(): AdminUser | null {
    return this.currentAdmin;
  }

  public isAuthenticated(): boolean {
    return this.currentAdmin !== null;
  }

  public login(username: string, password: string): { success: boolean; message: string; admin?: AdminUser } {
    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    // Exact matching rule: Username=Fahad, Password=Fahadali.938
    if (trimmedUser !== AUTHORIZED_ADMIN.username) {
      return {
        success: false,
        message: 'Invalid Admin Username. Only authorized administrator username is permitted.',
      };
    }

    if (!AUTHORIZED_ADMIN.validPasswords.includes(trimmedPass)) {
      return {
        success: false,
        message: 'Incorrect Admin Password. Access denied.',
      };
    }

    const admin: AdminUser = {
      username: AUTHORIZED_ADMIN.username,
      displayName: AUTHORIZED_ADMIN.displayName,
      role: AUTHORIZED_ADMIN.role,
      loggedAt: new Date().toISOString(),
    };

    this.currentAdmin = admin;
    this.saveSession(admin);
    this.notify();

    return {
      success: true,
      message: 'Admin authentication verified. Access granted to Reception Console.',
      admin,
    };
  }

  public logout(): void {
    this.currentAdmin = null;
    this.saveSession(null);
    this.notify();
  }

  public subscribe(listener: (admin: AdminUser | null) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentAdmin);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((fn) => {
      try {
        fn(this.currentAdmin);
      } catch (err) {
        console.error('AdminAuth listener error', err);
      }
    });
  }
}

export const adminAuthService = new AdminAuthService();
