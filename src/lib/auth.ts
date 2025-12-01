import { User, Parent } from './types';
import { getUsers, setCurrentUser, getCurrentUser, getParents } from './storage';

export const login = (username: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    setCurrentUser(user);
    return user;
  }
  
  return null;
};

export const loginParent = (email: string, password: string): Parent | null => {
  const parents = getParents();
  console.log('loginParent - Checking credentials for:', email);
  console.log('loginParent - Available parents:', parents.map(p => ({ email: p.email, name: p.name })));
  const found = parents.find(p => p.email === email && p.password === password);
  console.log('loginParent - Match found:', found ? found.name : 'No match');
  return found || null;
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
