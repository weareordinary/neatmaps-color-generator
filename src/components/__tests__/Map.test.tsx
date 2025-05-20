import { render } from '@testing-library/react';
import { Map } from '../Map';
import { describe, it, expect } from 'vitest';

describe('Map', () => {
  it('renders an SVG with id "Layer_1"', () => {
    const { container } = render(<Map />);
    const svg = container.querySelector('svg#Layer_1');
    expect(svg).toBeTruthy();
  });
});
