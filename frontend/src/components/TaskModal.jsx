import { useState } from "react";
import { X } from "lucide-react";

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

    if (!form.assigneeId) {
      setError("Validation failed: task must be assigned to a user.");
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        ...form,
        assigneeId: form.assigneeId,
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
      <section className="modal modal-large" aria-labelledby="task-modal-title">
        <div className="modal-header">
          <div>
            <p className="muted-label">Task creation</p>
            <h3 id="task-modal-title">Add Task</h3>
          </div>
          <button
            className="modal-close-button"
            type="button"
            onClick={onClose}
            aria-label="Close task dialog"
          >
            <X size={18} />
          </button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-body">
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
                <select
                  name="assigneeId"
                  value={form.assigneeId}
                  onChange={updateField}
                >
                  <option value="" disabled>
                    Select assignee
                  </option>
                  {members.map((member) => (
                    <option key={member.user.id} value={member.user.id}>
                      {member.user.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {error && <p className="form-error">{error}</p>}
          </div>
          <div className="modal-actions">
            <button className="ghost-button" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary-button" disabled={submitting}>
              {submitting ? "Saving..." : "Add Task"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
