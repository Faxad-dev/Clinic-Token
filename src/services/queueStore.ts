import { HospitalQueueState, PatientToken, Doctor, DepartmentId, DoctorAvailability } from '../types';
import { INITIAL_DEPARTMENTS, INITIAL_DOCTORS, INITIAL_TOKENS } from '../data/mockData';
import { soundEngine } from '../components/AudioChime';

const STORAGE_KEY = 'AURA_HOSPITAL_QUEUE_STATE_V1';
const CHANNEL_NAME = 'aura_queue_broadcast_channel';

class QueueStoreService {
  private state: HospitalQueueState;
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(state: HospitalQueueState) => void> = new Set();

  constructor() {
    this.state = this.loadInitialState();
    if (typeof window !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          if (event.data && event.data.type === 'STATE_UPDATED') {
            this.state = this.loadFromStorage();
            this.notifyListeners();
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported, falling back to window storage event', e);
      }

      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
          this.state = this.loadFromStorage();
          this.notifyListeners();
        }
      });
    }
  }

  private loadInitialState(): HospitalQueueState {
    if (typeof window === 'undefined') {
      return {
        tokens: INITIAL_TOKENS,
        doctors: INITIAL_DOCTORS,
        departments: INITIAL_DEPARTMENTS,
        lastUpdated: new Date().toISOString(),
      };
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
    }

    const defaultState: HospitalQueueState = {
      tokens: INITIAL_TOKENS,
      doctors: INITIAL_DOCTORS,
      departments: INITIAL_DEPARTMENTS,
      lastUpdated: new Date().toISOString(),
    };
    this.saveToStorage(defaultState);
    return defaultState;
  }

  private loadFromStorage(): HospitalQueueState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to parse state from localStorage', e);
    }
    return this.state;
  }

  private saveToStorage(state: HospitalQueueState) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (this.channel) {
        this.channel.postMessage({ type: 'STATE_UPDATED', timestamp: Date.now() });
      }
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }

  public subscribe(listener: (state: HospitalQueueState) => void) {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  public getState(): HospitalQueueState {
    return this.state;
  }

  /**
   * Book an appointment & issue sequential token
   */
  public bookToken(params: {
    doctorId: string;
    patientName: string;
    patientPhone: string;
    patientAge: number;
    patientGender: 'male' | 'female' | 'other';
    symptoms: string;
    slotShift: 'morning' | 'evening';
    isEmergencyPriority?: boolean;
  }): PatientToken {
    const doctor = this.state.doctors.find((d) => d.id === params.doctorId);
    if (!doctor) throw new Error('Doctor not found');

    // Determine next sequential token for this doctor today
    const doctorTokens = this.state.tokens.filter((t) => t.doctorId === params.doctorId);
    const maxTokenNum = doctorTokens.reduce((max, t) => Math.max(max, t.tokenNumber), 0);
    const nextTokenNum = maxTokenNum + 1;
    const tokenDisplay = `TK-${String(nextTokenNum).padStart(3, '0')}`;

    const newToken: PatientToken = {
      id: `tok-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tokenNumber: nextTokenNum,
      tokenDisplay,
      doctorId: doctor.id,
      doctorName: doctor.name,
      departmentId: doctor.departmentId,
      patientName: params.patientName,
      patientPhone: params.patientPhone,
      patientAge: params.patientAge,
      patientGender: params.patientGender,
      symptoms: params.symptoms,
      isEmergencyPriority: !!params.isEmergencyPriority,
      bookedAt: new Date().toISOString(),
      status: 'waiting',
      slotShift: params.slotShift,
    };

    // Update doctor schedule tokens issued
    const updatedDoctors = this.state.doctors.map((d) => {
      if (d.id === params.doctorId) {
        return {
          ...d,
          schedules: d.schedules.map((s) => {
            if (s.shift === params.slotShift) {
              return { ...s, tokensIssued: s.tokensIssued + 1 };
            }
            return s;
          }),
        };
      }
      return d;
    });

    const updatedTokens = [...this.state.tokens, newToken];

    this.state = {
      ...this.state,
      tokens: updatedTokens,
      doctors: updatedDoctors,
      lastUpdated: new Date().toISOString(),
    };

    this.saveToStorage(this.state);
    this.notifyListeners();
    soundEngine.playSuccessChime();

    return newToken;
  }

  /**
   * Doctor calls the next patient
   */
  public callNextPatient(doctorId: string): PatientToken | null {
    const doctor = this.state.doctors.find((d) => d.id === doctorId);
    if (!doctor) return null;

    const now = new Date();

    // Check if there is already someone in-progress. If so, mark as completed
    const currentActive = this.state.tokens.find(
      (t) => t.doctorId === doctorId && t.status === 'in-progress'
    );

    let updatedDoctors = this.state.doctors;

    let updatedTokens = this.state.tokens.map((t) => {
      if (currentActive && t.id === currentActive.id) {
        const calledTime = t.calledAt ? new Date(t.calledAt).getTime() : now.getTime() - 480000;
        const durationSec = Math.max(60, Math.round((now.getTime() - calledTime) / 1000));
        const durationMin = Math.round(durationSec / 60);

        // Update rolling average consultation time
        const completedCount = doctor.totalConsultationsCompleted || 1;
        const newAvg = Math.max(3, Math.min(30, Math.round((doctor.avgConsultationMinutes * completedCount + durationMin) / (completedCount + 1))));

        updatedDoctors = updatedDoctors.map((doc) =>
          doc.id === doctorId
            ? {
                ...doc,
                avgConsultationMinutes: newAvg,
                totalConsultationsCompleted: completedCount + 1,
              }
            : doc
        );

        return {
          ...t,
          status: 'completed' as const,
          completedAt: now.toISOString(),
          consultationDurationSeconds: durationSec,
        };
      }
      return t;
    });

    // Find next waiting patient: emergency first, then lowest token number
    const waitingTokens = updatedTokens
      .filter((t) => t.doctorId === doctorId && t.status === 'waiting')
      .sort((a, b) => {
        if (a.isEmergencyPriority && !b.isEmergencyPriority) return -1;
        if (!a.isEmergencyPriority && b.isEmergencyPriority) return 1;
        return a.tokenNumber - b.tokenNumber;
      });

    if (waitingTokens.length === 0) {
      this.state = {
        ...this.state,
        tokens: updatedTokens,
        doctors: updatedDoctors,
        lastUpdated: now.toISOString(),
      };
      this.saveToStorage(this.state);
      this.notifyListeners();
      return null;
    }

    const nextToCall = waitingTokens[0];

    updatedTokens = updatedTokens.map((t) => {
      if (t.id === nextToCall.id) {
        return {
          ...t,
          status: 'in-progress' as const,
          calledAt: now.toISOString(),
        };
      }
      return t;
    });

    this.state = {
      ...this.state,
      tokens: updatedTokens,
      doctors: updatedDoctors,
      lastUpdated: now.toISOString(),
    };

    this.saveToStorage(this.state);
    this.notifyListeners();

    // Play announcement chime
    soundEngine.playTokenCallChime();

    return {
      ...nextToCall,
      status: 'in-progress',
      calledAt: now.toISOString(),
    };
  }

  /**
   * Complete active consultation without immediately calling next
   */
  public completeActiveConsultation(doctorId: string, doctorNotes?: string) {
    const doctor = this.state.doctors.find((d) => d.id === doctorId);
    if (!doctor) return;

    const now = new Date();
    const active = this.state.tokens.find((t) => t.doctorId === doctorId && t.status === 'in-progress');
    if (!active) return;

    const calledTime = active.calledAt ? new Date(active.calledAt).getTime() : now.getTime() - 480000;
    const durationSec = Math.max(60, Math.round((now.getTime() - calledTime) / 1000));
    const durationMin = Math.round(durationSec / 60);

    const completedCount = doctor.totalConsultationsCompleted || 1;
    const newAvg = Math.max(3, Math.min(30, Math.round((doctor.avgConsultationMinutes * completedCount + durationMin) / (completedCount + 1))));

    const updatedDoctors = this.state.doctors.map((d) =>
      d.id === doctorId
        ? {
            ...d,
            avgConsultationMinutes: newAvg,
            totalConsultationsCompleted: completedCount + 1,
          }
        : d
    );

    const updatedTokens = this.state.tokens.map((t) => {
      if (t.id === active.id) {
        return {
          ...t,
          status: 'completed' as const,
          completedAt: now.toISOString(),
          consultationDurationSeconds: durationSec,
          doctorNotes: doctorNotes || t.doctorNotes,
        };
      }
      return t;
    });

    this.state = {
      ...this.state,
      tokens: updatedTokens,
      doctors: updatedDoctors,
      lastUpdated: now.toISOString(),
    };

    this.saveToStorage(this.state);
    this.notifyListeners();
  }

  /**
   * Skip patient (marked as skipped/no-show)
   */
  public skipPatient(tokenId: string) {
    const updatedTokens = this.state.tokens.map((t) => {
      if (t.id === tokenId) {
        return { ...t, status: 'skipped' as const };
      }
      return t;
    });

    this.state = {
      ...this.state,
      tokens: updatedTokens,
      lastUpdated: new Date().toISOString(),
    };
    this.saveToStorage(this.state);
    this.notifyListeners();
  }

  /**
   * Toggle doctor availability
   */
  public setDoctorAvailability(doctorId: string, availability: DoctorAvailability) {
    const updatedDoctors = this.state.doctors.map((d) => {
      if (d.id === doctorId) {
        return { ...d, availability };
      }
      return d;
    });

    this.state = {
      ...this.state,
      doctors: updatedDoctors,
      lastUpdated: new Date().toISOString(),
    };
    this.saveToStorage(this.state);
    this.notifyListeners();
  }

  /**
   * Update doctor notes for active or specific token
   */
  public saveDoctorNotes(tokenId: string, notes: string) {
    const updatedTokens = this.state.tokens.map((t) => {
      if (t.id === tokenId) {
        return { ...t, doctorNotes: notes };
      }
      return t;
    });

    this.state = {
      ...this.state,
      tokens: updatedTokens,
      lastUpdated: new Date().toISOString(),
    };
    this.saveToStorage(this.state);
    this.notifyListeners();
  }

  /**
   * Admin: Add new doctor
   */
  public addDoctor(newDoc: Omit<Doctor, 'id' | 'rating' | 'reviewCount' | 'avgConsultationMinutes' | 'totalConsultationsCompleted'>) {
    const id = `doc-${Date.now()}`;
    const doctor: Doctor = {
      ...newDoc,
      id,
      rating: 5.0,
      reviewCount: 1,
      avgConsultationMinutes: 10,
      totalConsultationsCompleted: 0,
    };

    this.state = {
      ...this.state,
      doctors: [...this.state.doctors, doctor],
      lastUpdated: new Date().toISOString(),
    };
    this.saveToStorage(this.state);
    this.notifyListeners();
    return doctor;
  }

  /**
   * Admin: Update existing doctor
   */
  public updateDoctor(doctorId: string, partial: Partial<Doctor>) {
    const updatedDoctors = this.state.doctors.map((d) => {
      if (d.id === doctorId) {
        return { ...d, ...partial };
      }
      return d;
    });

    this.state = {
      ...this.state,
      doctors: updatedDoctors,
      lastUpdated: new Date().toISOString(),
    };
    this.saveToStorage(this.state);
    this.notifyListeners();
  }

  /**
   * Reset database back to default initial state for clean demoing
   */
  public resetQueueForDemo() {
    const defaultState: HospitalQueueState = {
      tokens: INITIAL_TOKENS,
      doctors: INITIAL_DOCTORS,
      departments: INITIAL_DEPARTMENTS,
      lastUpdated: new Date().toISOString(),
    };
    this.state = defaultState;
    this.saveToStorage(defaultState);
    this.notifyListeners();
  }

  /**
   * Calculate live queue data for a doctor
   */
  public getDoctorQueue(doctorId: string) {
    const doctor = this.state.doctors.find((d) => d.id === doctorId);
    const doctorTokens = this.state.tokens.filter((t) => t.doctorId === doctorId);

    const activeToken = doctorTokens.find((t) => t.status === 'in-progress');
    const waitingTokens = doctorTokens
      .filter((t) => t.status === 'waiting')
      .sort((a, b) => {
        if (a.isEmergencyPriority && !b.isEmergencyPriority) return -1;
        if (!a.isEmergencyPriority && b.isEmergencyPriority) return 1;
        return a.tokenNumber - b.tokenNumber;
      });
    const completedTokens = doctorTokens.filter((t) => t.status === 'completed');

    // Last completed token number if no current active
    const maxCompletedToken = completedTokens.reduce((max, t) => Math.max(max, t.tokenNumber), 0);
    const currentServingNumber = activeToken ? activeToken.tokenNumber : maxCompletedToken;

    return {
      doctor,
      activeToken,
      waitingTokens,
      completedTokens,
      currentServingNumber,
      totalBooked: doctorTokens.length,
      waitingCount: waitingTokens.length,
      completedCount: completedTokens.length,
    };
  }

  /**
   * Calculate exact estimated wait time for a patient token
   * Wait Time Formula: (patient_token - current_serving_token) * avg_consultation_time
   */
  public calculatePatientWaitInfo(token: PatientToken) {
    const { doctor, activeToken, waitingTokens, currentServingNumber } = this.getDoctorQueue(token.doctorId);
    const avgMins = doctor?.avgConsultationMinutes || 9;

    if (token.status === 'completed') {
      return {
        status: 'completed' as const,
        peopleAhead: 0,
        estimatedMinutes: 0,
        currentServingNumber,
        isUpNext: false,
        message: 'Consultation concluded. Prescriptions filed.',
      };
    }

    if (token.status === 'in-progress') {
      return {
        status: 'in-progress' as const,
        peopleAhead: 0,
        estimatedMinutes: 0,
        currentServingNumber: token.tokenNumber,
        isUpNext: true,
        message: `Currently Inside with ${doctor?.name || 'Doctor'}. In Consultation.`,
      };
    }

    // How many waiting patients are ahead of this patient?
    // Ordered strictly by queue ordering
    const indexInWaiting = waitingTokens.findIndex((t) => t.id === token.id);
    const peopleAhead = indexInWaiting >= 0 ? indexInWaiting : Math.max(0, token.tokenNumber - (currentServingNumber + 1));
    const isUpNext = peopleAhead === 0 && !!activeToken; // next to be called!
    const isClose = peopleAhead <= 2; // within 2-3 tokens

    const estimatedMinutes = Math.max(1, (peopleAhead + (activeToken ? 1 : 0)) * avgMins);

    let message = '';
    if (peopleAhead === 0 && !activeToken) {
      message = 'You are next! The doctor will call you momentarily.';
    } else if (isUpNext) {
      message = 'You are the very next patient! Please stand near the chamber entrance.';
    } else if (isClose) {
      message = `Please be ready! Only ${peopleAhead} patient${peopleAhead > 1 ? 's' : ''} ahead of you.`;
    } else {
      message = `Estimated queue time ~${estimatedMinutes} mins (${peopleAhead} patients ahead).`;
    }

    return {
      status: token.status,
      peopleAhead,
      estimatedMinutes,
      currentServingNumber,
      isUpNext,
      isClose,
      message,
    };
  }

  /**
   * Get macro hospital stats for hero and stats bars
   */
  public getHospitalStats() {
    const totalDoctors = this.state.doctors.length;
    const totalTokens = this.state.tokens.length;
    const waitingTokens = this.state.tokens.filter((t) => t.status === 'waiting').length;
    const inProgressTokens = this.state.tokens.filter((t) => t.status === 'in-progress').length;
    const completedTokens = this.state.tokens.filter((t) => t.status === 'completed').length;
    const activeDepartments = this.state.departments.length;

    // Calculate hospital-wide average wait time
    const avgConsultMins = Math.round(
      this.state.doctors.reduce((acc, d) => acc + d.avgConsultationMinutes, 0) / (totalDoctors || 1)
    );

    return {
      totalDoctors,
      totalTokens,
      waitingTokens,
      inProgressTokens,
      completedTokens,
      activeDepartments,
      avgConsultMins,
      onTimeRate: '99.4%',
    };
  }
}

export const queueService = new QueueStoreService();
