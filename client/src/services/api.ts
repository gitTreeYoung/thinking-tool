import axios from 'axios';
import { 
  localAuthAPI, 
  localQuestionsAPI, 
  localThoughtsAPI, 
  localAdminAPI 
} from './localApi';

// 检测是否为静态部署环境
const isStaticDeployment = !import.meta.env.NODE_ENV || import.meta.env.PROD;

interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface Question {
  id: string;
  title: string;
  description?: string;
  category?: string;
  createdAt: string;
}

interface ThoughtEntry {
  id: string;
  questionId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateThoughtRequest {
  questionId: string;
  content: string;
}

const API_BASE_URL = 'http://127.0.0.1:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = isStaticDeployment ? localAuthAPI : {
  login: (data: LoginRequest): Promise<AuthResponse> =>
    api.post('/auth/login', data).then(res => res.data),
  
  register: (data: RegisterRequest): Promise<AuthResponse> =>
    api.post('/auth/register', data).then(res => res.data),
  
  me: () =>
    api.get('/auth/me').then(res => res.data),
};

export const questionsAPI = isStaticDeployment ? localQuestionsAPI : {
  getAll: (): Promise<Question[]> =>
    api.get('/questions').then(res => res.data),
  
  getById: (id: string): Promise<Question> =>
    api.get(`/questions/${id}`).then(res => res.data),
};

export const thoughtsAPI = isStaticDeployment ? localThoughtsAPI : {
  getByQuestion: (questionId: string): Promise<ThoughtEntry[]> =>
    api.get(`/thoughts/question/${questionId}`).then(res => res.data),
  
  create: (data: CreateThoughtRequest): Promise<ThoughtEntry> =>
    api.post('/thoughts', data).then(res => res.data),
  
  update: (id: string, content: string): Promise<ThoughtEntry> =>
    api.put(`/thoughts/${id}`, { content }).then(res => res.data),
  
  delete: (id: string): Promise<void> =>
    api.delete(`/thoughts/${id}`),
};

export const adminAPI = isStaticDeployment ? localAdminAPI : {
  createQuestion: (data: { title: string; description?: string; category?: string }) =>
    api.post('/admin/questions', data).then(res => res.data),
  
  updateQuestion: (id: string, data: { title?: string; description?: string; category?: string }) =>
    api.put(`/admin/questions/${id}`, data).then(res => res.data),
  
  deleteQuestion: (id: string) =>
    api.delete(`/admin/questions/${id}`),
  
  batchImportQuestions: (questions: Array<{ title: string; description?: string; category?: string }>) =>
    api.post('/admin/questions/batch-import', { questions }).then(res => res.data),
  
  generateQuestionsWithAI: (data: {
    baseUrl: string;
    apiKey: string;
    modelName: string;
    prompt: string;
    count: number;
  }) =>
    api.post('/admin/questions/ai-generate', data).then(res => res.data),
};


export default api;