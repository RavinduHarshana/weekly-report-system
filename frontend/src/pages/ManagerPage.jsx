import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import MetricCard from '../components/MetricCard';
import ProjectManager from '../components/ProjectManager';

const STATUS_COLORS = ['#e4572e', '#2a9d8f', '#f4a261'];

export default function ManagerPage({ user, summary, reports, projects, teamMembers, filters, setFilters, onLoadReports, onCreateProject, onUpdateProject, onDeleteProject, onLogout, loading, error }) {
  const completionChartData = (summary?.statusByMember || []).map((member) => ({
    name: member.name,
    submitted: member.submitted ? 1 : 0,
  }));

  const projectWorkloadData = (summary?.projectWorkload || []).map((project) => ({
    name: project.projectName,
    reports: project.reportCount,
  }));

  return (
    <div className="app-shell">
      <header className="topbar panel">
        <div>
          <p className="eyebrow">Manager dashboard</p>
          <h1>{user.name}</h1>
        </div>
        <div className="topbar-actions">
          <span className="status-pill status-submitted">{user.role}</span>
          <button className="ghost-button" onClick={onLogout}>Logout</button>
        </div>
      </header>

      {error ? <div className="error-banner panel">{error}</div> : null}

      <section className="metrics-grid">
          <MetricCard label="Reports submitted this week" value={summary?.metrics?.totalReportsSubmittedThisWeek ?? 0} />
          <MetricCard label="Submission rate" value={`${summary?.metrics?.submissionRate ?? 0}%`} />
          <MetricCard label="Open blockers" value={summary?.metrics?.openBlockers ?? 0} />
          <MetricCard label="Pending members" value={summary?.metrics?.pendingMembers ?? 0} />
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Team analytics</p>
            <h2>Charts and trends</h2>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <h3>Completed task trend</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={summary?.tasksCompletedTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completedItems" fill="#2a9d8f" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card">
            <h3>Submission status by member</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={completionChartData} dataKey="submitted" nameKey="name" outerRadius={100} label>
                  {completionChartData.map((entry, index) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card">
            <h3>Workload by project</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={projectWorkloadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="reports" fill="#f4a261" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card">
            <h3>Recent activity</h3>
            <div className="stack-list" style={{ marginTop: '12px' }}>
              {(summary?.recentReports || []).slice(0, 5).map((report) => (
                <article key={report._id} className="list-card" style={{ padding: '14px' }}>
                  <div className="list-card-top">
                    <div>
                      <h3>{report.userId?.name}</h3>
                      <p>{report.weekDateRange}</p>
                    </div>
                    <span className={`status-pill status-${report.status}`}>{report.status}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Filters</p>
            <h2>Report queries</h2>
          </div>
          <button className="primary-button" onClick={onLoadReports} disabled={loading}>Apply filters</button>
        </div>

        <div className="compact-form filter-grid">
          <select value={filters.userId} onChange={(event) => setFilters((current) => ({ ...current, userId: event.target.value }))}>
            <option value="">All team members</option>
            {(teamMembers || []).map((member) => (
              <option key={member._id} value={member._id}>
                {member.name}
              </option>
            ))}
          </select>
          <select value={filters.projectId} onChange={(event) => setFilters((current) => ({ ...current, projectId: event.target.value }))}>
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
          <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
            <option value="">Any status</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="late">Late</option>
          </select>
          <DatePicker
            selected={filters.startDate}
            onChange={(date) => setFilters((current) => ({ ...current, startDate: date }))}
            selectsStart
            startDate={filters.startDate}
            endDate={filters.endDate}
            placeholderText="Start date"
            className="date-picker-input"
            dateFormat="dd MMM yyyy"
          />
          <DatePicker
            selected={filters.endDate}
            onChange={(date) => setFilters((current) => ({ ...current, endDate: date }))}
            selectsEnd
            startDate={filters.startDate}
            endDate={filters.endDate}
            minDate={filters.startDate}
            placeholderText="End date"
            className="date-picker-input"
            dateFormat="dd MMM yyyy"
          />
        </div>

        <div className="stack-list">
          {reports.map((report) => (
            <article key={report._id} className="list-card">
              <div className="list-card-top">
                <div>
                  <h3>{report.weekDateRange}</h3>
                  <p>{report.userId?.name} • {report.projectId?.name}</p>
                </div>
                <span className={`status-pill status-${report.status}`}>{report.status}</span>
              </div>
              <p><strong>Completed:</strong> {report.tasksCompleted}</p>
              <p><strong>Planned:</strong> {report.tasksPlanned}</p>
              <p><strong>Blockers:</strong> {report.blockers}</p>
            </article>
          ))}
        </div>
      </section>

      <ProjectManager projects={projects} teamMembers={teamMembers || []} onCreate={onCreateProject} onUpdate={onUpdateProject} onDelete={onDeleteProject} />
    </div>
  );
}