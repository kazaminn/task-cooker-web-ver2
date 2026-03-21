'use client';
import React, { createContext, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import {
  Tag as AriaTag,
  TagGroup as AriaTagGroup,
  type TagGroupProps as AriaTagGroupProps,
  type TagProps as AriaTagProps,
  Button,
  TagList,
  type TagListProps,
  Text,
  composeRenderProps,
} from 'react-aria-components';
import { twMerge } from 'tailwind-merge';
import { tv } from 'tailwind-variants';
import { Description, Label } from './Field';
import { focusRing } from '@/libs/variants';

const colors = {
  gray: 'bg-base text-muted border-main hover:border-main dark:bg-base dark:text-muted dark:border-main dark:hover:border-main',
  green:
    'bg-green-100 text-green-700 border-green-200 hover:border-green-300 dark:bg-green-300/20 dark:text-green-400 dark:border-green-300/10 dark:hover:border-green-300/20',
  yellow:
    'bg-yellow-100 text-yellow-700 border-yellow-200 hover:border-yellow-300 dark:bg-yellow-300/20 dark:text-yellow-400 dark:border-yellow-300/10 dark:hover:border-yellow-300/20',
  blue: 'bg-selected text-selected border-selected hover:border-selected dark:bg-selected dark:text-selected dark:border-selected dark:hover:border-selected',
};

type Color = keyof typeof colors;
const ColorContext = createContext<Color>('gray');

const tagStyles = tv({
  extend: focusRing,
  base: 'flex max-w-fit cursor-default items-center gap-1 rounded-full border px-3 py-0.5 font-sans text-xs transition [-webkit-tap-highlight-color:transparent]',
  variants: {
    color: {
      gray: '',
      green: '',
      yellow: '',
      blue: '',
    },
    allowsRemoving: {
      true: 'pr-1',
    },
    isSelected: {
      true: 'border-transparent bg-primary text-white forced-color-adjust-none forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]',
    },
    isDisabled: {
      true: 'bg-disabled text-disabled dark:border-main/20 dark:bg-transparent dark:text-disabled forced-colors:text-[GrayText]',
    },
  },
  compoundVariants: (Object.keys(colors) as Color[]).map((color) => ({
    isSelected: false,
    isDisabled: false,
    color,
    class: colors[color],
  })),
});

export interface TagGroupProps<T>
  extends
    Omit<AriaTagGroupProps, 'children'>,
    Pick<TagListProps<T>, 'items' | 'children' | 'renderEmptyState'> {
  color?: Color;
  label?: string;
  description?: string;
  errorMessage?: string;
}

export interface TagProps extends AriaTagProps {
  color?: Color;
}

export function TagGroup<T extends object>({
  label,
  description,
  errorMessage,
  items,
  children,
  renderEmptyState,
  ...props
}: TagGroupProps<T>) {
  return (
    <AriaTagGroup
      {...props}
      className={twMerge('flex flex-col gap-2 font-sans', props.className)}
    >
      <Label>{label}</Label>
      <ColorContext.Provider value={props.color ?? 'gray'}>
        <TagList
          items={items}
          renderEmptyState={renderEmptyState}
          className="flex flex-wrap gap-1"
        >
          {children}
        </TagList>
      </ColorContext.Provider>
      {description && <Description>{description}</Description>}
      {errorMessage && (
        <Text slot="errorMessage" className="text-sm text-danger">
          {errorMessage}
        </Text>
      )}
    </AriaTagGroup>
  );
}

const removeButtonStyles = tv({
  extend: focusRing,
  base: 'flex cursor-default items-center justify-center rounded-full border-0 bg-transparent p-0.5 text-inherit transition-[background-color] hover:bg-black/10 dark:hover:bg-base/10 pressed:bg-black/20 dark:pressed:bg-base/20',
});

export function Tag({ children, color, ...props }: TagProps) {
  const textValue = typeof children === 'string' ? children : undefined;
  const groupColor = useContext(ColorContext);
  return (
    <AriaTag
      textValue={textValue}
      {...props}
      className={composeRenderProps(props.className, (className, renderProps) =>
        tagStyles({ ...renderProps, className, color: color ?? groupColor })
      )}
    >
      {composeRenderProps(children, (children, { allowsRemoving }) => (
        <>
          {children}
          {allowsRemoving && (
            <Button slot="remove" className={removeButtonStyles}>
              <FontAwesomeIcon icon={faXmark} aria-hidden className="h-3 w-3" />
            </Button>
          )}
        </>
      ))}
    </AriaTag>
  );
}
