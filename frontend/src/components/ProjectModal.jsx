import { useState } from "react";

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
      <section className="modal">
        <div className="panel-header">
          <div>
            <p className="muted-label">New project</p>
            <h3>Create project</h3>
          </div>
          <button className="ghost-button" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <form onSubmit={handleSubmit}>
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
              rows={4}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button full-width" disabled={submitting}>
            {submitting ? "Creating..." : "Create project"}
          </button>
        </form>
      </section>
    </div>
  );
}

