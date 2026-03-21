import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach } from 'node:test';

export const user = userEvent.setup();

afterEach(() => {
  cleanup();
});
