import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdvisorPage from '../../src/pages/AdvisorPage';

describe('AdvisorFlow', () => {
  it('placeholder', () => {
    render(<AdvisorPage />);
    expect(screen).toBeDefined();
  });
});
