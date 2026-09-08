export function getInteractionState(target) {
  const element = target?.closest?.('[data-cursor]');
  return element ? { state: element.dataset.cursor } : null;
}

export default getInteractionState;
