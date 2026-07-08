import { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import MetricCard from '../components/MetricCard';
import ProjectManager from '../components/ProjectManager';
import DashboardSidebar from '../components/DashboardSidebar';

const STATUS_COLORS = ['#e4572e', '#2a9d8f', '#f4a261'];

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

const MANAGER_LINKS = [
  { href: '#overview', label: 'Overview & Trends', description: 'Charts and key metrics' },
  { href: '#queries', label: 'Report Queries', description: 'Search team reports' },
  { href: '#projects', label: 'Manage Projects', description: 'Create and edit projects' },
];

export default function ManagerPage({ user, summary, reports, projects, teamMembers, filters, setFilters, onLoadReports, onCreateProject, onUpdateProject, onDeleteProject, onLogout, loading, error }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#overview');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#overview');
    };
    window.addEventListener('hashchange', handleHashChange);
    
    // Set default hash if none exists
    if (!window.location.hash) {
      window.location.hash = '#overview';
    }
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const completionChartData = (summary?.statusByMember || []).map((member) => ({
    name: member.name,
    submitted: member.submitted ? 1 : 0,
  }));

  const projectWorkloadData = (summary?.projectWorkload || []).map((project) => ({
    name: project.projectName,
    reports: project.reportCount,
  }));

  return (
    <div className="app-shell dashboard-layout">
      <DashboardSidebar
        title="Manager Portal"
        role="Dashboard Management"
        userName={user.name}
        onLogout={onLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        links={MANAGER_LINKS}
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
              <p className="eyebrow">Manager workspace</p>
              <h1>{user.name}</h1>
            </div>
          </div>
          <div className="topbar-actions">
            <span className="status-pill status-submitted">{user.role}</span>
          </div>
        </header>

        {error ? <div className="error-banner panel">{error}</div> : null}

        {currentHash === '#overview' && (
          <>
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
                      <defs>
                        <linearGradient id="taskGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2a9d8f" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#1e3a34" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff' }} />
                      <Bar dataKey="completedItems" fill="url(#taskGrad)" radius={[6, 6, 0, 0]} barSize={26} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-card">
                  <h3>Submission status by member</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={completionChartData} dataKey="submitted" nameKey="name" outerRadius={90} innerRadius={55} paddingAngle={3} label>
                        {completionChartData.map((entry, index) => (
                          <Cell key={entry.name} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-card">
                  <h3>Workload by project</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={projectWorkloadData}>
                      <defs>
                        <linearGradient id="workloadGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f4a261" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#e76f51" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff' }} />
                      <Bar dataKey="reports" fill="url(#workloadGrad)" radius={[6, 6, 0, 0]} barSize={26} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-card">
                  <h3>Recent activity</h3>
                  <div className="recent-activity-list">
                    {(summary?.recentReports || []).length === 0 ? (
                      <p className="empty-state">No recent activity found.</p>
                    ) : (
                      (summary?.recentReports || []).slice(0, 4).map((report) => (
                        <div key={report._id} className="activity-item">
                          <div className="activity-user">
                            <span className="member-avatar small">{getInitials(report.userId?.name)}</span>
                            <div className="activity-user-text">
                              <strong>{report.userId?.name}</strong>
                              <p>{report.weekDateRange}</p>
                            </div>
                          </div>
                          <span className={`status-pill status-${report.status}`} style={{ transform: 'scale(0.85)', transformOrigin: 'right center' }}>
                            {report.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {currentHash === '#queries' && (
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
        )}

        {currentHash === '#projects' && (
          <ProjectManager projects={projects} teamMembers={teamMembers || []} onCreate={onCreateProject} onUpdate={onUpdateProject} onDelete={onDeleteProject} />
        )}
      </main>
    </div>
  );
}