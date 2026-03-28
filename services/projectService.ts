import AsyncStorage from '@react-native-async-storage/async-storage';

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

const PROJECTS_KEY = 'billable-projects-data';

const DEFAULT_PROJECTS: Project[] = [
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
  try {
    const data = await AsyncStorage.getItem(PROJECTS_KEY);
    if (data) return JSON.parse(data);
    
    // Seed default data if empty
    await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(DEFAULT_PROJECTS));
    return DEFAULT_PROJECTS;
  } catch (e) {
    return DEFAULT_PROJECTS;
  }
};

export const createProject = async (data: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
  const newProject: Project = {
    ...data,
    id: `p${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const current = await getProjects();
  current.unshift(newProject);
  await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(current));
  return newProject;
};

export const deleteProject = async (id: string): Promise<void> => {
  const current = await getProjects();
  const next = current.filter(p => p.id !== id);
  await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(next));
};
