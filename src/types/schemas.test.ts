import { describe, it, expect } from 'vitest';
import {
  projectFormSchema,
  taskFormSchema,
  teamFormSchema,
  commentFormSchema,
} from './schemas';

describe('projectFormSchema', () => {
  it('validates valid project form', () => {
    const result = projectFormSchema.safeParse({
      name: 'My Project',
      slug: 'my-project',
      overview: '',
      status: 'planning',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = projectFormSchema.safeParse({
      name: '',
      slug: 'slug',
      status: 'planning',
    });
    expect(result.success).toBe(false);
  });
});

describe('taskFormSchema', () => {
  it('validates valid task form', () => {
    const result = taskFormSchema.safeParse({
      title: 'Do something',
      status: 'order',
      priority: 'medium',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = taskFormSchema.safeParse({
      title: '',
      status: 'order',
      priority: 'medium',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid status', () => {
    const result = taskFormSchema.safeParse({
      title: 'Test',
      status: 'invalid',
      priority: 'medium',
    });
    expect(result.success).toBe(false);
  });
});

describe('teamFormSchema', () => {
  it('validates valid team form', () => {
    expect(teamFormSchema.safeParse({ name: 'My Team' }).success).toBe(true);
  });

  it('rejects empty name', () => {
    expect(teamFormSchema.safeParse({ name: '' }).success).toBe(false);
  });
});

describe('commentFormSchema', () => {
  it('validates valid comment', () => {
    expect(commentFormSchema.safeParse({ body: 'Hello' }).success).toBe(true);
  });

  it('rejects empty body', () => {
    expect(commentFormSchema.safeParse({ body: '' }).success).toBe(false);
  });
});
