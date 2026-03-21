'use client';
import React from 'react';
import {
  Switch as AriaSwitch,
  type SwitchProps as AriaSwitchProps,
} from 'react-aria-components';
import { composeProps, tv } from '@/libs/tv';
import { focusRing } from '@/libs/variants';

export interface SwitchProps extends Omit<AriaSwitchProps, 'children'> {
  children: React.ReactNode;
}

const track = tv({
  extend: focusRing,
  base: 'box-border flex h-5 w-9 shrink-0 cursor-default items-center rounded-full border border-transparent px-px font-sans shadow-inner transition duration-200 ease-in-out',
  variants: {
    isSelected: {
      false:
        'border-main bg-hover group-pressed:bg-hover dark:border-main dark:bg-surface dark:group-pressed:bg-hover',
      true: 'bg-surface group-pressed:bg-surface dark:bg-hover dark:group-pressed:bg-hover forced-colors:bg-[Highlight]!',
    },
    isDisabled: {
      true: 'border-main bg-hover group-selected:bg-disabled dark:border-main dark:bg-surface dark:group-selected:bg-selected forced-colors:border-[GrayText] forced-colors:group-selected:bg-[GrayText]!',
    },
  },
});

const handle = tv({
  base: 'h-4 w-4 transform rounded-full shadow-xs outline outline-1 -outline-offset-1 outline-transparent transition duration-200 ease-in-out',
  variants: {
    isSelected: {
      false: 'translate-x-0 bg-base dark:bg-hover',
      true: 'translate-x-[100%] bg-base dark:bg-base',
    },
    isDisabled: {
      true: 'forced-colors:outline-[GrayText]',
    },
  },
  compoundVariants: [
    {
      isSelected: false,
      isDisabled: true,
      class: 'bg-disabled dark:bg-surface',
    },
    {
      isSelected: true,
      isDisabled: true,
      class: 'bg-surface dark:bg-surface',
    },
  ],
});

export function Switch({ children, ...props }: SwitchProps) {
  return (
    <AriaSwitch
      {...props}
      className={composeProps(
        props.className,
        'group text-body disabled:text-disabled dark:text-body dark:disabled:text-disabled relative flex items-center gap-2 text-sm transition [-webkit-tap-highlight-color:transparent] forced-colors:disabled:text-[GrayText]'
      )}
    >
      {(renderProps) => (
        <>
          <div className={track(renderProps)}>
            <span className={handle(renderProps)} />
          </div>
          {children}
        </>
      )}
    </AriaSwitch>
  );
}
