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

let MOCK_SESSIONS: Session[] = [
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

export const getSessions = async (projectId: string): Promise<Session[]> => {
  return Promise.resolve(MOCK_SESSIONS.filter(s => s.projectId === projectId));
};

export const getAllSessions = async (): Promise<Session[]> => {
  return Promise.resolve([...MOCK_SESSIONS]);
};

export const logSession = async (data: Omit<Session, 'id'>): Promise<Session> => {
  const newSession: Session = {
    ...data,
    id: `s${Date.now()}`,
  };
  MOCK_SESSIONS.push(newSession);
  return Promise.resolve(newSession);
};

export const deleteSession = async (id: string): Promise<void> => {
  MOCK_SESSIONS = MOCK_SESSIONS.filter(s => s.id !== id);
  return Promise.resolve();
};
