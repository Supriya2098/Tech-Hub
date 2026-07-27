import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { useUnreadCount } from '@/features/notifications/hooks';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Topbar() {
  const { user, logout } = useAuth();
  const { data: unreadCount } = useUnreadCount();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
      <div>
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.organizationName}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {user?.name} &middot; {user?.role}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link
          to="/notifications"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <Bell className="h-5 w-5" />
          {Boolean(unreadCount) && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </Link>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </header>
  );
}
