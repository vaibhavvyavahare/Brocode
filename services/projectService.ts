export interface Project {
  id: string;
  title: string;
  client: string;
  type: 'Web Dev' | 'Design' | 'ML Project' | 'Consulting' | 'Content' | 'Other';
  model: 'fixed' | 'hourly';
  price: number;
  hourlyRate: number;
  budgetHours: number;
  meetUrl?: string;
  createdAt: string;
}

let MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'E-commerce Redesign',
    client: 'Acme Corp',
    type: 'Design',
    model: 'fixed',
    price: 120000,
    hourlyRate: 0,
    budgetHours: 40,
    createdAt: new Date(Date.now() - 1000000000).toISOString(),
  },
  {
    id: 'p2',
    title: 'Startup Landing Page',
    client: 'Stark Industries',
    type: 'Web Dev',
    model: 'hourly',
    price: 0,
    hourlyRate: 800,
    budgetHours: 20,
    meetUrl: 'https://meet.google.com/abc-defg-hij',
    createdAt: new Date(Date.now() - 500000000).toISOString(),
  },
  {
    id: 'p3',
    title: 'Recommendation Engine',
    client: 'Globex',
    type: 'ML Project',
    model: 'fixed',
    price: 200000,
    hourlyRate: 0,
    budgetHours: 100,
    createdAt: new Date(Date.now() - 200000000).toISOString(),
  }
];

export const getProjects = async (): Promise<Project[]> => {
  return Promise.resolve([...MOCK_PROJECTS]);
};

export const createProject = async (data: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
  const newProject: Project = {
    ...data,
    id: `p${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  MOCK_PROJECTS.push(newProject);
  return Promise.resolve(newProject);
};

export const deleteProject = async (id: string): Promise<void> => {
  MOCK_PROJECTS = MOCK_PROJECTS.filter(p => p.id !== id);
  return Promise.resolve();
};
