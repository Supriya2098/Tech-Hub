import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { extractErrorMessage } from '@/lib/axios';
import { useAuth } from '../AuthContext';
import { useRegister } from '../hooks';

export function RegisterPage() {
  const [organizationName, setOrganizationName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const registerMutation = useRegister();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const result = await registerMutation.mutateAsync({ organizationName, name, email, password });
      login(result.user, result.tokens);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-xl font-bold text-brand-600 dark:text-brand-400">Tech-Hub</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create your organization's workspace.</p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            label="Organization name"
            name="organizationName"
            required
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
          />
          <Input label="Your name" name="name" required value={name} onChange={(e) => setName(e.target.value)} />
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
            autoComplete="new-password"
            required
            hint="At least 8 characters, with an uppercase letter, lowercase letter, and a number."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" isLoading={registerMutation.isPending} className="mt-2 w-full">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
