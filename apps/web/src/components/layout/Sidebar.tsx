import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserSquare2,
  FolderKanban,
  ListChecks,
  Wallet,
  Bell,
  FileText,
  Sparkles,
  BarChart3,
  Settings,
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/employees', label: 'Employees', icon: UserSquare2 },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/finance', label: 'Finance', icon: Wallet },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/ai-insights', label: 'AI Insights', icon: Sparkles },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex">
      <div className="flex h-16 items-center px-5">
        <span className="text-lg font-bold text-brand-600 dark:text-brand-400">Tech-Hub</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
