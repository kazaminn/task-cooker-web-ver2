import type { ReactNode } from 'react';
import { tv } from '@/libs/tv';

const avatarStyles = tv({
  base: 'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-main/70 bg-primary/10 font-medium text-primary select-none',
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

interface AvatarProps {
  src?: string | undefined;
  alt?: string;
  fallback: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({
  src,
  alt = '',
  fallback,
  size = 'md',
  className,
}: AvatarProps) {
  return (
    <span className={avatarStyles({ size, className })}>
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
