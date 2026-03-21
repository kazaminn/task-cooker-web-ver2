import {
  ToggleButton as RACToggleButton,
  type ToggleButtonProps,
  composeRenderProps,
} from 'react-aria-components';
import { tv } from '@/libs/tv';
import { focusRing } from '@/libs/variants';

const styles = tv({
  extend: focusRing,
  base: 'relative box-border inline-flex h-9 cursor-default items-center justify-center gap-2 rounded-lg border border-main/10 px-3.5 text-center font-sans text-sm transition forced-color-adjust-none [-webkit-tap-highlight-color:transparent] dark:border-main/10 [&:has(>svg:only-child)]:aspect-square [&:has(>svg:only-child)]:h-8 [&:has(>svg:only-child)]:px-0',
  variants: {
    isSelected: {
      false:
        'bg-surface text-body hover:bg-hover dark:bg-surface dark:text-body dark:hover:bg-hover forced-colors:bg-[ButtonFace]! forced-colors:text-[ButtonText]! pressed:bg-hover dark:pressed:bg-hover',
      true: 'border-primary bg-primary/10 text-primary hover:bg-primary/15 dark:border-primary dark:bg-primary/20 dark:text-primary forced-colors:bg-[Highlight]! forced-colors:text-[HighlightText]! pressed:bg-primary/20 dark:pressed:bg-primary/25',
    },
    isDisabled: {
      true: 'border-transparent bg-disabled text-disabled dark:border-transparent dark:bg-surface dark:text-disabled forced-colors:bg-[ButtonFace]! forced-colors:text-[GrayText]!',
    },
  },
});

export function ToggleButton(props: ToggleButtonProps) {
  return (
    <RACToggleButton
      {...props}
      className={composeRenderProps(props.className, (className, renderProps) =>
        styles({ ...renderProps, className })
      )}
    />
  );
}
