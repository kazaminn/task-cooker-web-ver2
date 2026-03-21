'use client';
import React from 'react';
import {
  ToggleButtonGroup as RACToggleButtonGroup,
  type ToggleButtonGroupProps,
  composeRenderProps,
} from 'react-aria-components';
import { tv } from '@/libs/tv';

const styles = tv({
  base: 'flex gap-1',
  variants: {
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    },
  },
});

export function ToggleButtonGroup(props: ToggleButtonGroupProps) {
  return (
    <RACToggleButtonGroup
      {...props}
      className={composeRenderProps(props.className, (className, renderProps) =>
        styles({ ...renderProps, className })
      )}
    />
  );
}
