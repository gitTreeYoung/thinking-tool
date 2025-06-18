export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Question {
  id: string;
  title: string;
  description?: string;
  category?: string;
  createdAt: string;
}

export interface ThoughtEntry {
  id: string;
  questionId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateThoughtRequest {
  questionId: string;
  content: string;
}