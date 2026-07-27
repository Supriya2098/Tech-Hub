import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { LoginPage } from '../LoginPage';
import { AuthProvider } from '../../AuthContext';
import { ThemeProvider } from '../../../../app/ThemeContext';
import * as authApi from '../../api';

function renderLoginPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/login']}>
        <ThemeProvider>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders the sign-in form', () => {
    renderLoginPage();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('shows an error message when login fails', async () => {
    vi.spyOn(authApi, 'loginRequest').mockRejectedValueOnce(new Error('Invalid email or password'));
    renderLoginPage();

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong-password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(screen.getByText('Invalid email or password')).toBeInTheDocument());
  });

  it('stores tokens and redirects on successful login', async () => {
    vi.spyOn(authApi, 'loginRequest').mockResolvedValueOnce({
      user: { id: 'u1', organizationId: 'org1', organizationName: 'Acme', name: 'Ada', email: 'ada@example.com', role: 'ADMIN' },
      tokens: { accessToken: 'access-token', refreshToken: 'refresh-token', expiresIn: '15m' },
    });
    renderLoginPage();

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(localStorage.getItem('techhub.accessToken')).toBe('access-token'));
  });
});
