import { useState } from "react";
import { X } from "lucide-react";

export function ProjectModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
  });
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
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <section className="modal modal-small" aria-labelledby="project-modal-title">
        <div className="modal-header">
          <div>
            <p className="muted-label">New project</p>
            <h3 id="project-modal-title">Create project</h3>
          </div>
          <button
            className="modal-close-button"
            type="button"
            onClick={onClose}
            aria-label="Close project dialog"
          >
            <X size={18} />
          </button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-body">
            <label>
              Project name
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                placeholder="Product Launch"
                required
              />
            </label>
            <label>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={updateField}
                placeholder="What is this project about?"
                rows={3}
              />
            </label>
            {error && <p className="form-error">{error}</p>}
          </div>
          <div className="modal-actions">
            <button className="ghost-button" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary-button" disabled={submitting}>
              {submitting ? "Creating..." : "Create project"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
