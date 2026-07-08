import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const formatDate = (date) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const toDate = (value) => (value ? new Date(value) : null);

const emptyForm = {
  startDate: null,
  endDate: null,
  projectId: "",
  tasksCompleted: "",
  tasksPlanned: "",
  blockers: "",
  status: "pending",
  hoursWorked: "",
  notes: "",
};

export default function ReportForm({
  projects,
  initialValue,
  onSubmit,
  onCancel,
  submitting,
}) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (initialValue) {
      setForm({
        startDate: toDate(initialValue.startDate),
        endDate: toDate(initialValue.endDate),
        projectId: initialValue.projectId?._id || initialValue.projectId || "",
        tasksCompleted: initialValue.tasksCompleted || "",
        tasksPlanned: initialValue.tasksPlanned || "",
        blockers: initialValue.blockers || "",
        status: initialValue.status || "pending",
        hoursWorked: initialValue.hoursWorked || "",
        notes: initialValue.notes || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialValue]);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const updateDateField = (field) => (date) => {
    setForm((current) => ({ ...current, [field]: date }));
  };

  const weekDateRange = useMemo(() => {
    if (!form.startDate || !form.endDate) return "";
    return `${formatDate(form.startDate)} - ${formatDate(form.endDate)}`;
  }, [form.startDate, form.endDate]);

  const submitForm = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      startDate: form.startDate ? form.startDate.toISOString() : undefined,
      endDate: form.endDate ? form.endDate.toISOString() : undefined,
      weekDateRange,
      hoursWorked:
        form.hoursWorked === "" ? undefined : Number(form.hoursWorked),
    });
  };

  return (
    <form className="panel form-panel" onSubmit={submitForm}>
      <div className="panel-header">
        <div>
          <p className="eyebrow">Personal page</p>
          <h2>
            {initialValue ? "Edit weekly report" : "Create weekly report"}
          </h2>
        </div>
        {initialValue ? (
          <button type="button" className="ghost-button" onClick={onCancel}>
            Cancel edit
          </button>
        ) : null}
      </div>

      <div className="grid-form ">
        <label>
          <span>Start date</span>
          <DatePicker
            selected={form.startDate}
            onChange={updateDateField("startDate")}
            selectsStart
            startDate={form.startDate}
            endDate={form.endDate}
            placeholderText="Select start date"
            className="date-picker-input"
            dateFormat="dd MMM yyyy"
            required
          />
        </label>
        <label>
          <span>End date</span>
          <DatePicker
            selected={form.endDate}
            onChange={updateDateField("endDate")}
            selectsEnd
            startDate={form.startDate}
            endDate={form.endDate}
            minDate={form.startDate}
            placeholderText="Select end date"
            className="date-picker-input"
            dateFormat="dd MMM yyyy"
            required
          />
        </label>
        <label className="full-width">
          <span>Week / date range preview</span>
          <input
            value={weekDateRange}
            readOnly
            placeholder="Select dates to generate range"
          />
        </label>
        <label>
          <span>Project / category</span>
          <select
            value={form.projectId}
            onChange={updateField("projectId")}
            required
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>
        <label className="full-width">
          <span>Tasks completed</span>
          <textarea
            rows="4"
            value={form.tasksCompleted}
            onChange={updateField("tasksCompleted")}
            required
          />
        </label>
        <label className="full-width">
          <span>Tasks planned for next week</span>
          <textarea
            rows="4"
            value={form.tasksPlanned}
            onChange={updateField("tasksPlanned")}
            required
          />
        </label>
        <label className="full-width">
          <span>Blockers / challenges</span>
          <textarea
            rows="3"
            value={form.blockers}
            onChange={updateField("blockers")}
            required
          />
        </label>
        <label className="mb-3">
          <span>Status</span>
          <select value={form.status} onChange={updateField("status")}>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="late">Late</option>
          </select>
        </label>
        <label className="mb-3">
          <span>Hours worked</span>
          <input
            type="number"
            min="0"
            step="0.5"
            value={form.hoursWorked}
            onChange={updateField("hoursWorked")}
          />
        </label>
        <label className="full-width mb-3">
          <span>Optional notes or links</span>
          <textarea
            rows="3"
            value={form.notes}
            onChange={updateField("notes")}
          />
        </label>
      </div>

      <div className="form-actions mt-3">
        <button
          className="primary-button mt-3"
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Saving..."
            : initialValue
              ? "Update report"
              : "Save draft"}
        </button>
      </div>
    </form>
  );
}
