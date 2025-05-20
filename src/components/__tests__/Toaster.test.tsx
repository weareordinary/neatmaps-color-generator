import { render } from '@testing-library/react';
import { Toaster } from '../ui/toaster';
import { describe, it, expect } from 'vitest';

describe('Toaster', () => {
  it('renders ToastViewport', () => {
    const { container } = render(<Toaster />);
    const viewport = container.querySelector('ol');
    expect(viewport).toBeTruthy();
  });
});
