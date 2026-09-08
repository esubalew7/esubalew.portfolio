import { useEffect, useState } from 'react';

export function useTypewriter(words = [], typingSpeed = 70, deletingSpeed = 35, pause = 2400) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!words.length) return undefined;
    const word = words[index % words.length];
    const complete = text === word;
    const empty = text.length === 0;
    const delay = complete ? pause : empty && deleting ? 400 : deleting ? deletingSpeed : typingSpeed;
    const timer = setTimeout(() => {
      if (complete) setDeleting(true);
      else if (deleting && empty) { setDeleting(false); setIndex(value => value + 1); }
      else setText(current => deleting ? current.slice(0, -1) : word.slice(0, current.length + 1));
    }, delay);
    return () => clearTimeout(timer);
  }, [deleting, index, pause, text, typingSpeed, deletingSpeed, words]);

  return text;
}
