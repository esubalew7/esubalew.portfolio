export const CURSOR = {
  core: {
    restSize: 10,
    dark:  { color: '#FF4D00', glow: 'rgba(255,77,0,0.6)' },
    light: { color: '#FF4D00', glow: 'rgba(255,77,0,0.4)' },
  },
  ring: {
    restSize: 28,
    borderWidth: 1,
    dark:  { color: 'rgba(255,77,0,0.3)', glow: 'rgba(255,77,0,0.08)' },
    light: { color: 'rgba(255,77,0,0.25)', glow: 'rgba(255,77,0,0.06)' },
  },
  magnetic: { radius: 120, strength: 0.15, lerpSpeed: 0.15 },
  physics: {
    positionLerp: 0.9,
    scaleLerp:    0.15,
    ringScaleLerp: 0.1,
  },
  interactionScale: {
    default: { scale: 1, ringScale: 1 },
    hover:   { scale: 1.3, ringScale: 1.8 },
    click:   { scale: 0.85, ringScale: 1.4 },
  },
};
