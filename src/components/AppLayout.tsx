import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useUIStore } from '../stores/useUIStore';
import Header from './Header';
import NewProjectWizard from './wizard/NewProjectWizard';
import NotificationEngine from './NotificationEngine';
import MorningSnapshot from './MorningSnapshot';
import SettingsModal from './SettingsModal';
import AdminCenter from './admin/AdminCenter';
import ImpersonationBanner from './ImpersonationBanner';
import ActivityTracker from './ActivityTracker';
import ContractorFieldView from './field/ContractorFieldView';

/** The authenticated app shell: header + routed body + global modals. */
export default function AppLayout() {
  const user = useAuthStore((s) => s.currentUser());
  const fieldView = useUIStore((s) => s.fieldView);
  const setFieldView = useUIStore((s) => s.setFieldView);

  // Contractors on a narrow viewport default into the simplified field view.
  useEffect(() => {
    if (user?.role === 'contractor' && window.innerWidth < 768) {
      setFieldView(true);
    }
    // Only when the acting user changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (user?.role === 'contractor' && fieldView) {
    return (
      <>
        <ActivityTracker />
        <NotificationEngine />
        <ContractorFieldView />
      </>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-bg">
      <ActivityTracker />
      <NotificationEngine />
      <ImpersonationBanner />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Global modals */}
      <NewProjectWizard />
      <SettingsModal />
      <AdminCenter />
      <MorningSnapshot />
    </div>
  );
}
