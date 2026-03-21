'use client';
import React from 'react';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Breadcrumb as AriaBreadcrumb,
  Breadcrumbs as AriaBreadcrumbs,
  type BreadcrumbProps,
  type BreadcrumbsProps,
  type LinkProps,
} from 'react-aria-components';
import { twMerge } from 'tailwind-merge';
import { composeProps } from '@/libs/variants';
import { Link } from './Link';

export function Breadcrumbs<T extends object>(props: BreadcrumbsProps<T>) {
  return (
    <AriaBreadcrumbs
      {...props}
      className={twMerge('flex gap-1', props.className)}
    />
  );
}

export function Breadcrumb(
  props: BreadcrumbProps & Omit<LinkProps, 'className'>
) {
  return (
    <AriaBreadcrumb
      {...props}
      className={composeProps(props.className, 'flex items-center gap-1')}
    >
      {({ isCurrent }) => (
        <>
          <Link variant="secondary" {...props} />
          {!isCurrent && (
            <FontAwesomeIcon
              icon={faChevronRight}
              className="text-muted dark:text-subtle h-3 w-3"
            />
          )}
        </>
      )}
    </AriaBreadcrumb>
  );
}
