import {
  Button as RACButton,
  type ButtonProps as RACButtonProps,
  composeRenderProps,
} from 'react-aria-components';
import { tv } from '@/libs/tv';
import { focusRing } from '@/libs/variants';

export interface ButtonProps extends RACButtonProps {
  /** @default 'primary' */
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'quiet';
}

const button = tv({
  extend: focusRing,
  base: 'relative box-border inline-flex h-9 cursor-default items-center justify-center gap-2 rounded-lg border border-transparent px-3.5 py-0 text-center font-sans text-sm transition [-webkit-tap-highlight-color:transparent] dark:border-main/10 [&:has(>svg:only-child)]:h-8 [&:has(>svg:only-child)]:w-8 [&:has(>svg:only-child)]:px-0',
  variants: {
    variant: {
      primary:
        'pressed:bg-primary-pressed bg-primary text-white hover:bg-primary-hover',
      secondary:
        'border-main bg-base text-body shadow-xs hover:border-primary/40 hover:bg-surface pressed:bg-hover',
      outline:
        'border-primary/40 bg-transparent text-primary hover:border-primary hover:bg-primary/8 pressed:bg-primary/12',
      destructive:
        'border-danger/30 bg-transparent text-danger hover:border-danger hover:bg-danger/8 pressed:bg-danger/12',
      quiet:
        'border-0 bg-transparent text-muted hover:bg-hover hover:text-body pressed:bg-hover',
    },
    isDisabled: {
      true: 'border-transparent bg-disabled text-disabled forced-colors:text-[GrayText]',
    },
    isPending: {
      true: 'text-transparent',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
  compoundVariants: [
    {
      variant: 'quiet',
      isDisabled: true,
      class: 'bg-transparent',
    },
  ],
});

export function Button(props: ButtonProps) {
  return (
    <RACButton
      {...props}
      className={composeRenderProps(props.className, (className, renderProps) =>
        button({ ...renderProps, variant: props.variant, className })
      )}
    >
      {composeRenderProps(props.children, (children, { isPending }) => (
        <>
          {children}
          {isPending && (
            <span
              aria-hidden
              className="absolute inset-0 flex items-center justify-center"
            >
              <svg
                className="h-4 w-4 animate-spin text-white"
                viewBox="0 0 24 24"
                stroke={
                  props.variant === 'secondary' ||
                  props.variant === 'quiet' ||
                  props.variant === 'outline' ||
                  props.variant === 'destructive'
                    ? 'light-dark(black, white)'
                    : 'white'
                }
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  strokeWidth="4"
                  fill="none"
                  className="opacity-25"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  pathLength="100"
                  strokeDasharray="60 140"
                  strokeDashoffset="0"
                />
              </svg>
            </span>
          )}
        </>
      ))}
    </RACButton>
  );
}
