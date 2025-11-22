import { useEffect } from 'react';
import { initializeStorage } from '@/lib/storage';

export const useInitStorage = () => {
  useEffect(() => {
    initializeStorage();
  }, []);
};
