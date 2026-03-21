import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  SearchField as AriaSearchField,
  type SearchFieldProps as AriaSearchFieldProps,
  type ValidationResult,
} from 'react-aria-components';
import { composeProps } from '@/libs/tv';
import { Description, FieldError, FieldGroup, Input, Label } from './Field';
import { FieldButton } from './FieldButton';

export interface SearchFieldProps extends AriaSearchFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string;
}

export function SearchField({
  label,
  description,
  errorMessage,
  placeholder,
  ...props
}: SearchFieldProps) {
  return (
    <AriaSearchField
      {...props}
      className={composeProps(
        props.className,
        'group flex max-w-full min-w-10 flex-col gap-1 font-sans'
      )}
    >
      {label && <Label>{label}</Label>}
      <FieldGroup>
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          aria-hidden
          className="dark:text-subtle ml-2 h-4 w-4 text-muted group-disabled:text-disabled dark:group-disabled:text-disabled forced-colors:text-[ButtonText] forced-colors:group-disabled:text-[GrayText]"
        />
        <Input
          placeholder={placeholder}
          className="pl-2 [&::-webkit-search-cancel-button]:hidden"
        />
        <FieldButton className="mr-1 w-6 group-empty:invisible">
          <FontAwesomeIcon icon={faXmark} aria-hidden className="h-4 w-4" />
        </FieldButton>
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaSearchField>
  );
}
