import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from '../Pagination';

describe('Pagination', () => {
  it('renders nothing when there is only one page', () => {
    const { container } = render(
      <Pagination meta={{ page: 1, limit: 10, total: 5, totalPages: 1 }} onPageChange={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows page info and disables Previous on the first page', () => {
    render(<Pagination meta={{ page: 1, limit: 10, total: 25, totalPages: 3 }} onPageChange={vi.fn()} />);
    expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled();
  });

  it('calls onPageChange with the next page number', () => {
    const onPageChange = vi.fn();
    render(<Pagination meta={{ page: 1, limit: 10, total: 25, totalPages: 3 }} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('disables Next on the last page', () => {
    render(<Pagination meta={{ page: 3, limit: 10, total: 25, totalPages: 3 }} onPageChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });
});
