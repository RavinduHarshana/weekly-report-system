import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ManagerPage from '../ManagerPage';

const emptyFilters = {
  userId: '',
  projectId: '',
  status: '',
  startDate: null,
  endDate: null,
};

const toQueryDate = (date) => (date ? date.toISOString().slice(0, 10) : '');

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState(emptyFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async (query = '') => {
    try {
      setLoading(true);
      const [projectData, reportData, summaryData, memberData] = await Promise.all([
        api.getProjects(),
        api.getReports(query),
        api.getDashboardSummary(''),
        api.getTeamMembers(),
      ]);

      setProjects(projectData || []);
      setReports(reportData || []);
      setSummary(summaryData);
      setTeamMembers(memberData || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLoadReports = async () => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value instanceof Date) {
        query.set(key, toQueryDate(value));
      } else if (value) {
        query.set(key, value);
      }
    });
    await loadData(query.toString() ? `?${query.toString()}` : '');
  };

  const handleCreateProject = async (payload) => {
    try {
      setLoading(true);
      await api.createProject(payload);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async (id, payload) => {
    try {
      setLoading(true);
      await api.updateProject(id, payload);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      setLoading(true);
      await api.deleteProject(id);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <ManagerPage
      user={user}
      summary={summary}
      reports={reports}
      projects={projects}
      teamMembers={teamMembers}
      filters={filters}
      setFilters={setFilters}
      onLoadReports={handleLoadReports}
      onCreateProject={handleCreateProject}
      onUpdateProject={handleUpdateProject}
      onDeleteProject={handleDeleteProject}
      onLogout={handleLogout}
      loading={loading}
      error={error}
    />
  );
}