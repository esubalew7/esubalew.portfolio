export const EASINGS = {
  easeOutCubic: [0.33, 1, 0.68, 1],
  easeInOutCubic: [0.65, 0, 0.35, 1],
  easeOutExpo: [0.16, 1, 0.3, 1],
  easeOutQuart: [0.25, 1, 0.5, 1],
};

export const SPRINGS = {
  gentle: { type: 'spring', stiffness: 120, damping: 14 },
  snappy: { type: 'spring', stiffness: 200, damping: 20 },
  bouncy: { type: 'spring', stiffness: 300, damping: 15 },
};
