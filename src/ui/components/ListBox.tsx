'use client';
import React from 'react';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  type ListBoxProps as AriaListBoxProps,
  Collection,
  Header,
  type ListBoxItemProps,
  ListBoxSection,
  type SectionProps,
  composeRenderProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { composeProps, focusRing } from '@/libs/variants';

type ListBoxProps<T> = Omit<AriaListBoxProps<T>, 'layout' | 'orientation'>;

export function ListBox<T extends object>({
  children,
  ...props
}: ListBoxProps<T>) {
  return (
    <AriaListBox
      {...props}
      className={composeProps(
        props.className,
        'border-main bg-base dark:border-main dark:bg-base w-50 rounded-lg border p-1 font-sans outline-0'
      )}
    >
      {children}
    </AriaListBox>
  );
}

export const itemStyles = tv({
  extend: focusRing,
  base: 'group relative flex cursor-default items-center gap-8 rounded-md px-2.5 py-1.5 text-sm will-change-transform forced-color-adjust-none select-none',
  variants: {
    isSelected: {
      false:
        'hover:bg-hover dark:hover:bg-hover pressed:bg-hover dark:pressed:bg-hover text-body -outline-offset-2 dark:text-muted',
      true: 'bg-primary text-white -outline-offset-4 outline-white dark:outline-white forced-colors:bg-[Highlight] forced-colors:text-[HighlightText] forced-colors:outline-[HighlightText] [&+[data-selected]]:rounded-t-none [&:has(+[data-selected])]:rounded-b-none',
    },
    isDisabled: {
      true: 'text-disabled dark:text-disabled forced-colors:text-[GrayText]',
    },
  },
});

export function ListBoxItem(props: ListBoxItemProps) {
  const textValue =
    props.textValue ??
    (typeof props.children === 'string' ? props.children : undefined);
  return (
    <AriaListBoxItem {...props} textValue={textValue} className={itemStyles}>
      {composeRenderProps(props.children, (children) => (
        <>
          {children}
          <div className="bg-base/20 absolute right-4 bottom-0 left-4 hidden h-px forced-colors:bg-[HighlightText] [.group[data-selected]:has(+[data-selected])_&]:block" />
        </>
      ))}
    </AriaListBoxItem>
  );
}

export const dropdownItemStyles = tv({
  base: 'group flex cursor-default items-center gap-4 rounded-lg py-2 pr-3 pl-3 text-sm no-underline outline-0 forced-color-adjust-none select-none [-webkit-tap-highlight-color:transparent] selected:pr-1 [[href]]:cursor-pointer',
  variants: {
    isDisabled: {
      false: 'text-heading dark:text-body',
      true: 'text-disabled dark:text-disabled forced-colors:text-[GrayText]',
    },
    isPressed: {
      true: 'bg-hover dark:bg-surface',
    },
    isFocused: {
      true: 'bg-primary text-white dark:bg-primary forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]',
    },
  },
  compoundVariants: [
    {
      isFocused: false,
      isOpen: true,
      className: 'bg-hover dark:bg-surface/60',
    },
  ],
});

export function DropdownItem(props: ListBoxItemProps) {
  const textValue =
    props.textValue ??
    (typeof props.children === 'string' ? props.children : undefined);
  return (
    <AriaListBoxItem
      {...props}
      textValue={textValue}
      className={dropdownItemStyles}
    >
      {composeRenderProps(props.children, (children, { isSelected }) => (
        <>
          <span className="group-selected:font-semibold flex flex-1 items-center gap-2 truncate font-normal">
            {children}
          </span>
          <span className="flex w-5 items-center">
            {isSelected && (
              <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
            )}
          </span>
        </>
      ))}
    </AriaListBoxItem>
  );
}

export interface DropdownSectionProps<T> extends SectionProps<T> {
  title?: string;
  items?: any;
}

export function DropdownSection<T extends object>(
  props: DropdownSectionProps<T>
) {
  return (
    <ListBoxSection className="after:block after:h-1.25 after:content-[''] first:-mt-1.25 last:after:hidden">
      <Header className="bg-hover/60 supports-[-moz-appearance:none]:bg-hover border-y-main text-muted dark:border-y-main dark:bg-surface/60 dark:text-muted sticky -top-1.25 z-10 -mx-1 -mt-px truncate border-y px-4 py-1 text-sm font-semibold backdrop-blur-md [&+*]:mt-1">
        {props.title}
      </Header>
      {props.items && (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        <Collection items={props.items}>{props.children}</Collection>
      )}
    </ListBoxSection>
  );
}
