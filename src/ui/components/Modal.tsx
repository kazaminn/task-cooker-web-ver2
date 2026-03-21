import {
  ModalOverlay,
  type ModalOverlayProps,
  Modal as RACModal,
} from 'react-aria-components';
import { tv } from '@/libs/tv';

const overlayStyles = tv({
  base: 'fixed inset-0 isolate z-60 bg-backdrop text-center backdrop-blur-lg',
  variants: {
    isEntering: {
      true: 'animate-in fade-in duration-200 ease-out',
    },
    isExiting: {
      true: 'animate-out fade-out duration-200 ease-in',
    },
  },
});

const modalStyles = tv({
  base: 'h-[min(100dvh,100%)] w-full max-w-full overflow-auto rounded-none border border-main/10 bg-base bg-clip-padding text-left align-middle font-sans text-body shadow-2xl dark:border-main/10 dark:bg-surface/70 dark:text-muted dark:backdrop-blur-2xl dark:backdrop-saturate-200 forced-colors:bg-[Canvas] sm:h-auto sm:max-h-[calc(100dvh-4rem)] sm:max-w-[min(90vw,720px)] sm:rounded-2xl',
  variants: {
    isEntering: {
      true: 'animate-in zoom-in-105 duration-200 ease-out',
    },
    isExiting: {
      true: 'animate-out zoom-out-95 duration-200 ease-in',
    },
  },
});

export function Modal(props: ModalOverlayProps) {
  return (
    <ModalOverlay {...props} className={overlayStyles}>
      <div className="box-border flex h-full w-full items-end justify-center p-0 sm:items-center sm:p-4">
        <RACModal {...props} className={modalStyles} />
      </div>
    </ModalOverlay>
  );
}
