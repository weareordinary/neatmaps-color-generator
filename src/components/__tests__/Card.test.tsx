import { render } from '@testing-library/react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { describe, it, expect } from 'vitest';

describe('Card', () => {
  it('renders children within CardContent', () => {
    const { getByText } = render(
      <Card>
        <CardHeader>Header</CardHeader>
        <CardContent>Content</CardContent>
      </Card>
    );
    expect(getByText('Header')).toBeTruthy();
    expect(getByText('Content')).toBeTruthy();
  });
});
