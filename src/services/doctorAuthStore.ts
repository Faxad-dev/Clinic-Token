import { Doctor, DoctorAuthAccount, DepartmentId } from '../types';
import { queueService } from './queueStore';

const CREDENTIALS_STORAGE_KEY = 'AURA_DOCTOR_CREDENTIALS_V1';
const SESSION_STORAGE_KEY = 'AURA_ACTIVE_DOCTOR_SESSION_V1';

// Initial pre-registered doctor accounts for demonstration
const INITIAL_ACCOUNTS: DoctorAuthAccount[] = [
  {
    doctorId: 'doc-1',
    staffCode: 'DOC-101',
    email: 'dr.tariq@auranexus.med',
    pin: '1234',
    password: '1234',
    registeredAt: '2026-01-15T08:00:00.000Z',
  },
  {
    doctorId: 'doc-2',
    staffCode: 'DOC-102',
    email: 'dr.ayesha@auranexus.med',
    pin: '1234',
    password: '1234',
    registeredAt: '2026-01-16T08:00:00.000Z',
  },
  {
    doctorId: 'doc-3',
    staffCode: 'DOC-103',
    email: 'dr.zaid@auranexus.med',
    pin: '1234',
    password: '1234',
    registeredAt: '2026-01-17T08:00:00.000Z',
  },
  {
    doctorId: 'doc-4',
    staffCode: 'DOC-104',
    email: 'dr.sarah@auranexus.med',
    pin: '1234',
    password: '1234',
    registeredAt: '2026-01-18T08:00:00.000Z',
  },
  {
    doctorId: 'doc-5',
    staffCode: 'DOC-105',
    email: 'dr.zainab@auranexus.med',
    pin: '1234',
    password: '1234',
    registeredAt: '2026-01-19T08:00:00.000Z',
  },
  {
    doctorId: 'doc-6',
    staffCode: 'DOC-106',
    email: 'dr.bilal@auranexus.med',
    pin: '1234',
    password: '1234',
    registeredAt: '2026-01-20T08:00:00.000Z',
  },
];

class DoctorAuthService {
  private accounts: DoctorAuthAccount[] = [];
  private activeDoctorId: string | null = null;
  private listeners: Set<(doctor: Doctor | null) => void> = new Set();

  constructor() {
    this.accounts = this.loadAccounts();
    this.activeDoctorId = this.loadActiveSession();

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === SESSION_STORAGE_KEY) {
          this.activeDoctorId = this.loadActiveSession();
          this.notify();
        }
        if (e.key === CREDENTIALS_STORAGE_KEY) {
          this.accounts = this.loadAccounts();
        }
      });
    }
  }

  private loadAccounts(): DoctorAuthAccount[] {
    if (typeof window === 'undefined') return INITIAL_ACCOUNTS;
    try {
      const raw = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to load doctor credentials from storage', e);
    }
    // Seed initial
    this.saveAccounts(INITIAL_ACCOUNTS);
    return INITIAL_ACCOUNTS;
  }

  private saveAccounts(accounts: DoctorAuthAccount[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.error('Failed to save doctor accounts to storage', e);
    }
  }

  private loadActiveSession(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(SESSION_STORAGE_KEY) || null;
    } catch (e) {
      return null;
    }
  }

  private saveActiveSession(doctorId: string | null) {
    if (typeof window === 'undefined') return;
    try {
      if (doctorId) {
        localStorage.setItem(SESSION_STORAGE_KEY, doctorId);
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save active session', e);
    }
  }

  private notify() {
    const doctor = this.getAuthenticatedDoctor();
    this.listeners.forEach((listener) => listener(doctor));
  }

  public subscribe(listener: (doctor: Doctor | null) => void): () => void {
    this.listeners.add(listener);
    // Initial call
    listener(this.getAuthenticatedDoctor());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getAuthenticatedDoctor(): Doctor | null {
    if (!this.activeDoctorId) return null;
    const allDoctors = queueService.getState().doctors;
    const found = allDoctors.find((d) => d.id === this.activeDoctorId);
    return found || null;
  }

  public getAccountForDoctor(doctorId: string): DoctorAuthAccount | undefined {
    return this.accounts.find((a) => a.doctorId === doctorId);
  }

  public getAllAccounts(): DoctorAuthAccount[] {
    return [...this.accounts];
  }

  /**
   * Log in doctor using Doctor ID, Staff Code, Full Name, or Email + Password / PIN
   */
  public login(identifier: string, passwordOrPin: string): { success: boolean; doctor?: Doctor; error?: string } {
    const trimmedId = identifier.trim().toLowerCase();
    const trimmedPass = passwordOrPin.trim();

    if (!trimmedId) {
      return { success: false, error: 'Please enter your Doctor ID, Staff Code, Name, or Email.' };
    }
    if (!trimmedPass) {
      return { success: false, error: 'Please enter your password or security PIN.' };
    }

    // 1. Direct match on account fields
    let account = this.accounts.find(
      (a) =>
        a.doctorId.toLowerCase() === trimmedId ||
        a.staffCode.toLowerCase() === trimmedId ||
        a.email.toLowerCase() === trimmedId
    );

    const allDoctors = queueService.getState().doctors;

    // 2. If not found, match by doctor's full name in queueStore
    if (!account) {
      const cleanInput = trimmedId.replace(/^dr\.?\s*/i, '').trim();
      const matchedDoctor = allDoctors.find((d) => {
        const cleanDocName = d.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim();
        return (
          d.id.toLowerCase() === trimmedId ||
          d.name.toLowerCase() === trimmedId ||
          cleanDocName === cleanInput ||
          cleanDocName.includes(cleanInput)
        );
      });

      if (matchedDoctor) {
        account = this.accounts.find((a) => a.doctorId === matchedDoctor.id);
        if (!account) {
          // Auto create account fallback
          account = {
            doctorId: matchedDoctor.id,
            staffCode: `DOC-${Math.floor(100 + Math.random() * 900)}`,
            email: `${matchedDoctor.name.toLowerCase().replace(/[^a-z]/g, '')}@auranexus.med`,
            pin: '1234',
            password: '1234',
            registeredAt: new Date().toISOString(),
          };
          this.accounts.push(account);
          this.saveAccounts(this.accounts);
        }
      }
    }

    if (!account) {
      return {
        success: false,
        error: 'No medical staff record found for this ID, Name, or Email. Please check credentials or contact Admin (Fahad).',
      };
    }

    // Check password or pin
    const isValid =
      (account.password && account.password === trimmedPass) ||
      (account.pin && account.pin === trimmedPass);

    if (!isValid) {
      return {
        success: false,
        error: 'Invalid password or PIN. Please enter the correct access credentials.',
      };
    }

    // Find the doctor object in queueStore
    const doctor = allDoctors.find((d) => d.id === account!.doctorId);

    if (!doctor) {
      return {
        success: false,
        error: 'Doctor clinical profile not found in active hospital registry.',
      };
    }

    this.activeDoctorId = doctor.id;
    this.saveActiveSession(doctor.id);
    this.notify();

    return { success: true, doctor };
  }

  /**
   * Admin: Register or update doctor login credentials (password, staffCode, email)
   */
  public registerDoctorCredentials(params: {
    doctorId: string;
    password?: string;
    pin?: string;
    staffCode?: string;
    email?: string;
  }): DoctorAuthAccount {
    const password = params.password?.trim() || params.pin?.trim() || '1234';
    const pin = params.pin?.trim() || password;
    const staffCode = params.staffCode?.trim() || `DOC-${Math.floor(100 + Math.random() * 900)}`;
    const email = params.email?.trim() || `doctor.${params.doctorId}@auranexus.med`;

    const existingIndex = this.accounts.findIndex((a) => a.doctorId === params.doctorId);
    const newAccount: DoctorAuthAccount = {
      doctorId: params.doctorId,
      staffCode,
      email,
      pin,
      password,
      registeredAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.accounts[existingIndex] = { ...this.accounts[existingIndex], ...newAccount };
    } else {
      this.accounts.push(newAccount);
    }
    this.saveAccounts(this.accounts);
    return newAccount;
  }

  /**
   * Fast demo login for easy testing of specific doctor
   */
  public quickLoginAsDoctor(doctorId: string): { success: boolean; doctor?: Doctor } {
    const allDoctors = queueService.getState().doctors;
    const doctor = allDoctors.find((d) => d.id === doctorId);
    if (!doctor) return { success: false };

    // Ensure account exists or create fallback
    let account = this.accounts.find((a) => a.doctorId === doctorId);
    if (!account) {
      account = {
        doctorId: doctor.id,
        staffCode: `DOC-${Math.floor(100 + Math.random() * 900)}`,
        email: `${doctor.name.toLowerCase().replace(/[^a-z]/g, '')}@auranexus.med`,
        pin: '1234',
        registeredAt: new Date().toISOString(),
      };
      this.accounts = [...this.accounts, account];
      this.saveAccounts(this.accounts);
    }

    this.activeDoctorId = doctor.id;
    this.saveActiveSession(doctor.id);
    this.notify();

    return { success: true, doctor };
  }

  /**
   * Register and onboard a new doctor
   */
  public registerDoctor(params: {
    name: string;
    qualification: string;
    departmentId: DepartmentId;
    specialization: string;
    chamberNumber: string;
    consultationFee: number;
    pin: string;
    email?: string;
  }): { success: boolean; doctor?: Doctor; error?: string } {
    if (!params.name.trim()) {
      return { success: false, error: 'Doctor name is required.' };
    }
    if (!params.specialization.trim()) {
      return { success: false, error: 'Specialization is required.' };
    }
    if (!params.pin || params.pin.trim().length < 4) {
      return { success: false, error: 'Security PIN must be at least 4 digits.' };
    }

    const email = params.email?.trim() || `${params.name.toLowerCase().replace(/[^a-z]/g, '')}@auranexus.med`;
    
    // Check if email already registered
    const existing = this.accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, error: 'A doctor account is already registered with this email.' };
    }

    // Add to queueStore
    const newDoc = queueService.addDoctor({
      name: params.name.trim().startsWith('Dr.') ? params.name.trim() : `Dr. ${params.name.trim()}`,
      qualification: params.qualification.trim() || 'MBBS, FCPS',
      departmentId: params.departmentId,
      specialization: params.specialization.trim(),
      experienceYears: 5,
      photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop&q=80',
      chamberNumber: params.chamberNumber.trim() || 'Chamber 205',
      consultationFee: Number(params.consultationFee) || 2000,
      availability: 'available',
      schedules: [
        {
          id: `slot-${Date.now()}-am`,
          shift: 'morning',
          timeRange: '09:00 AM - 01:00 PM',
          maxCapacity: 20,
          tokensIssued: 0,
        },
        {
          id: `slot-${Date.now()}-pm`,
          shift: 'evening',
          timeRange: '05:00 PM - 09:00 PM',
          maxCapacity: 15,
          tokensIssued: 0,
        },
      ],
    });

    const staffCode = `DOC-${Math.floor(100 + Math.random() * 900)}`;
    const newAccount: DoctorAuthAccount = {
      doctorId: newDoc.id,
      staffCode,
      email,
      pin: params.pin.trim(),
      registeredAt: new Date().toISOString(),
    };

    this.accounts = [...this.accounts, newAccount];
    this.saveAccounts(this.accounts);

    // Auto sign in new doctor
    this.activeDoctorId = newDoc.id;
    this.saveActiveSession(newDoc.id);
    this.notify();

    return { success: true, doctor: newDoc };
  }

  /**
   * Log out active doctor session
   */
  public logout() {
    this.activeDoctorId = null;
    this.saveActiveSession(null);
    this.notify();
  }
}

export const doctorAuthService = new DoctorAuthService();
