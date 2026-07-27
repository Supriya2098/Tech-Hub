import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { extractErrorMessage } from '@/lib/axios';
import { useAuth } from '../AuthContext';
import { useLogin } from '../hooks';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const loginMutation = useLogin();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      login(result.user, result.tokens);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-xl font-bold text-brand-600 dark:text-brand-400">Tech-Hub</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to your business operating system.</p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" isLoading={loginMutation.isPending} className="mt-2 w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
