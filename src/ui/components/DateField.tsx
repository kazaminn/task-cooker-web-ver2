'use client';
import React from 'react';
import {
  DateField as AriaDateField,
  type DateFieldProps as AriaDateFieldProps,
  DateInput as AriaDateInput,
  type DateInputProps,
  DateSegment,
  type DateValue,
  type ValidationResult,
} from 'react-aria-components';
import { composeProps, tv } from '@/libs/tv';
import { fieldGroupStyles } from '@/libs/variants';
import { Description, FieldError, Label } from './Field';

export interface DateFieldProps<
  T extends DateValue,
> extends AriaDateFieldProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function DateField<T extends DateValue>({
  label,
  description,
  errorMessage,
  ...props
}: DateFieldProps<T>) {
  return (
    <AriaDateField
      {...props}
      className={composeProps(props.className, 'flex flex-col gap-1')}
    >
      {label && <Label>{label}</Label>}
      <DateInput />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaDateField>
  );
}

const segmentStyles = tv({
  base: 'inline rounded-xs p-0.5 whitespace-nowrap text-body caret-transparent outline-0 forced-color-adjust-none [-webkit-tap-highlight-color:transparent] forced-colors:text-[ButtonText] type-literal:p-0',
  variants: {
    isPlaceholder: {
      true: 'dark:text-subtle text-muted',
    },
    isDisabled: {
      true: 'text-disabledforced-colors:text-[GrayText]',
    },
    isFocused: {
      true: 'bg-primary text-white forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]',
    },
  },
});

export function DateInput(props: Omit<DateInputProps, 'children'>) {
  return (
    <AriaDateInput
      className={(renderProps) =>
        fieldGroupStyles({
          ...renderProps,
          class:
            'inline h-9 min-w-37.5 cursor-text overflow-x-auto px-3 font-sans text-sm leading-8.5 whitespace-nowrap [scrollbar-width:none] disabled:cursor-default',
        })
      }
      {...props}
    >
      {(segment) => <DateSegment segment={segment} className={segmentStyles} />}
    </AriaDateInput>
  );
}
