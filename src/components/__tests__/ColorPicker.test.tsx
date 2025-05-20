import { render, fireEvent } from '@testing-library/react';
import { ColorPicker } from '../ColorPicker';
import { describe, it, expect, vi } from 'vitest';

describe('ColorPicker', () => {
  it('calls onColorChange when the color changes', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <ColorPicker className="cls-1" color="#000000" onColorChange={handleChange} />
    );
    const input = container.querySelector('input[type="color"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '#ffffff' } });
    expect(handleChange).toHaveBeenCalledWith('cls-1', '#ffffff');
  });
});
