import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  DatePicker as AriaDatePicker,
  type DatePickerProps as AriaDatePickerProps,
  type DateValue,
  type ValidationResult,
} from 'react-aria-components';
import { composeProps } from '@/libs/tv';
import { Calendar } from './Calendar';
import { DateInput } from './DateField';
import { Description, FieldError, FieldGroup, Label } from './Field';
import { FieldButton } from './FieldButton';
import { Popover } from './Popover';

export interface DatePickerProps<
  T extends DateValue,
> extends AriaDatePickerProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function DatePicker<T extends DateValue>({
  label,
  description,
  errorMessage,
  ...props
}: DatePickerProps<T>) {
  return (
    <AriaDatePicker
      {...props}
      className={composeProps(
        props.className,
        'group flex flex-col gap-1 font-sans'
      )}
    >
      {label && <Label>{label}</Label>}
      <FieldGroup className="w-auto min-w-52 cursor-text disabled:cursor-default">
        <DateInput className="min-w-37.5 flex-1 px-3 text-sm" />
        <FieldButton className="mr-1 w-6 outline-offset-0">
          <FontAwesomeIcon icon={faCalendar} aria-hidden className="h-4 w-4" />
        </FieldButton>
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover className="p-2">
        <Calendar />
      </Popover>
    </AriaDatePicker>
  );
}
