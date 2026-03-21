'use client';
import React from 'react';
import { faCheck, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuSection as AriaMenuSection,
  type MenuSectionProps as AriaMenuSectionProps,
  MenuTrigger as AriaMenuTrigger,
  type MenuTriggerProps as AriaMenuTriggerProps,
  SubmenuTrigger as AriaSubmenuTrigger,
  Collection,
  Header,
  type MenuItemProps,
  type MenuProps,
  Separator,
  type SeparatorProps,
  type SubmenuTriggerProps,
  composeRenderProps,
} from 'react-aria-components';
import { dropdownItemStyles } from './ListBox';
import { Popover, type PopoverProps } from './Popover';

export function Menu<T extends object>(props: MenuProps<T>) {
  return (
    <AriaMenu
      {...props}
      className="max-h-[inherit] overflow-auto p-1 font-sans outline-0 [clip-path:inset(0_0_0_0_round_.75rem)] empty:pb-2 empty:text-center"
    />
  );
}

export function MenuItem(props: MenuItemProps) {
  const textValue =
    props.textValue ??
    (typeof props.children === 'string' ? props.children : undefined);
  return (
    <AriaMenuItem
      textValue={textValue}
      {...props}
      className={dropdownItemStyles}
    >
      {composeRenderProps(
        props.children,
        (children, { selectionMode, isSelected, hasSubmenu }) => (
          <>
            {selectionMode !== 'none' && (
              <span className="flex w-4 items-center">
                {isSelected && (
                  <FontAwesomeIcon
                    icon={faCheck}
                    aria-hidden
                    className="h-4 w-4"
                  />
                )}
              </span>
            )}
            <span className="group-selected:font-semibold flex flex-1 items-center gap-2 truncate font-normal">
              {children}
            </span>
            {hasSubmenu && (
              <FontAwesomeIcon
                icon={faChevronRight}
                aria-hidden
                className="absolute right-2 h-4 w-4"
              />
            )}
          </>
        )
      )}
    </AriaMenuItem>
  );
}

export function MenuSeparator(props: SeparatorProps) {
  return (
    <Separator
      {...props}
      className="border-main dark:border-main mx-3 my-1 border-b"
    />
  );
}

export interface MenuSectionProps<T> extends AriaMenuSectionProps<T> {
  title?: string;
  items?: Iterable<T>;
}

export function MenuSection<T extends object>(props: MenuSectionProps<T>) {
  return (
    <AriaMenuSection
      {...props}
      className="after:block after:h-1.25 after:content-[''] first:-mt-1.25"
    >
      {props.title && (
        <Header className="bg-hover/60 supports-[-moz-appearance:none]:bg-hover border-y-main text-muted dark:border-y-main dark:bg-surface/60 dark:text-muted sticky -top-1.25 z-10 -mx-1 -mt-px truncate border-y px-4 py-1 text-sm font-semibold backdrop-blur-md [&+*]:mt-1">
          {props.title}
        </Header>
      )}
      {}
      <Collection items={props.items}>{props.children}</Collection>
    </AriaMenuSection>
  );
}

interface MenuTriggerProps extends AriaMenuTriggerProps {
  placement?: PopoverProps['placement'];
}

export function MenuTrigger(props: MenuTriggerProps) {
  const [trigger, menu] = React.Children.toArray(props.children) as [
    React.ReactElement,
    React.ReactElement,
  ];
  return (
    <AriaMenuTrigger {...props}>
      {trigger}
      <Popover placement={props.placement} className="min-w-37.5">
        {menu}
      </Popover>
    </AriaMenuTrigger>
  );
}

export function SubmenuTrigger(props: SubmenuTriggerProps) {
  const [trigger, menu] = React.Children.toArray(props.children) as [
    React.ReactElement,
    React.ReactElement,
  ];
  return (
    <AriaSubmenuTrigger {...props}>
      {trigger}
      <Popover offset={-2} crossOffset={-4}>
        {menu}
      </Popover>
    </AriaSubmenuTrigger>
  );
}
