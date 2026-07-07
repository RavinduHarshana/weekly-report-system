const Report = require('../models/Report');
const User = require('../models/User');
const { validationResult } = require('express-validator');

const populateReport = (query) =>
  query.populate('userId', 'name email role').populate('projectId', 'name description');

const getRefId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value._id) return value._id.toString();
  return value.toString();
};

const countItems = (text) => {
  if (!text || typeof text !== 'string') return 0;
  return text
    .split(/\n|,|;/)
    .map((item) => item.trim())
    .filter(Boolean).length || 0;
};

const buildBaseReportQuery = (req) => {
  const query = {};

  if (req.query.userId) query.userId = req.query.userId;
  if (req.query.projectId) query.projectId = req.query.projectId;
  if (req.query.status) query.status = req.query.status;
  if (req.query.weekDateRange) query.weekDateRange = new RegExp(req.query.weekDateRange, 'i');

  if (req.query.startDate || req.query.endDate) {
    query.createdAt = {};
    if (req.query.startDate) query.createdAt.$gte = new Date(req.query.startDate);
    if (req.query.endDate) query.createdAt.$lte = new Date(req.query.endDate);
  }

  return query;
};

const formatDateLabel = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).replace(/ /g, ' ');
};

const buildWeekRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  return `${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}`;
};

const isOwnerOrManager = (req, report) => {
  if (!report || !req.user) return false;
  return req.user.role === 'Manager' || report.userId.toString() === req.user._id.toString();
};

// 1. Create Report
exports.createReport = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const newReport = await Report.create({
      userId: req.user._id,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      weekDateRange: req.body.weekDateRange || buildWeekRange(req.body.startDate, req.body.endDate),
      projectId: req.body.projectId,
      tasksCompleted: req.body.tasksCompleted,
      tasksPlanned: req.body.tasksPlanned,
      blockers: req.body.blockers,
      status: req.body.status || 'pending',
      hoursWorked: req.body.hoursWorked,
      notes: req.body.notes,
    });
    res.status(201).json(newReport);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// 2. Edit Report (Before/After submission)
exports.editReport = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    let report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    
    // Ensure user owns the report
    if (report.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to edit this report' });
    }

    report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        startDate: req.body.startDate ?? report.startDate,
        endDate: req.body.endDate ?? report.endDate,
        weekDateRange:
          req.body.weekDateRange ??
          (buildWeekRange(req.body.startDate ?? report.startDate, req.body.endDate ?? report.endDate) || report.weekDateRange),
        projectId: req.body.projectId ?? report.projectId,
        tasksCompleted: req.body.tasksCompleted ?? report.tasksCompleted,
        tasksPlanned: req.body.tasksPlanned ?? report.tasksPlanned,
        blockers: req.body.blockers ?? report.blockers,
        status: req.body.status ?? report.status,
        hoursWorked: req.body.hoursWorked ?? report.hoursWorked,
        notes: req.body.notes ?? report.notes,
      },
      { new: true },
    );
    res.status(200).json(report);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// 2b. Submit Report
exports.submitReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    if (report.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to submit this report' });
    }

    report.status = 'submitted';
    report.submittedAt = new Date();
    await report.save();

    res.status(200).json(report);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// 3. View Own Report History (Team Member)[cite: 1]
exports.getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// 3b. View Single Report
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('userId', 'name email role')
      .populate('projectId', 'name description');

    if (!report) return res.status(404).json({ error: 'Report not found' });
    if (!isOwnerOrManager(req, report)) {
      return res.status(403).json({ error: 'Not authorized to view this report' });
    }

    res.status(200).json(report);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// 4. View All Reports with Filters (Manager Dashboard)[cite: 1]
exports.getAllReports = async (req, res) => {
  try {
    const query = buildBaseReportQuery(req);
    const reports = await populateReport(Report.find(query).sort({ createdAt: -1 }));
    res.status(200).json(reports);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// 5. Dashboard Summary (Manager View)
exports.getDashboardSummary = async (req, res) => {
  try {
    const teamMembers = await User.find({ role: 'Team Member' }).select('name email role');
    const reports = await populateReport(
      Report.find(buildBaseReportQuery(req)).sort({ createdAt: -1 }),
    );

    const thisWeekStart = new Date();
    thisWeekStart.setHours(0, 0, 0, 0);
    thisWeekStart.setDate(thisWeekStart.getDate() - 6);

    const hasExplicitDateFilter = Boolean(req.query.startDate || req.query.endDate);
    const summaryReports = hasExplicitDateFilter
      ? reports
      : reports.filter((report) => new Date(report.createdAt) >= thisWeekStart);

    const submittedThisWeek = summaryReports.filter((report) => {
      const submittedDate = report.submittedAt || report.createdAt;
      return report.status === 'submitted' && submittedDate >= thisWeekStart;
    }).length;

    const teamMemberIds = new Set(teamMembers.map((member) => member._id.toString()));
    const submittedMemberIds = new Set(
      summaryReports
        .filter((report) => report.status === 'submitted')
        .map((report) => getRefId(report.userId)),
    );

    const openBlockers = summaryReports.filter((report) => (report.blockers || '').trim().length > 0).length;

    const statusByMember = teamMembers.map((member) => {
      const memberReports = summaryReports.filter(
        (report) => getRefId(report.userId) === member._id.toString(),
      );
      const latestReport = memberReports[0];

      return {
        memberId: member._id,
        name: member.name,
        email: member.email,
        submitted: submittedMemberIds.has(member._id.toString()),
        status: latestReport ? latestReport.status : 'pending',
        latestWeek: latestReport ? latestReport.weekDateRange : null,
      };
    });

    const projectWorkloadMap = new Map();
    const completedTrendMap = new Map();

    summaryReports.forEach((report) => {
      const projectKey = getRefId(report.projectId);
      const projectName = report.projectId?.name || 'Unassigned';
      const projectItem = projectWorkloadMap.get(projectKey) || {
        projectId: projectKey,
        projectName,
        reportCount: 0,
      };
      projectItem.reportCount += 1;
      projectWorkloadMap.set(projectKey, projectItem);

      const reportDateKey = new Date(report.createdAt).toISOString().slice(0, 10);
      const completedItemCount = countItems(report.tasksCompleted);
      completedTrendMap.set(reportDateKey, (completedTrendMap.get(reportDateKey) || 0) + completedItemCount);
    });

    const metrics = {
      totalTeamMembers: teamMembers.length,
      totalReportsSubmittedThisWeek: submittedThisWeek,
      submissionRate: teamMembers.length ? Math.round((submittedMemberIds.size / teamMembers.length) * 100) : 0,
      openBlockers,
      pendingMembers: Math.max(teamMembers.length - submittedMemberIds.size, 0),
    };

    res.status(200).json({
      metrics,
      statusByMember,
      projectWorkload: Array.from(projectWorkloadMap.values()),
      tasksCompletedTrend: Array.from(completedTrendMap.entries()).map(([date, completedItems]) => ({ date, completedItems })),
      recentReports: summaryReports.slice(0, 10),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};