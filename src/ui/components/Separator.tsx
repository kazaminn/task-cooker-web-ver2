'use client';
import React from 'react';
import {
  Separator as RACSeparator,
  type SeparatorProps,
} from 'react-aria-components';
import { tv } from '@/libs/tv';

const styles = tv({
  base: 'border-none bg-disabled dark:bg-hover forced-colors:bg-[ButtonBorder]',
  variants: {
    orientation: {
      horizontal: 'h-px w-full',
      vertical: 'h-full min-h-8 w-px',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

export function Separator(props: SeparatorProps) {
  return (
    <RACSeparator
      {...props}
      className={styles({
        orientation: props.orientation,
        className: props.className,
      })}
    />
  );
}
