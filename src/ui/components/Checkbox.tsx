import { faCheck, faMinus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Checkbox as AriaCheckbox,
  type CheckboxProps,
  composeRenderProps,
} from 'react-aria-components';
import { tv } from '@/libs/tv';
import { focusRing } from '@/libs/variants';

const checkboxStyles = tv({
  base: [
    'group relative flex items-center gap-2',
    'font-sans text-sm transition',
    '[-webkit-tap-highlight-color:transparent]',
  ],
  variants: {
    isDisabled: {
      false: 'text-body',
      true: 'text-disabled',
    },
  },
});

const boxStyles = tv({
  extend: focusRing,
  base: [
    'flex items-center justify-center',
    'box-border h-4.5 w-4.5 shrink-0',
    'rounded-sm border transition',
  ],
  variants: {
    isSelected: {
      false: ['bg-base', 'border-main', 'group-pressed:border-main'],
      true: [
        'bg-input-focus',
        'border-main',
        'group-pressed:bg-input-focus',
        'group-pressed:border-input-focus',
      ],
    },
    isInvalid: {
      true: ['border-danger', 'group-pressed:border-danger'],
    },
    isDisabled: {
      true: 'border-disabled',
    },
  },
});

const iconStyles = [
  'w-3.5 h-3.5 pointer-events-none',
  'text-white',
  'group-disabled:text-disabled',
].join(' ');

export function Checkbox(props: CheckboxProps) {
  return (
    <AriaCheckbox
      {...props}
      className={composeRenderProps(props.className, (className, renderProps) =>
        checkboxStyles({ ...renderProps, className })
      )}
    >
      {composeRenderProps(
        props.children,
        (children, { isSelected, isIndeterminate, ...renderProps }) => (
          <>
            <div
              className={boxStyles({
                isSelected: isSelected || isIndeterminate,
                ...renderProps,
              })}
            >
              {isIndeterminate ? (
                <FontAwesomeIcon
                  icon={faMinus}
                  aria-hidden
                  className={iconStyles}
                />
              ) : isSelected ? (
                <FontAwesomeIcon
                  icon={faCheck}
                  aria-hidden
                  className={iconStyles}
                />
              ) : null}
            </div>
            {children}
          </>
        )
      )}
    </AriaCheckbox>
  );
}
