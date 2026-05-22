import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

export default function InviteAccept() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, valid: false, err: "", invite: null });
  const [form, setForm] = useState({ name: "", password: "", confirm: "" });
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    axios
      .get(`${API}/invites/${encodeURIComponent(token)}`)
      .then((r) => setState({ loading: false, valid: true, err: "", invite: r.data }))
      .catch((e) =>
        setState({
          loading: false,
          valid: false,
          err: e?.response?.data?.detail || "Invite no longer valid",
          invite: null,
        })
      );
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error("Password must be at least 8 characters");
    if (form.password !== form.confirm) return toast.error("Passwords do not match");
    if (form.name.trim().length < 2) return toast.error("Please enter your name");
    setSubmitting(true);
    try {
      await axios.post(`${API}/invites/${encodeURIComponent(token)}/accept`, {
        name: form.name.trim(),
        password: form.password,
      });
      toast.success("Account created — please sign in");
      setTimeout(() => navigate("/admin"), 1200);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not accept invite");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-78px)] bg-[#E9EEF3] py-16">
      <div className="mx-auto flex max-w-md flex-col items-center px-5">
        <div className="mb-10 flex flex-col items-center">
          <div className="font-display text-5xl tracking-[0.18em] text-[#0A0A0A]">TUNCEL TEXTILE</div>
          <div className="mt-2 text-[10px] uppercase tracking-[0.55em] text-[#0A0A0A]/55">
            Atelier · Team Invite
          </div>
        </div>

        <div className="w-full bg-white p-8 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.08)]" data-testid="invite-accept-card">
          {state.loading ? (
            <div className="py-10 text-center text-sm text-black/60">Checking invite…</div>
          ) : !state.valid ? (
            <div className="text-center" data-testid="invite-invalid">
              <div className="font-display text-3xl uppercase tracking-[0.04em]">Invite invalid</div>
              <p className="mt-4 text-sm text-black/60">{state.err}</p>
              <Link
                to="/admin"
                className="mt-8 inline-block border-b border-black/60 pb-1 text-[11px] uppercase tracking-[0.4em]"
              >
                Go to admin →
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <div className="text-[10px] uppercase tracking-[0.4em] text-black/55">
                  Invited by {state.invite?.invited_by || "the atelier"}
                </div>
                <div className="font-display mt-2 text-2xl uppercase tracking-[0.04em] text-black">
                  Create your account
                </div>
              </div>
              <form onSubmit={submit} className="space-y-5" data-testid="invite-form">
                <Field
                  label="Full name"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  placeholder="Your name"
                  testid="invite-name-input"
                />
                <Field
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={(v) => setForm({ ...form, password: v })}
                  placeholder="Min 8 characters"
                  testid="invite-password-input"
                />
                <Field
                  label="Confirm password"
                  type="password"
                  value={form.confirm}
                  onChange={(v) => setForm({ ...form, confirm: v })}
                  placeholder="Repeat password"
                  testid="invite-confirm-input"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  data-testid="invite-submit"
                  className="w-full bg-black px-6 py-3.5 text-[12px] font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-[#1A1A1A] disabled:opacity-60"
                >
                  {submitting ? "Creating…" : "Create account"}
                </button>
                <p className="text-center text-[10px] uppercase tracking-[0.3em] text-black/45">
                  Single-use link · expires soon
                </p>
              </form>
            </>
          )}
        </div>

        <div className="mt-8 text-[10px] uppercase tracking-[0.4em] text-black/35">
          © MMXXVI · Tuncel Textile
        </div>
      </div>
    </div>
  );
}

const Field = ({ label, value, onChange, placeholder, type = "text", testid }) => (
  <div>
    <label className="text-[11px] uppercase tracking-[0.25em] text-black/60">{label}</label>
    <div className="mt-2 flex items-center border border-black/15 bg-[#F7F9FB] focus-within:border-black">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid={testid}
        className="flex-1 bg-transparent px-3 py-3 text-sm outline-none"
        autoComplete={type === "password" ? "new-password" : "name"}
      />
    </div>
  </div>
);
