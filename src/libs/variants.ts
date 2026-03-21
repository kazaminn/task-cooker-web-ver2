import { tv } from './tv';

export const focusRing = tv({
  base: 'outline outline-offset-2 outline-focus-ring dark:outline-focus-ring forced-colors:outline-[Highlight]',
  variants: {
    isFocusVisible: {
      false: 'outline-0',
      true: 'outline-2',
    },
  },
});

export const fieldBorderStyles = tv({
  base: 'transition',
  variants: {
    isFocusWithin: {
      false:
        'border-main hover:border-input-focus forced-colors:border-[ButtonBorder]',
      true: 'border-input-focus forced-colors:border-[Highlight]',
    },
    isInvalid: {
      true: 'border-danger forced-colors:border-[Mark]',
    },
    isDisabled: {
      true: 'border-disabled forced-colors:border-[GrayText]',
    },
  },
});

export const fieldGroupStyles = tv({
  extend: focusRing,
  base: 'group box-border flex h-9 items-center overflow-hidden rounded-lg border bg-base transition dark:bg-base forced-colors:bg-[Field]',
  variants: fieldBorderStyles.variants,
});

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
