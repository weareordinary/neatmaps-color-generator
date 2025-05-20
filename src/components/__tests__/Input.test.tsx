import { render } from '@testing-library/react';
import { Input } from '../ui/input';
import { describe, it, expect } from 'vitest';

describe('Input', () => {
  it('renders an input element', () => {
    const { container } = render(<Input />);
    const input = container.querySelector('input');
    expect(input).toBeTruthy();
  });
});
