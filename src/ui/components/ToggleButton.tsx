import {
  ToggleButton as RACToggleButton,
  type ToggleButtonProps,
  composeRenderProps,
} from 'react-aria-components';
import { tv } from '@/libs/tv';
import { focusRing } from '@/libs/variants';

const styles = tv({
  extend: focusRing,
  base: 'relative box-border inline-flex h-9 cursor-default items-center justify-center gap-2 rounded-lg border border-transparent px-3.5 text-center font-sans text-sm transition forced-color-adjust-none [-webkit-tap-highlight-color:transparent] [&:has(>svg:only-child)]:aspect-square [&:has(>svg:only-child)]:h-8 [&:has(>svg:only-child)]:px-0',
  variants: {
    isSelected: {
      false:
        'bg-transparent text-muted hover:bg-hover hover:text-body dark:bg-transparent dark:text-muted dark:hover:bg-hover dark:hover:text-body forced-colors:bg-[ButtonFace]! forced-colors:text-[ButtonText]! pressed:bg-hover dark:pressed:bg-hover',
      true: 'border-main/80 bg-surface text-body shadow-xs hover:bg-hover dark:border-main/80 dark:bg-surface dark:text-body forced-colors:bg-[Highlight]! forced-colors:text-[HighlightText]! pressed:bg-hover dark:pressed:bg-hover',
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
