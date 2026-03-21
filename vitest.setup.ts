import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

const originalGetComputedStyle = window.getComputedStyle.bind(window);

window.getComputedStyle = ((elt: Element, pseudoElt?: string | null) => {
  const style = pseudoElt
    ? originalGetComputedStyle(elt)
    : originalGetComputedStyle(elt, pseudoElt);

  return new Proxy(style, {
    get(target, prop, receiver) {
      if (prop === 'transitionProperty') {
        return target.transitionProperty || 'none';
      }
      if (prop === 'getPropertyValue') {
        return (name: string) =>
          target.getPropertyValue(name) ||
          (name === 'transition-property' ? 'none' : '');
      }
      if (prop === 'getPropertyPriority') {
        return (name: string) => target.getPropertyPriority(name) || '';
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop, receiver);
    },
  });
}) as typeof window.getComputedStyle;

afterEach(() => {
  cleanup();
});
