import { useEffect, useState, type FormEvent } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/components/ui/ToastProvider';
import { extractErrorMessage } from '@/lib/axios';
import { useAuth } from '@/features/auth/AuthContext';
import { useOrgSettings, useUpdateOrgSettings, useUpdateProfile } from '../hooks';

export function SettingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { data: orgSettings, isLoading, isError, refetch } = useOrgSettings();
  const updateOrgSettings = useUpdateOrgSettings();
  const updateProfile = useUpdateProfile();

  const [orgForm, setOrgForm] = useState({ organizationName: '', timezone: 'UTC', currency: 'USD', dateFormat: 'MM/DD/YYYY' });
  const [profileForm, setProfileForm] = useState({ name: user?.name ?? '', currentPassword: '', newPassword: '' });
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (orgSettings) {
      setOrgForm({
        organizationName: orgSettings.organizationName,
        timezone: orgSettings.timezone,
        currency: orgSettings.currency,
        dateFormat: orgSettings.dateFormat,
      });
    }
  }, [orgSettings]);

  async function handleOrgSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await updateOrgSettings.mutateAsync(orgForm);
      showToast('Organization settings saved', 'success');
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    }
  }

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setProfileError(null);
    try {
      await updateProfile.mutateAsync({
        name: profileForm.name,
        currentPassword: profileForm.currentPassword || undefined,
        newPassword: profileForm.newPassword || undefined,
      });
      showToast('Profile updated', 'success');
      setProfileForm((f) => ({ ...f, currentPassword: '', newPassword: '' }));
    } catch (err) {
      setProfileError(extractErrorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader title="Settings" description="Manage your organization and personal account preferences." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Organization</h2>
          </CardHeader>
          <CardBody>
            {isLoading && <Spinner />}
            {isError && <ErrorState message="Failed to load organization settings." onRetry={() => refetch()} />}
            {!isLoading && !isError && (
              <form className="flex flex-col gap-4" onSubmit={handleOrgSubmit}>
                <Input
                  label="Organization name"
                  disabled={user?.role !== 'ADMIN'}
                  value={orgForm.organizationName}
                  onChange={(e) => setOrgForm((f) => ({ ...f, organizationName: e.target.value }))}
                />
                <Select
                  label="Currency"
                  disabled={user?.role !== 'ADMIN'}
                  value={orgForm.currency}
                  onChange={(e) => setOrgForm((f) => ({ ...f, currency: e.target.value }))}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </Select>
                <Input
                  label="Timezone"
                  disabled={user?.role !== 'ADMIN'}
                  value={orgForm.timezone}
                  onChange={(e) => setOrgForm((f) => ({ ...f, timezone: e.target.value }))}
                />
                {user?.role === 'ADMIN' && (
                  <Button type="submit" isLoading={updateOrgSettings.isPending} className="self-start">
                    Save organization settings
                  </Button>
                )}
                {user?.role !== 'ADMIN' && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">Only an admin can change organization settings.</p>
                )}
              </form>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Your profile</h2>
          </CardHeader>
          <CardBody>
            <form className="flex flex-col gap-4" onSubmit={handleProfileSubmit}>
              <Input
                label="Name"
                value={profileForm.name}
                onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
              />
              <Input label="Email" value={user?.email ?? ''} disabled />
              <Input
                label="Current password"
                type="password"
                hint="Required only if setting a new password"
                value={profileForm.currentPassword}
                onChange={(e) => setProfileForm((f) => ({ ...f, currentPassword: e.target.value }))}
              />
              <Input
                label="New password"
                type="password"
                value={profileForm.newPassword}
                onChange={(e) => setProfileForm((f) => ({ ...f, newPassword: e.target.value }))}
              />
              {profileError && <p className="text-sm text-red-600">{profileError}</p>}
              <Button type="submit" isLoading={updateProfile.isPending} className="self-start">
                Save profile
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
