import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { HeroSection } from '@/components/ui/hero-section';
import { SectionHeader } from '@/components/ui/section-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Toaster, toast } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserProfileForm } from '@/components/settings/UserProfileForm';
import { ApiKeyManagement } from '@/components/settings/ApiKeyManagement';
import { useAuth } from '@/hooks/use-auth';
export function SettingsPage() {
  const user = useAuth(state => state.user);
  const login = useAuth(state => state.login);
  const handleProfileUpdate = (values: { name: string; email: string }) => {
    // Mock update
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (user) {
          const updatedUser = { ...user, ...values };
          login(updatedUser);
          toast.success('Profile updated successfully!');
        }
        resolve();
      }, 500);
    });
  };
  return (
    <AppLayout>
      <ThemeToggle className="absolute top-4 right-4 z-50" />
      <main>
        <HeroSection
          title="Application Settings"
          subtitle="Manage your application-wide configurations, user preferences, and notification settings to tailor AetherFlow to your needs."
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 md:py-16 lg:py-20 space-y-12">
            <SectionHeader
              title="User Profile"
              description="Manage your personal account settings and preferences."
            />
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Update your name and email address.</CardDescription>
              </CardHeader>
              <CardContent>
                {user && <UserProfileForm user={user} onUpdate={handleProfileUpdate} />}
              </CardContent>
            </Card>
            <SectionHeader
              title="Notifications"
              description="Control how you receive notifications from the application."
            />
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Enable or disable notifications for various events.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <Label htmlFor="pipeline-errors" className="font-semibold">Pipeline Errors</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications for pipeline failures.</p>
                  </div>
                  <Switch id="pipeline-errors" defaultChecked onCheckedChange={(checked) => toast.info(`Pipeline error notifications ${checked ? 'enabled' : 'disabled'}.`)} />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <Label htmlFor="pipeline-success" className="font-semibold">Pipeline Success</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications for successful pipeline runs.</p>
                  </div>
                  <Switch id="pipeline-success" onCheckedChange={(checked) => toast.info(`Pipeline success notifications ${checked ? 'enabled' : 'disabled'}.`)} />
                </div>
              </CardContent>
            </Card>
            <SectionHeader
              title="API Management"
              description="Manage API keys for programmatic access."
            />
            <ApiKeyManagement />
          </div>
        </div>
      </main>
      <Toaster richColors closeButton />
    </AppLayout>
  );
}