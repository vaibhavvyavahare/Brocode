import { create } from 'zustand';

export interface TimerState {
  isRunning: boolean;
  startedAt: number | null;
  projectId: string | null;
  projectName: string;
  sessionType: 'billable' | 'nonbillable';
  nbCategory?: 'communication' | 'revisions' | 'admin' | 'scope';
  elapsed: number;
  startTimer: (projectId: string, name: string, type: 'billable' | 'nonbillable', nbCategory?: 'communication' | 'revisions' | 'admin' | 'scope') => void;
  stopTimer: () => { hours: number; type: 'billable' | 'nonbillable'; nbCategory: string | undefined; projectId: string | null };
  tick: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  isRunning: false,
  startedAt: null,
  projectId: null,
  projectName: '',
  sessionType: 'billable',
  nbCategory: undefined,
  elapsed: 0,
  startTimer: (projectId, name, type, nbCategory) => {
    set({
      isRunning: true,
      startedAt: Date.now(),
      projectId,
      projectName: name,
      sessionType: type,
      nbCategory,
      elapsed: 0,
    });
  },
  stopTimer: () => {
    const { elapsed, sessionType, nbCategory, projectId } = get();
    // Convert elapsed (ms) to hours
    const hours = elapsed / (1000 * 60 * 60);
    
    set({
      isRunning: false,
      startedAt: null,
      projectId: null,
      projectName: '',
      sessionType: 'billable',
      nbCategory: undefined,
      elapsed: 0,
    });
    
    return { hours, type: sessionType, nbCategory, projectId };
  },
  tick: () => {
    const { isRunning, startedAt } = get();
    if (isRunning && startedAt) {
      set({ elapsed: Date.now() - startedAt });
    }
  },
}));
