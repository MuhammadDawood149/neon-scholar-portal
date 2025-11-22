import { User } from './types';
import { getUsers, setCurrentUser, getCurrentUser } from './storage';

export const login = (username: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    setCurrentUser(user);
    return user;
  }
  
  return null;
};

export const logout = () => {
  setCurrentUser(null);
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

export const getAuthUser = (): User | null => {
  return getCurrentUser();
};

export const requireRole = (allowedRoles: string[]): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  return allowedRoles.includes(user.role);
};
