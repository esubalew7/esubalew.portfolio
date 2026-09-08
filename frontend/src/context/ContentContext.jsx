import { createContext } from 'react';
import { useRealtimeContent } from '../hooks/useRealtimeContent';

export const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  useRealtimeContent();
  return <>{children}</>;
}
