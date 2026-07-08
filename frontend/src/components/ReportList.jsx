export default function ReportList({ reports, onEdit, onSubmit }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">History</p>
          <h2>My weekly reports</h2>
        </div>
      </div>

      <div className="stack-list">
        {reports.length === 0 ? <div className="empty-state">No reports yet.</div> : null}
        {reports.map((report) => (
          <article key={report._id} className="list-card">
            <div className="list-card-top">
              <div>
                <h3>{report.weekDateRange}</h3>
                <p>{report.startDate ? `${new Date(report.startDate).toLocaleDateString('en-GB')} to ${new Date(report.endDate).toLocaleDateString('en-GB')}` : 'Date range not set'}</p>
                <p>{report.projectId?.name || 'Project not loaded'}</p>
              </div>
              <span className={`status-pill status-${report.status}`}>{report.status}</span>
            </div>
            <p><strong>Completed:</strong> {report.tasksCompleted}</p>
            <p><strong>Planned:</strong> {report.tasksPlanned}</p>
            <p><strong>Blockers:</strong> {report.blockers}</p>
            <div className="inline-actions">
              <button className="ghost-button" onClick={() => onEdit(report)}>Edit</button>
              <button className="secondary-button" onClick={() => onSubmit(report)} disabled={report.status === 'submitted'}>
                {report.status === 'submitted' ? 'Submitted' : 'Mark Submitted'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}