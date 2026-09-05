export type DepartmentId = 
  | 'cardiology'
  | 'neurology'
  | 'orthopedics'
  | 'dermatology'
  | 'pediatrics'
  | 'oncology'
  | 'general';

export interface Department {
  id: DepartmentId;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  commonDiseases: string[];
  headOfDepartment: string;
  chamberWing: string;
  activeDoctorsCount: number;
}

export type DoctorAvailability = 'available' | 'on_break' | 'in_surgery' | 'on_leave';

export interface DoctorScheduleSlot {
  id: string;
  shift: 'morning' | 'evening';
  timeRange: string; // e.g., "09:00 AM - 01:00 PM"
  maxCapacity: number;
  tokensIssued: number;
}

export interface Doctor {
  id: string;
  name: string;
  qualification: string;
  departmentId: DepartmentId;
  specialization: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  photoUrl: string;
  chamberNumber: string;
  consultationFee: number;
  availability: DoctorAvailability;
  avgConsultationMinutes: number; // Rolling average
  totalConsultationsCompleted: number;
  schedules: DoctorScheduleSlot[];
}

export type TokenStatus = 'waiting' | 'in-progress' | 'completed' | 'skipped' | 'cancelled';

export interface PatientToken {
  id: string; // unique appointment ID
  tokenNumber: number; // sequential token for this doctor today (e.g. 1, 2, 3...)
  tokenDisplay: string; // e.g., "TK-014"
  doctorId: string;
  doctorName: string;
  departmentId: DepartmentId;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  symptoms: string;
  isEmergencyPriority?: boolean;
  bookedAt: string; // ISO string
  calledAt?: string;
  completedAt?: string;
  consultationDurationSeconds?: number;
  status: TokenStatus;
  slotShift: 'morning' | 'evening';
  doctorNotes?: string;
}

export interface HospitalQueueState {
  tokens: PatientToken[];
  doctors: Doctor[];
  departments: Department[];
  lastUpdated: string;
}

export interface DoctorAuthAccount {
  doctorId: string;
  staffCode: string;
  email: string;
  pin: string;
  password?: string;
  registeredAt: string;
}

export type ActivePanel = 'patient' | 'tracker' | 'doctor' | 'admin' | 'simulator';
