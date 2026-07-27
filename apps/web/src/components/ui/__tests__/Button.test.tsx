import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../Button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Save changes</Button>);
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Click me' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled and non-interactive while loading', () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} isLoading>
        Submit
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Submit' });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('respects an explicit disabled prop', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
  });
});
