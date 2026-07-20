import { Outlet } from 'react-router-dom';
import Header from './Header';

/** The authenticated app shell: fixed header + routed body. */
export default function AppLayout() {
  return (
    <div className="flex min-h-full flex-col bg-bg">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
