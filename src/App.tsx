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
  return (
    <HeatDataProvider>
      <DashboardContent />
    </HeatDataProvider>
  );
}
