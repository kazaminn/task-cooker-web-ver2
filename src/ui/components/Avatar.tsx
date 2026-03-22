import type { ReactNode } from 'react';
import { tv } from '@/libs/tv';

const avatarStyles = tv({
  base: 'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-main/70 font-medium select-none',
  variants: {
    size: {
      sm: 'h-6 w-6 text-[11px]',
      md: 'h-9 w-9 text-sm',
      lg: 'h-16 w-16 text-xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const fallbackToneClasses = [
  'bg-primary/10 text-primary',
  'bg-success/12 text-success',
  'bg-warning/12 text-warning-fg',
  'bg-info/12 text-info',
  'bg-danger/10 text-danger',
  'bg-accent/12 text-accent-fg',
] as const;

function getToneClass(seed: string | undefined) {
  if (!seed) return fallbackToneClasses[0];

  let hash = 0;
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return fallbackToneClasses[hash % fallbackToneClasses.length];
}

interface AvatarProps {
  src?: string | undefined;
  alt?: string;
  fallback: ReactNode;
  seed?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({
  src,
  alt = '',
  fallback,
  seed,
  size = 'md',
  className,
}: AvatarProps) {
  return (
    <span
      className={avatarStyles({
        size,
        className: src
          ? className
          : `${getToneClass(seed)} ${className ?? ''}`.trim(),
      })}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        fallback
      )}
    </span>
  );
}

interface AvatarGroupProps {
  children: ReactNode;
  className?: string;
}

export function AvatarGroup({ children, className }: AvatarGroupProps) {
  return (
    <div
      className={tv({
        base: 'flex items-center [&>*:not(:first-child)]:-ml-2',
      })({ className })}
    >
      {children}
    </div>
  );
}
