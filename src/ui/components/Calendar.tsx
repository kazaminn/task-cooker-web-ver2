'use client';
import React from 'react';
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Calendar as AriaCalendar,
  CalendarGridHeader as AriaCalendarGridHeader,
  type CalendarProps as AriaCalendarProps,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarHeaderCell,
  type DateValue,
  Heading,
  Text,
  useLocale,
} from 'react-aria-components';
import { composeProps, tv } from '@/libs/tv';
import { focusRing } from '@/libs/variants';
import { Button } from './Button';

const cellStyles = tv({
  extend: focusRing,
  base: 'flex aspect-square w-[calc(100cqw/7)] cursor-default items-center justify-center rounded-full text-sm forced-color-adjust-none [-webkit-tap-highlight-color:transparent]',
  variants: {
    isSelected: {
      false: 'hover:bg-hover pressed:bg-hover text-base',
      true: 'bg-primary text-white invalid:bg-danger forced-colors:bg-[Highlight] forced-colors:text-[HighlightText] forced-colors:invalid:bg-[Mark]',
    },
    isDisabled: {
      true: 'text-disabled forced-colors:text-[GrayText]',
    },
  },
});

export interface CalendarProps<T extends DateValue> extends Omit<
  AriaCalendarProps<T>,
  'visibleDuration'
> {
  errorMessage?: string;
}

export function Calendar<T extends DateValue>({
  errorMessage,
  ...props
}: CalendarProps<T>) {
  return (
    <AriaCalendar
      {...props}
      className={composeProps(
        props.className,
        '@container flex w-[calc(9*var(--spacing)*7)] max-w-full flex-col font-sans'
      )}
    >
      <CalendarHeader />
      <CalendarGrid className="border-spacing-0">
        <CalendarGridHeader />
        <CalendarGridBody>
          {(date) => <CalendarCell date={date} className={cellStyles} />}
        </CalendarGridBody>
      </CalendarGrid>
      {errorMessage && (
        <Text slot="errorMessage" className="text-danger text-sm">
          {errorMessage}
        </Text>
      )}
    </AriaCalendar>
  );
}

export function CalendarHeader() {
  const { direction } = useLocale();

  return (
    <header className="border-box flex items-center gap-1 px-1 pb-4">
      <Button variant="quiet" slot="previous">
        {direction === 'rtl' ? (
          <FontAwesomeIcon icon={faChevronRight} aria-hidden size={18} />
        ) : (
          <FontAwesomeIcon icon={faChevronLeft} aria-hidden size={18} />
        )}
      </Button>
      <Heading className="text-body dark:text-body mx-2 my-0 flex-1 text-center font-sans text-base font-semibold [font-variation-settings:normal]" />
      <Button variant="quiet" slot="next">
        {direction === 'rtl' ? (
          <FontAwesomeIcon icon={faChevronLeft} aria-hidden size={18} />
        ) : (
          <FontAwesomeIcon icon={faChevronRight} aria-hidden size={18} />
        )}
      </Button>
    </header>
  );
}

export function CalendarGridHeader() {
  return (
    <AriaCalendarGridHeader>
      {(day) => (
        <CalendarHeaderCell className="text-muted text-xs font-semibold">
          {day}
        </CalendarHeaderCell>
      )}
    </AriaCalendarGridHeader>
  );
}
