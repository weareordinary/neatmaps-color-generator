import { render } from '@testing-library/react';
import { Button } from '../ui/button';
import { describe, it, expect } from 'vitest';

describe('Button', () => {
  it('renders a button element', () => {
    const { container } = render(<Button>Click</Button>);
    const btn = container.querySelector('button');
    expect(btn).toBeTruthy();
  });
});
