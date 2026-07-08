import { useEffect, useState } from "react";

const emptyProject = { name: "", description: "", assignedMembers: [] };

const getMemberInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

export default function ProjectManager({
  projects,
  teamMembers,
  onCreate,
  onUpdate,
  onDelete,
}) {
  const [form, setForm] = useState(emptyProject);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!editingId) setForm(emptyProject);
  }, [editingId]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (editingId) {
      onUpdate(editingId, form);
    } else {
      onCreate(form);
    }
    setForm(emptyProject);
    setEditingId(null);
  };

  const handleToggleMember = (memberId) => {
    setForm((current) => {
      const assignedMembers = current.assignedMembers.includes(memberId)
        ? current.assignedMembers.filter((id) => id !== memberId)
        : [...current.assignedMembers, memberId];

      return { ...current, assignedMembers };
    });
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Manager tools</p>
          <h2>Projects / categories</h2>
        </div>
      </div>

      <form className="project-form-layout" onSubmit={handleSubmit}>
        <div className="project-form-left">
          <label>
            <span className="eyebrow" style={{ fontSize: '0.74rem' }}>Project Name</span>
            <input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Enter project name..."
              required
            />
          </label>

          <label>
            <span className="eyebrow" style={{ fontSize: '0.74rem' }}>Description</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Enter project description..."
              rows={5}
            />
          </label>

          <div className="form-actions">
            {editingId && (
              <button
                className="secondary-button"
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyProject);
                }}
              >
                Cancel edit
              </button>
            )}
            <button className="primary-button" type="submit">
              {editingId ? "Update project" : "Add project"}
            </button>
          </div>
        </div>

        <div className="member-picker">
          <div className="member-picker-header">
            <div>
              <p className="eyebrow">Assign team members</p>
              <h3>
                {form.assignedMembers.length
                  ? `${form.assignedMembers.length} selected`
                  : "No members selected"}
              </h3>
            </div>
            {form.assignedMembers.length > 0 && (
              <button
                className="ghost-button"
                type="button"
                onClick={() =>
                  setForm((current) => ({ ...current, assignedMembers: [] }))
                }
              >
                Clear
              </button>
            )}
          </div>

          <div className="member-grid">
            {teamMembers.length === 0 ? (
              <p className="empty-state">No team members available yet.</p>
            ) : (
              teamMembers.map((member) => {
                const isSelected = form.assignedMembers.includes(member._id);

                return (
                  <label
                    key={member._id}
                    className={`member-option${isSelected ? " selected" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleMember(member._id)}
                    />
                    <span className="member-avatar">
                      {getMemberInitials(member.name)}
                    </span>
                    <span className="member-option-copy">
                      <strong>{member.name}</strong>
                      <small>{member.email}</small>
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      </form>

      <div className="stack-list">
        {projects.map((project) => (
          <article key={project._id} className="list-card">
            <div className="list-card-top">
              <div>
                <h3>{project.name}</h3>
                <p>{project.description || "No description"}</p>
              </div>
            </div>
            <p>
              <strong>Assigned members:</strong>{" "}
              {project.assignedMembers
                ?.map((member) => member.name)
                .join(", ") || "None"}
            </p>
            <div className="inline-actions">
              <button
                className="ghost-button"
                type="button"
                onClick={() => {
                  setEditingId(project._id);
                  setForm({
                    name: project.name,
                    description: project.description || "",
                    assignedMembers: (project.assignedMembers || []).map(
                      (member) => member._id,
                    ),
                  });
                }}
              >
                Edit
              </button>
              <button
                className="danger-button"
                type="button"
                onClick={() => onDelete(project._id)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
