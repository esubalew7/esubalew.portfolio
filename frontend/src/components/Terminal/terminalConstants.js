export const DEFAULT_PROMPT = {
  user: 'esubalew',
  host: 'portfolio',
  path: '~',
};

export const createLineId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
