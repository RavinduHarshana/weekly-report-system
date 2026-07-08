import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MemberPage from '../MemberPage';

export default function MemberDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [editingReport, setEditingReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectData, reportData] = await Promise.all([api.getProjects(), api.getMyReports()]);
      setProjects(projectData || []);
      setReports(reportData || []);
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

  const refresh = async () => {
    await loadData();
  };

  const handleSaveReport = async (payload) => {
    try {
      setLoading(true);
      if (editingReport?._id) {
        await api.updateReport(editingReport._id, payload);
      } else {
        await api.createReport(payload);
      }
      setEditingReport(null);
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async (report) => {
    try {
      setLoading(true);
      await api.submitReport(report._id);
      await refresh();
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
    <MemberPage
      user={user}
      projects={projects}
      reports={reports}
      editingReport={editingReport}
      onSaveReport={handleSaveReport}
      onEditReport={setEditingReport}
      onSubmitReport={handleSubmitReport}
      onLogout={handleLogout}
      loading={loading}
      error={error}
    />
  );
}