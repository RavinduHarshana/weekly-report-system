import ReportForm from '../components/ReportForm';
import ReportList from '../components/ReportList';

export default function MemberPage({ user, projects, reports, editingReport, onSaveReport, onEditReport, onSubmitReport, onLogout, loading, error }) {
  return (
    <div className="app-shell">
      <header className="topbar panel">
        <div>
          <p className="eyebrow">Team Member workspace</p>
          <h1>{user.name}</h1>
        </div>
        <div className="topbar-actions">
          <span className="status-pill status-submitted">{user.role}</span>
          <button className="ghost-button" onClick={onLogout}>Logout</button>
        </div>
      </header>

      {error ? <div className="error-banner panel">{error}</div> : null}

      <div className="two-column-layout">
        <ReportForm
          projects={projects}
          initialValue={editingReport}
          onSubmit={onSaveReport}
          onCancel={() => onEditReport(null)}
          submitting={loading}
        />
        <ReportList reports={reports} onEdit={onEditReport} onSubmit={onSubmitReport} />
      </div>
    </div>
  );
}