import React, { useState } from 'react';
import { HeatDataProvider, useHeatData } from './context/HeatDataContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { NotificationsDrawer } from './components/layout/NotificationsDrawer';
import { SettingsModal } from './components/layout/SettingsModal';
import { OverviewPage } from './components/pages/OverviewPage';
import { HeatRiskMapPage } from './components/pages/HeatRiskMapPage';
import { DataExplorerPage } from './components/pages/DataExplorerPage';
import { RiskAnalysisPage } from './components/pages/RiskAnalysisPage';
import { PreventiveActionsPage } from './components/pages/PreventiveActionsPage';
import { AboutProjectPage } from './components/pages/AboutProjectPage';
import { HistoryPage } from './components/pages/HistoryPage';
import { AuthPage } from './components/auth/AuthPage';
import { useAuth } from './context/AuthContext';

function DashboardContent() {
  const { activeTab } = useHeatData();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex text-[#14213D] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
        {/* Top Navbar */}
        <TopNavbar
          onToggleMobileMenu={() => setMobileSidebarOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && <OverviewPage />}
          {activeTab === 'map' && <HeatRiskMapPage />}
          {activeTab === 'explorer' && <DataExplorerPage />}
          {activeTab === 'analysis' && <RiskAnalysisPage />}
          {activeTab === 'actions' && <PreventiveActionsPage />}
          {activeTab === 'history' && <HistoryPage />}
          {activeTab === 'about' && <AboutProjectPage />}
        </main>
      </div>

      {/* Notifications Drawer */}
      <NotificationsDrawer
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  const { user, status, error, retry, logout } = useAuth();
  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Loading secure session…</div>;
  if (status === 'error') {
    return (
      <main className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-4">
        <section className="max-w-lg rounded-2xl border border-red-200 bg-white p-7 shadow-xl">
          <h1 className="text-xl font-bold text-[#14213D]">Secure session unavailable</h1>
          <p className="mt-3 text-sm text-slate-600">{error}</p>
          <p className="mt-3 text-xs text-slate-500">Confirm VITE_CONVEX_URL points to the active Convex deployment and that its auth functions are deployed.</p>
          <div className="mt-5 flex gap-3">
            <button onClick={retry} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Retry</button>
            <button onClick={() => void logout()} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Clear session</button>
          </div>
        </section>
      </main>
    );
  }
  if (!user) return <AuthPage />;
  return (
    <HeatDataProvider>
      <DashboardContent />
    </HeatDataProvider>
  );
}
