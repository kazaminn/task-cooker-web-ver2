'use client';
import React from 'react';
import {
  type FieldErrorProps,
  Group,
  type GroupProps,
  type InputProps,
  type LabelProps,
  FieldError as RACFieldError,
  Input as RACInput,
  Label as RACLabel,
  Text,
  type TextProps,
  composeRenderProps,
} from 'react-aria-components';
import { twMerge } from 'tailwind-merge';
import { composeProps, fieldGroupStyles } from '@/libs/variants';

export function Label(props: LabelProps) {
  return (
    <RACLabel
      {...props}
      className={twMerge(
        'text-muted dark:text-muted w-fit cursor-default font-sans text-sm font-medium',
        props.className
      )}
    />
  );
}

export function Description(props: TextProps) {
  return (
    <Text
      {...props}
      slot="description"
      className={twMerge('text-muted text-sm', props.className)}
    />
  );
}

export function FieldError(props: FieldErrorProps) {
  return (
    <RACFieldError
      {...props}
      className={composeProps(
        props.className,
        'text-danger text-sm forced-colors:text-[Mark]'
      )}
    />
  );
}

export function FieldGroup(props: GroupProps) {
  return (
    <Group
      {...props}
      className={composeRenderProps(props.className, (className, renderProps) =>
        fieldGroupStyles({ ...renderProps, className })
      )}
    />
  );
}

export function Input(props: InputProps) {
  return (
    <RACInput
      {...props}
      className={composeProps(
        props.className,
        'bg-base text-body placeholder:text-input-placeholder disabled:text-disabled disabled:placeholder:text-disabled dark:bg-base dark:text-body dark:placeholder:text-input-placeholder dark:disabled:text-disabled dark:disabled:placeholder:text-disabled min-h-9 min-w-0 flex-1 border-0 px-3 py-0 font-sans text-sm outline-0 [-webkit-tap-highlight-color:transparent]'
      )}
    />
  );
}
