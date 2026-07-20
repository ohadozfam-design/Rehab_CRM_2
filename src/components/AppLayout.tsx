import { Outlet } from 'react-router-dom';
import Header from './Header';
import NewProjectWizard from './wizard/NewProjectWizard';

/** The authenticated app shell: fixed header + routed body + global modals. */
export default function AppLayout() {
  return (
    <div className="flex min-h-full flex-col bg-bg">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <NewProjectWizard />
    </div>
  );
}
