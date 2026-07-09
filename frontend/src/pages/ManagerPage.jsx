import { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import MetricCard from '../components/MetricCard';
import ProjectManager from '../components/ProjectManager';
import DashboardSidebar from '../components/DashboardSidebar';
import { api } from '../services/api';

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

  const [isChatWidgetOpen, setIsChatWidgetOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'bot',
      text: `Hello, ${user?.name || 'Manager'}. I am your AI Assistant. I have analyzed all projects, team members, and weekly reports. How can I help you today?`
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');

  useEffect(() => {
    if (isChatWidgetOpen) {
      const box = document.getElementById('chat-log-box');
      if (box) {
        // Delay scroll slightly to allow DOM updates
        setTimeout(() => {
          box.scrollTop = box.scrollHeight;
        }, 50);
      }
    }
  }, [chatMessages, chatLoading, isChatWidgetOpen]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const query = chatInput.trim();
    if (!query) return;

    setChatMessages((prev) => [...prev, { role: 'user', text: query }]);
    setChatInput('');
    setChatLoading(true);
    setChatError('');

    try {
      const res = await api.askChatbot(query);
      setChatMessages((prev) => [...prev, { role: 'bot', text: res.response }]);
    } catch (err) {
      setChatError(err.message || 'Failed to communicate with AI Assistant.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendSuggestion = async (text) => {
    setChatMessages((prev) => [...prev, { role: 'user', text }]);
    setChatLoading(true);
    setChatError('');

    try {
      const res = await api.askChatbot(text);
      setChatMessages((prev) => [...prev, { role: 'bot', text: res.response }]);
    } catch (err) {
      setChatError(err.message || 'Failed to communicate with AI Assistant.');
    } finally {
      setChatLoading(false);
    }
  };

  const formatBotText = (text) => {
    if (!text) return '';
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

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
              </div>
            </section>

            <div className="two-column-layout">
              <section className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="panel-header" style={{ marginBottom: 0 }}>
                  <div>
                    <p className="eyebrow">Submission status</p>
                    <h2>Team Member Board</h2>
                  </div>
                  <div className="chart-donut-mini" style={{ width: '80px', height: '80px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={completionChartData} dataKey="submitted" nameKey="name" outerRadius={38} innerRadius={26} paddingAngle={2}>
                          {completionChartData.map((entry, index) => (
                            <Cell key={entry.name} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="submission-table-container" style={{ overflowX: 'auto' }}>
                  <table className="submission-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--panel-border)', color: 'var(--muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <th style={{ padding: '12px 8px' }}>Member</th>
                        <th style={{ padding: '12px 8px' }}>Status</th>
                        <th style={{ padding: '12px 8px' }}>Latest Submission</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(summary?.statusByMember || []).map((member) => (
                        <tr key={member.memberId} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '12px 8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span className="member-avatar small" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>{getInitials(member.name)}</span>
                              <div>
                                <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{member.name}</strong>
                                <br />
                                <small style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{member.email}</small>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            <span className={`status-pill status-${member.status}`} style={{ fontSize: '0.74rem', padding: '4px 10px', display: 'inline-block' }}>
                              {member.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 8px', fontSize: '0.82rem', color: 'var(--text)' }}>
                            {member.latestWeek || 'None'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="panel-header" style={{ marginBottom: 0 }}>
                  <div>
                    <p className="eyebrow">Active alerts</p>
                    <h2>Blockers & Activity</h2>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                  <div className="blocker-alerts-panel" style={{ display: 'grid', gap: '10px' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                      </svg>
                      Active Blocker Notes
                    </h3>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {(summary?.recentReports || []).filter(r => r.blockers && r.blockers.toLowerCase() !== 'none' && r.blockers.trim() !== '').length === 0 ? (
                        <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: 0, padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.06)' }}>
                          No active blockers reported this week!
                        </p>
                      ) : (
                        (summary?.recentReports || [])
                          .filter(r => r.blockers && r.blockers.toLowerCase() !== 'none' && r.blockers.trim() !== '')
                          .slice(0, 2)
                          .map((report) => (
                            <div key={report._id} style={{ background: 'rgba(231, 111, 81, 0.08)', border: '1px solid rgba(231, 111, 81, 0.2)', borderRadius: '12px', padding: '10px 14px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
                                <strong style={{ color: '#ffcabf' }}>{report.userId?.name}</strong>
                                <span style={{ color: 'var(--muted)' }}>{report.projectId?.name}</span>
                              </div>
                              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.4 }}>
                                "{report.blockers}"
                              </p>
                            </div>
                          ))
                      )}
                    </div>
                  </div>

                  <div className="recent-activity-panel" style={{ display: 'grid', gap: '10px', borderTop: '1px solid var(--panel-border)', paddingTop: '16px' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--accent)' }}>Recent Submissions</h3>
                    <div className="recent-activity-list" style={{ marginTop: 0 }}>
                      {(summary?.recentReports || []).length === 0 ? (
                        <p className="empty-state">No recent activity found.</p>
                      ) : (
                        (summary?.recentReports || []).slice(0, 3).map((report) => (
                          <div key={report._id} className="activity-item" style={{ padding: '10px 12px' }}>
                            <div className="activity-user">
                              <span className="member-avatar small" style={{ width: '26px', height: '26px', fontSize: '0.7rem' }}>{getInitials(report.userId?.name)}</span>
                              <div className="activity-user-text">
                                <strong style={{ fontSize: '0.85rem' }}>{report.userId?.name}</strong>
                                <p style={{ fontSize: '0.72rem' }}>{report.weekDateRange}</p>
                              </div>
                            </div>
                            <span className={`status-pill status-${report.status}`} style={{ transform: 'scale(0.8)', transformOrigin: 'right center' }}>
                              {report.status}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>
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

      {/* Floating Chatbot Assistant Widget */}
      <button
        className="chatbot-floating-button"
        onClick={() => setIsChatWidgetOpen(!isChatWidgetOpen)}
        title="AI Status Assistant"
        aria-label="Toggle AI Status Assistant"
      >
        {isChatWidgetOpen ? '✕' : '🤖'}
      </button>

      {isChatWidgetOpen && (
        <div className="chatbot-popup-window">
          <div className="chatbot-popup-header">
            <div>
              <h3>🤖 Status Assistant</h3>
              <p>Ask about reports, status, and blockers</p>
            </div>
            <button className="chatbot-popup-close" onClick={() => setIsChatWidgetOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="chatbot-popup-container">
            {/* Suggestion Pills */}
            <div className="chatbot-popup-suggestions">
              <button className="suggestion-pill" onClick={() => handleSendSuggestion("Who has blockers this week?")} disabled={chatLoading}>
                Blockers?
              </button>
              <button className="suggestion-pill" onClick={() => handleSendSuggestion("Summarize recent activities of team members")} disabled={chatLoading}>
                Activities
              </button>
              <button className="suggestion-pill" onClick={() => handleSendSuggestion("Which project has the highest workload?")} disabled={chatLoading}>
                Workloads
              </button>
            </div>

            {/* Chat log */}
            <div className="chat-log" id="chat-log-box" style={{ padding: '12px' }}>
              {chatMessages.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.role}`} style={{ maxWidth: '90%' }}>
                  <div className="chat-avatar" style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}>
                    {msg.role === 'bot' ? '🤖' : getInitials(user?.name) || 'M'}
                  </div>
                  <div className="chat-content">
                    <div className="chat-bubble" style={{ padding: '10px 14px', fontSize: '0.84rem' }}>
                      <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.45' }}>
                        {formatBotText(msg.text)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="chat-message bot loading" style={{ maxWidth: '90%' }}>
                  <div className="chat-avatar" style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}>🤖</div>
                  <div className="chat-content">
                    <div className="chat-bubble typing-indicator" style={{ padding: '10px 14px' }}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              {chatError && (
                <div className="chatbot-error-message" style={{ padding: '10px 12px', fontSize: '0.8rem' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '14px', height: '14px' }}>
                    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                  </svg>
                  {chatError}
                </div>
              )}
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendMessage} className="chat-input-form">
              <input
                type="text"
                placeholder="Ask weekly status..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={chatLoading}
                style={{ padding: '10px 14px', fontSize: '0.86rem' }}
              />
              <button type="submit" className="primary-button" disabled={chatLoading || !chatInput.trim()} style={{ padding: '10px 16px', fontSize: '0.86rem' }}>
                {chatLoading ? '...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}