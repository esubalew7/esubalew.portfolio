import { createContext } from 'react';

export const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  return <>{children}</>;
}
