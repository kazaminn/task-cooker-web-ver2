'use client';
import React, { type ReactNode } from 'react';
import {
  faCircleExclamation,
  faCircleInfo,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { chain } from 'react-aria';
import { type DialogProps, Heading } from 'react-aria-components';
import { Button } from './Button';
import { Dialog } from './Dialog';

interface AlertDialogProps extends Omit<DialogProps, 'children'> {
  title: string;
  children: ReactNode;
  variant?: 'info' | 'destructive';
  actionLabel: string;
  cancelLabel?: string;
  onAction?: () => void;
}

export function AlertDialog({
  title,
  variant,
  cancelLabel,
  actionLabel,
  onAction,
  children,
  ...props
}: AlertDialogProps) {
  return (
    <Dialog role="alertdialog" {...props}>
      {({ close }) => (
        <>
          <Heading
            slot="title"
            className="my-0 text-xl leading-6 font-semibold"
          >
            {title}
          </Heading>
          <div
            className={`absolute top-6 right-6 h-6 w-6 stroke-2 ${variant === 'destructive' ? 'text-danger' : 'text-primary'}`}
          >
            {variant === 'destructive' ? (
              <FontAwesomeIcon icon={faCircleExclamation} aria-hidden />
            ) : (
              <FontAwesomeIcon icon={faCircleInfo} aria-hidden />
            )}
          </div>
          <p className="dark:text-subtle text-muted mt-3">{children}</p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onPress={close}>
              {cancelLabel ?? 'Cancel'}
            </Button>
            <Button
              variant={variant === 'destructive' ? 'destructive' : 'primary'}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              onPress={chain(onAction, close)}
            >
              {actionLabel}
            </Button>
          </div>
        </>
      )}
    </Dialog>
  );
}
