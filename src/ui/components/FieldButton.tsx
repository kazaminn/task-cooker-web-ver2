'use client';
import React from 'react';
import {
  Button as RACButton,
  type ButtonProps as RACButtonProps,
  composeRenderProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { focusRing } from '@/libs/variants';

export interface ButtonProps extends RACButtonProps {
  /** @default 'primary' */
  variant?: 'primary' | 'secondary' | 'destructive' | 'icon';
}

const button = tv({
  extend: focusRing,
  base: 'dark:text-subtle relative flex inline-flex cursor-default items-center justify-center rounded-md border-0 bg-transparent p-1 text-center font-sans text-sm text-muted transition [-webkit-tap-highlight-color:transparent] hover:bg-black/5 disabled:bg-transparent dark:hover:bg-base/10 pressed:bg-black/10 dark:pressed:bg-base/20',
  variants: {
    isDisabled: {
      true: 'border-main/5 bg-disabled text-disabled dark:border-main/5 dark:bg-surface dark:text-disabled forced-colors:text-[GrayText]',
    },
  },
});

export function FieldButton(props: ButtonProps) {
  return (
    <RACButton
      {...props}
      className={composeRenderProps(props.className, (className, renderProps) =>
        button({ ...renderProps, className })
      )}
    >
      {props.children}
    </RACButton>
  );
}
