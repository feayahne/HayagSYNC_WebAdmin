import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { IncidentProvider, useIncidents } from './context/IncidentContext';

// Layout Components
import ConfidentialityBanner from './components/layout/ConfidentialityBanner';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import Breadcrumbs from './components/layout/Breadcrumbs';
import NotificationDrawer from './components/layout/NotificationDrawer';
import SessionTimeoutModal from './components/common/SessionTimeoutModal';

// Modals
import IncidentDetailModal from './components/incidents/IncidentDetailModal';
import IncidentStatusModal from './components/incidents/IncidentStatusModal';
import StudentProfileModal from './components/students/StudentProfileModal';
import SummonsLetterModal from './components/documents/SummonsLetterModal';
import GuidedTourModal from './components/common/GuidedTourModal';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import IncidentsPage from './pages/IncidentsPage';
import StudentsPage from './pages/StudentsPage';
import AppealsPage from './pages/AppealsPage';
import CommunityServicePage from './pages/CommunityServicePage';
import ExpulsionsPage from './pages/ExpulsionsPage';
import ReportsExportPage from './pages/ReportsExportPage';
import AuditLogPage from './pages/AuditLogPage';
import SettingsPage from './pages/SettingsPage';

// Icons
import { Menu, X } from 'lucide-react';

function MainApp() {
  const { currentUser } = useAuth();
  const { incidents } = useIncidents();

  // Navigation tab state (defaults to dashboard)
  const [activeTab, setActiveTab] = useState('dashboard');
  const [incidentFilter, setIncidentFilter] = useState('ALL');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Text Scaling State for Gen X Readability (A- / A+)
  const [textScale, setTextScale] = useState(() => {
    return localStorage.getItem('hayagsync_text_scale') || 'normal';
  });

  // Light Mode is DEFAULT as requested
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('hayagsync_theme') === 'dark';
  });

  // Guided Tour modal state
  const [tourOpen, setTourOpen] = useState(false);

  // Modals state
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [statusIncident, setStatusIncident] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentModalOpen, setStudentModalOpen] = useState(false);

  const [summonsIncident, setSummonsIncident] = useState(null);
  const [summonsModalOpen, setSummonsModalOpen] = useState(false);

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Synchronize text scale to HTML root
  useEffect(() => {
    document.documentElement.setAttribute('data-text-scale', textScale);
    localStorage.setItem('hayagsync_text_scale', textScale);
  }, [textScale]);

  // Synchronize dark/light theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('hayagsync_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('hayagsync_theme', 'light');
    }
  }, [darkMode]);

  // If user is not logged in, render the dedicated institutional Login Page
  if (!currentUser) {
    return <LoginPage />;
  }

  // Cross-component handlers
  const handleSelectIncident = (inc) => {
    const fresh = incidents.find((item) => item.id === inc.id) || inc;
    setSelectedIncident(fresh);
    setDetailModalOpen(true);
  };

  const handleOpenStatusModal = (inc) => {
    const fresh = incidents.find((item) => item.id === inc.id) || inc;
    setStatusIncident(fresh);
    setStatusModalOpen(true);
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setStudentModalOpen(true);
  };

  const handleGenerateSummons = (inc) => {
    const fresh = incidents.find((item) => item.id === inc.id) || inc;
    setSummonsIncident(fresh);
    setSummonsModalOpen(true);
  };

  const handleNavigateWithFilter = (targetTab, filterValue = 'ALL') => {
    setActiveTab(targetTab);
    if (targetTab === 'incidents') {
      setIncidentFilter(filterValue);
    }
  };

  // Render view for the active tab
  const renderCurrentView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            onSelectIncident={handleSelectIncident}
            onViewStudent={handleSelectStudent}
            onNavigateTab={handleNavigateWithFilter}
          />
        );
      case 'incidents':
        return (
          <IncidentsPage
            key={incidentFilter}
            initialFilter={incidentFilter}
            onSelectIncident={handleSelectIncident}
            onChangeStatus={handleOpenStatusModal}
            onGenerateSummons={handleGenerateSummons}
          />
        );
      case 'students':
        return <StudentsPage onSelectStudent={handleSelectStudent} />;
      case 'appeals':
        return <AppealsPage />;
      case 'community-service':
        return <CommunityServicePage />;
      case 'expulsions':
        return <ExpulsionsPage />;
      case 'export-reports':
        return <ReportsExportPage onGenerateSummons={handleGenerateSummons} />;
      case 'audit-logs':
        return <AuditLogPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <DashboardPage
            onSelectIncident={handleSelectIncident}
            onViewStudent={handleSelectStudent}
            onNavigateTab={handleNavigateWithFilter}
          />
        );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Fixed Left Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform lg:static lg:translate-x-0 transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIncidentFilter('ALL');
            setMobileMenuOpen(false);
          }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Confidential System Notice Banner */}
        <ConfidentialityBanner />

        {/* Topbar: Prominent Search Box, A+/A- Controls, Help Tour, Notifications */}
        <div className="flex items-center bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-3.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            title="Toggle Menu"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex-1">
            <Topbar
              onSelectStudent={handleSelectStudent}
              onOpenNotifications={() => setNotificationsOpen(true)}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              textScale={textScale}
              onTextScaleChange={setTextScale}
              onOpenTour={() => setTourOpen(true)}
            />
          </div>
        </div>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-7 lg:p-8 bg-slate-100/90 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumbs for Gen X Location Orientation */}
            <Breadcrumbs
              activeTab={activeTab}
              onNavigate={(tab) => {
                setActiveTab(tab);
                setIncidentFilter('ALL');
              }}
            />

            {/* Current Tab Screen */}
            {renderCurrentView()}
          </div>
        </main>
      </div>

      {/* Modals & Overlays */}
      <IncidentDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        incident={selectedIncident}
        onChangeStatus={handleOpenStatusModal}
        onViewStudent={handleSelectStudent}
        onGenerateSummons={handleGenerateSummons}
      />

      <IncidentStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        incident={statusIncident}
      />

      <StudentProfileModal
        isOpen={studentModalOpen}
        onClose={() => setStudentModalOpen(false)}
        student={selectedStudent}
        onSelectIncident={handleSelectIncident}
      />

      <SummonsLetterModal
        isOpen={summonsModalOpen}
        onClose={() => setSummonsModalOpen(false)}
        incident={summonsIncident}
      />

      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onSelectIncident={handleSelectIncident}
      />

      {/* First-Time / On-Demand Guided Tour */}
      <GuidedTourModal
        isOpen={tourOpen}
        onClose={() => setTourOpen(false)}
      />

      {/* Auto Inactivity Lockout Modal (Philippine Data Privacy Compliance) */}
      <SessionTimeoutModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <IncidentProvider>
        <MainApp />
      </IncidentProvider>
    </AuthProvider>
  );
}
