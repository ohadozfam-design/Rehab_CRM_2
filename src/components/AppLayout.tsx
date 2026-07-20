import { Outlet } from 'react-router-dom';
import Header from './Header';
import NewProjectWizard from './wizard/NewProjectWizard';
import NotificationEngine from './NotificationEngine';
import MorningSnapshot from './MorningSnapshot';

/** The authenticated app shell: fixed header + routed body + global modals. */
export default function AppLayout() {
  return (
    <div className="flex min-h-full flex-col bg-bg">
      {/* Background cron-style engine + once-daily morning dialog. */}
      <NotificationEngine />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <NewProjectWizard />
      <MorningSnapshot />
    </div>
  );
}
