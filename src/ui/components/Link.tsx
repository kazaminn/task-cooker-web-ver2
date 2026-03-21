import {
  Link as AriaLink,
  type LinkProps as AriaLinkProps,
  composeRenderProps,
} from 'react-aria-components';
import { tv } from '@/libs/tv';
import { focusRing } from '@/libs/variants';

interface LinkProps extends AriaLinkProps {
  variant?: 'primary' | 'secondary';
}

const styles = tv({
  extend: focusRing,
  base: 'rounded-xs underline transition [-webkit-tap-highlight-color:transparent] disabled:cursor-default disabled:no-underline forced-colors:disabled:text-[GrayText]',
  variants: {
    variant: {
      primary:
        'text-selected dark:text-selected underline decoration-blue-600/60 hover:decoration-blue-600 dark:decoration-blue-500/60 dark:hover:decoration-blue-500',
      secondary:
        'text-body underline decoration-neutral-700/50 hover:decoration-neutral-700 dark:text-muted dark:decoration-neutral-300/70 dark:hover:decoration-neutral-300',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

export function Link(props: LinkProps) {
  return (
    <AriaLink
      {...props}
      className={composeRenderProps(props.className, (className, renderProps) =>
        styles({ ...renderProps, className, variant: props.variant })
      )}
    />
  );
}
