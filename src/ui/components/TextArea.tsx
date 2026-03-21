import {
  TextArea as AriaTextArea,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
  type ValidationResult,
} from 'react-aria-components';
import { composeProps, tv } from '@/libs/tv';
import { fieldBorderStyles, focusRing } from '@/libs/variants';
import { Description, FieldError, Label } from './Field';

const textAreaStyles = tv({
  extend: focusRing,
  base: 'box-border min-h-28 w-full rounded-lg border px-3 py-2 font-sans text-sm text-body transition outline-0 placeholder:text-input-placeholder',
  variants: {
    isFocused: fieldBorderStyles.variants.isFocusWithin,
    isInvalid: fieldBorderStyles.variants.isInvalid,
    isDisabled: fieldBorderStyles.variants.isDisabled,
  },
});

export interface TextAreaProps extends AriaTextFieldProps {
  label?: string;
  description?: string;
  placeholder?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function TextArea({
  label,
  description,
  errorMessage,
  ...props
}: TextAreaProps) {
  return (
    <AriaTextField
      {...props}
      className={composeProps(props.className, 'flex flex-col gap-1 font-sans')}
    >
      {label && <Label>{label}</Label>}
      <AriaTextArea className={textAreaStyles} />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTextField>
  );
}
