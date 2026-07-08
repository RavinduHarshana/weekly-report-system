import { useState, useEffect } from 'react';
import ReportForm from '../components/ReportForm';
import ReportList from '../components/ReportList';
import DashboardSidebar from '../components/DashboardSidebar';

const MEMBER_LINKS = [
  { href: '#report-form', label: 'Write report', description: 'Create or edit this week' },
  { href: '#report-history', label: 'Report history', description: 'Review submitted drafts' },
  { href: '#project-preview', label: 'Projects', description: 'See your assigned projects' },
];

export default function MemberPage({ user, projects, reports, editingReport, onSaveReport, onEditReport, onSubmitReport, onLogout, loading, error }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#report-form');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#report-form');
    };
    window.addEventListener('hashchange', handleHashChange);
    
    // Set default hash if none exists
    if (!window.location.hash) {
      window.location.hash = '#report-form';
    }
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Automatically switch to write-report form tab when editing a report
  useEffect(() => {
    if (editingReport) {
      window.location.hash = '#report-form';
    }
  }, [editingReport]);

  return (
    <div className="app-shell dashboard-layout">
      <DashboardSidebar
        title="Team Member"
        role="Personal workspace"
        userName={user.name}
        onLogout={onLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        links={MEMBER_LINKS}
      />

      <main className="dashboard-main">
        <header className="topbar panel">
          <div className="topbar-left">
            <button className="hamburger-btn" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar menu">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '22px', height: '22px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <div>
              <p className="eyebrow">Team Member workspace</p>
              <h1>{user.name}</h1>
            </div>
          </div>
          <div className="topbar-actions">
            <span className="status-pill status-submitted">{user.role}</span>
          </div>
        </header>

        {error ? <div className="error-banner panel">{error}</div> : null}

        {currentHash === '#report-form' && (
          <div className="tab-content" id="report-form">
            <ReportForm
              projects={projects}
              initialValue={editingReport}
              onSubmit={onSaveReport}
              onCancel={() => onEditReport(null)}
              submitting={loading}
            />
          </div>
        )}

        {currentHash === '#report-history' && (
          <div className="tab-content" id="report-history">
            <ReportList reports={reports} onEdit={onEditReport} onSubmit={onSubmitReport} />
          </div>
        )}

        {currentHash === '#project-preview' && (
          <section className="panel project-preview-panel tab-content" id="project-preview">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Assigned projects</p>
                <h2>Your current project scope</h2>
              </div>
            </div>
            <div className="stack-list">
              {projects.map((project) => (
                <article key={project._id} className="list-card">
                  <div className="list-card-top">
                    <div>
                      <h3>{project.name}</h3>
                      <p>{project.description || 'No description'}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}