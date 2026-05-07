import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export function AuthCard() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
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
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await signup(form);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-info">
        <div className="brand-mark">TT</div>
        <h1>TeamTask</h1>
        <p>
          Manage projects, assign tasks, and track progress with clear Admin and
          Member access.
        </p>
        <div className="auth-preview" aria-label="Sample task statuses">
          <div>
            <CheckCircle2 size={18} />
            <span>Launch checklist</span>
            <strong>In Progress</strong>
          </div>
          <div>
            <CheckCircle2 size={18} />
            <span>Mobile navigation</span>
            <strong>To Do</strong>
          </div>
          <div>
            <CheckCircle2 size={18} />
            <span>Deployment notes</span>
            <strong>Done</strong>
          </div>
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-tabs">
          <button
            className={mode === "login" ? "active" : ""}
            type="button"
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={mode === "signup" ? "active" : ""}
            type="button"
            onClick={() => setMode("signup")}
          >
            Signup
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label>
              Name
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                placeholder="Your name"
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              placeholder="Minimum 6 characters"
              minLength={6}
              required
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="primary-button full-width" disabled={submitting}>
            {submitting ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}
