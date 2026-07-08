import { useEffect } from 'react';

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

export default function DashboardSidebar({
  title,
  role,
  userName,
  onLogout,
  sidebarOpen,
  setSidebarOpen,
  links,
}) {
  const currentHash = window.location.hash || links[0]?.href || '';

  // Close sidebar drawer on hash change (mobile)
  useEffect(() => {
    const handleHashChange = () => {
      setSidebarOpen(false);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setSidebarOpen]);

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`dashboard-sidebar panel ${sidebarOpen ? 'open' : ''}`}>
        {/* Mobile Close Button */}
        <button 
          className="sidebar-close-btn" 
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '22px', height: '22px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="dashboard-sidebar-header">
          <div className="user-profile-summary">
            <span className="member-avatar">{getInitials(userName)}</span>
            <div className="user-profile-text">
              <h3>{userName}</h3>
              <p className="eyebrow" style={{ margin: 0, fontSize: '0.68rem' }}>{role}</p>
            </div>
          </div>
          <div style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px', marginTop: '12px' }}>
            <span className="sidebar-app-title" style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent)' }}>{title}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => {
            const isActive = currentHash === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <strong>{link.label}</strong>
                <small>{link.description}</small>
              </a>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="danger-button sidebar-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
