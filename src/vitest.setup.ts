import { afterEach } from 'node:test';
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export const user = userEvent.setup();

afterEach(() => {
  cleanup();
});
