import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Session {
  id: string;
  projectId: string;
  type: 'billable' | 'nonbillable';
  nbCategory?: 'communication' | 'revisions' | 'admin' | 'scope';
  hours: number;
  note?: string;
  startedAt: string;
  endedAt: string;
}

const SESSIONS_KEY = 'billable-sessions-data';

const DEFAULT_SESSIONS: Session[] = [
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: `s${i}`,
    projectId: i % 2 === 0 ? 'p1' : (i % 3 === 0 ? 'p2' : 'p3'),
    type: (i % 4 === 0) ? 'nonbillable' : 'billable' as 'billable' | 'nonbillable',
    nbCategory: (i % 4 === 0) ? 'communication' : undefined as any,
    hours: (i % 3) + 1.5,
    note: `Mock session ${i}`,
    startedAt: new Date(Date.now() - (i * 20000000) - 3600000).toISOString(),
    endedAt: new Date(Date.now() - (i * 20000000)).toISOString(),
  }))
];

export const getAllSessions = async (): Promise<Session[]> => {
  try {
    const data = await AsyncStorage.getItem(SESSIONS_KEY);
    if (data) return JSON.parse(data);
    
    // Seed default data if empty
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(DEFAULT_SESSIONS));
    return DEFAULT_SESSIONS;
  } catch (e) {
    return DEFAULT_SESSIONS;
  }
};

export const getSessions = async (projectId: string): Promise<Session[]> => {
  const all = await getAllSessions();
  return all.filter(s => s.projectId === projectId);
};

export const logSession = async (data: Omit<Session, 'id'>): Promise<Session> => {
  const newSession: Session = {
    ...data,
    id: `s${Date.now()}`,
  };
  const current = await getAllSessions();
  current.unshift(newSession); // add newer sessions to the beginning
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(current));
  return newSession;
};

export const deleteSession = async (id: string): Promise<void> => {
  const current = await getAllSessions();
  const next = current.filter(s => s.id !== id);
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
};
