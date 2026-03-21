import { describe, expect, it } from 'vitest';
import { composeProps } from '@/libs/tv';

describe('tv', () => {
  it('merges two string class names', () => {
    expect(composeProps('font-bold', 'px-2')).toBe('px-2 font-bold');
  });

  it('returns tw class when className is undefined', () => {
    expect(composeProps(undefined, 'px-2')).toBe('px-2');
  });

  it('returns function when className is function and tw is string', () => {
    const className = ({ active }: { active: boolean }) =>
      active ? 'text-red-500' : 'text-blue-500';

    const composed = composeProps(className, 'px-2');

    expect(composed({ active: true })).toBe('px-2 text-red-500');
    expect(composed({ active: false })).toBe('px-2 text-blue-500');
  });

  it('returns function when className is string and tw is function', () => {
    const tw = ({ active }: { active: boolean }) =>
      active ? 'bg-red-500' : 'bg-blue-500';

    const composed = composeProps('px-2', tw);

    expect(composed({ active: true })).toBe('bg-red-500 px-2');
    expect(composed({ active: false })).toBe('bg-blue-500 px-2');
  });

  it('returns composed function when both are functions', () => {
    const className = ({ active }: { active: boolean }) =>
      active ? 'text-red-500' : 'text-blue-500';
    const tw = ({ active }: { active: boolean }) =>
      active ? 'bg-red-500' : 'bg-blue-500';

    const composed = composeProps(className, tw);

    expect(composed({ active: true })).toBe('bg-red-500 text-red-500');
    expect(composed({ active: false })).toBe('bg-blue-500 text-blue-500');
  });

  it('resolves conflicting classes with twMerge', () => {
    expect(composeProps('p-2', 'p-4')).toBe('p-2');
    expect(composeProps('text-sm', 'text-lg')).toBe('text-sm');
  });
});
