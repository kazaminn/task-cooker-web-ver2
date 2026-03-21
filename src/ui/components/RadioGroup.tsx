'use client';
import React, { type ReactNode } from 'react';
import {
  Radio as RACRadio,
  RadioGroup as RACRadioGroup,
  type RadioGroupProps as RACRadioGroupProps,
  type RadioProps,
  type ValidationResult,
  composeRenderProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { composeProps, focusRing } from '@/libs/variants';
import { Description, FieldError, Label } from './Field';

export interface RadioGroupProps extends Omit<RACRadioGroupProps, 'children'> {
  label?: string;
  children?: ReactNode;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function RadioGroup(props: RadioGroupProps) {
  return (
    <RACRadioGroup
      {...props}
      className={composeProps(
        props.className,
        'group flex flex-col gap-2 font-sans'
      )}
    >
      <Label>{props.label}</Label>
      <div className="group-orientation-horizontal:gap-4 group-orientation-vertical:flex-col flex gap-2">
        {props.children}
      </div>
      {props.description && <Description>{props.description}</Description>}
      <FieldError>{props.errorMessage}</FieldError>
    </RACRadioGroup>
  );
}

const styles = tv({
  extend: focusRing,
  base: 'box-border h-4.5 w-4.5 rounded-full border bg-base transition-all dark:bg-base',
  variants: {
    isSelected: {
      false:
        'border-main group-pressed:border-main dark:border-main dark:group-pressed:border-main',
      true: 'border-[calc(var(--spacing)*1.5)] border-main group-pressed:border-main dark:border-main dark:group-pressed:border-main forced-colors:border-[Highlight]!',
    },
    isInvalid: {
      true: 'border-danger group-pressed:border-danger dark:border-danger dark:group-pressed:border-danger forced-colors:border-[Mark]!',
    },
    isDisabled: {
      true: 'border-main dark:border-main forced-colors:border-[GrayText]!',
    },
  },
});

export function Radio(props: RadioProps) {
  return (
    <RACRadio
      {...props}
      className={composeProps(
        props.className,
        'group text-body disabled:text-disabled dark:text-body dark:disabled:text-disabled relative flex items-center gap-2 text-sm transition [-webkit-tap-highlight-color:transparent] forced-colors:disabled:text-[GrayText]'
      )}
    >
      {composeRenderProps(props.children, (children, renderProps) => (
        <>
          <div className={styles(renderProps)} />
          {children}
        </>
      ))}
    </RACRadio>
  );
}
