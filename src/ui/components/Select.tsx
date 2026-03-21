'use client';
import React from 'react';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Select as AriaSelect,
  type SelectProps as AriaSelectProps,
  Button,
  ListBox,
  type ListBoxItemProps,
  SelectValue,
  type ValidationResult,
} from 'react-aria-components';
import { composeProps, tv } from '@/libs/tv';
import { focusRing } from '@/libs/variants';
import { Description, FieldError, Label } from './Field';
import {
  DropdownItem,
  DropdownSection,
  type DropdownSectionProps,
} from './ListBox';
import { Popover } from './Popover';

const styles = tv({
  extend: focusRing,
  base: 'flex h-9 w-full min-w-[180px] cursor-default items-center gap-4 rounded-lg border border-main/10 bg-surface pr-2 pl-3 text-start font-sans transition [-webkit-tap-highlight-color:transparent] dark:border-main/10 dark:bg-surface',
  variants: {
    isDisabled: {
      false:
        'text-body group-invalid:outline group-invalid:outline-danger hover:bg-hover dark:text-muted dark:hover:bg-hover forced-colors:group-invalid:outline-[Mark] pressed:bg-hover dark:pressed:bg-hover',
      true: 'border-transparent bg-disabled text-disabled dark:border-transparent dark:bg-surface dark:text-disabled forced-colors:text-[GrayText]',
    },
  },
});

export interface SelectProps<T extends object> extends Omit<
  AriaSelectProps<T>,
  'children'
> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  items?: Iterable<T>;
  children: React.ReactNode | ((item: T) => React.ReactNode);
}

export function Select<T extends object>({
  label,
  description,
  errorMessage,
  children,
  items,
  ...props
}: SelectProps<T>) {
  return (
    <AriaSelect
      {...props}
      className={composeProps(
        props.className,
        'group relative flex flex-col gap-1 font-sans'
      )}
    >
      {label && <Label>{label}</Label>}
      <Button className={styles}>
        <SelectValue className="flex-1 text-sm">
          {({ selectedText, defaultChildren }) =>
            selectedText || defaultChildren
          }
        </SelectValue>
        <FontAwesomeIcon
          icon={faChevronDown}
          aria-hidden
          className="text-muted group-disabled:text-disabled dark:text-subtle dark:group-disabled:text-disabled h-4 w-4 forced-colors:text-[ButtonText] forced-colors:group-disabled:text-[GrayText]"
        />
      </Button>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover className="min-w-(--trigger-width)">
        <ListBox
          items={items}
          className="box-border max-h-[inherit] overflow-auto p-1 outline-hidden [clip-path:inset(0_0_0_0_round_.75rem)]"
        >
          {children}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}

export function SelectItem(props: ListBoxItemProps) {
  return <DropdownItem {...props} />;
}

export function SelectSection<T extends object>(
  props: DropdownSectionProps<T>
) {
  return <DropdownSection {...props} />;
}
