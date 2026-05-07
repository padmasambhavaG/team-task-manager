import { useState } from "react";

const initialForm = {
  title: "",
  description: "",
  dueDate: "",
  priority: "MEDIUM",
  status: "TODO",
  assigneeId: "",
};

export function TaskModal({ members, onClose, onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await onSubmit({
        ...form,
        assigneeId: form.assigneeId || null,
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <section className="modal">
        <div className="panel-header">
          <div>
            <p className="muted-label">Task creation</p>
            <h3>Add Task</h3>
          </div>
          <button className="ghost-button" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <label>
            Title
            <input
              name="title"
              value={form.title}
              onChange={updateField}
              placeholder="Write API tests"
              required
            />
          </label>
          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={updateField}
              placeholder="Add short implementation notes"
              rows={3}
            />
          </label>
          <div className="form-grid">
            <label>
              Due Date
              <input
                name="dueDate"
                type="date"
                value={form.dueDate}
                onChange={updateField}
                required
              />
            </label>
            <label>
              Priority
              <select name="priority" value={form.priority} onChange={updateField}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </label>
          </div>
          <div className="form-grid">
            <label>
              Status
              <select name="status" value={form.status} onChange={updateField}>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </label>
            <label>
              Assignee
              <select name="assigneeId" value={form.assigneeId} onChange={updateField}>
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.user.id} value={member.user.id}>
                    {member.user.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button full-width" disabled={submitting}>
            {submitting ? "Saving..." : "Add Task"}
          </button>
        </form>
      </section>
    </div>
  );
}

