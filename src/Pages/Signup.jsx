
import { useState } from "react";
import { Link } from "react-router-dom";
import brainwaveLogo from "../assets/brainwave.svg";
import { supabase } from "../lib/supabase";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please complete all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {

      const { data, error: signupError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (signupError) {
        const message = signupError.message.toLowerCase();

        if (
          message.includes("already registered") ||
          message.includes("already been registered") ||
          message.includes("already exists")
        ) {
          setError(
            "An account with this email already exists. Please sign in or use Forgot Password."
          );
          return;
        }

        throw signupError;
      }

      // Supabase can return an empty identities array for an existing account
      // when email confirmation is enabled.
      if (data.user && data.user.identities?.length === 0) {
        setError(
          "An account with this email already exists. Please sign in or use Forgot Password."
        );
        return;
      }

      if (data.session) {
        setSuccess(
          "Your account has been created successfully. You can now sign in."
        );
      } else {
        setSuccess(
          "Account created! Please check your email for a confirmation link before signing in."
        );
      }

      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setError(
        error.message || "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }


  async function handleGoogleSignIn() {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { error: googleError } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/app`,
          },
        });

      if (googleError) {
        throw googleError;
      }
    } catch (error) {
      setError(
        error.message ||
        "Unable to sign up with Google. Please try again."
      );
      setLoading(false);
    }
  }


  return (
    <main className="flex min-h-screen items-center justify-center bg-n-8 px-4 py-10 text-n-1 sm:px-6">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 inline-flex items-center">
          <img
            src={brainwaveLogo}
            alt="BrainWave logo"
            className="h-16 w-auto object-contain sm:h-20"
          />
        </Link>

        <section className="rounded-3xl border border-n-6 bg-n-7 p-6 shadow-2xl sm:p-8">
          <header className="mb-7">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl text-color-1">
              Create your account
            </h1>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="signup-name"
                className="mb-2 block text-sm font-medium text-n-2"
              >
                Full name
              </label>

              <input
                id="signup-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your full name"
                className="w-full rounded-xl border border-n-6 bg-n-8 px-4 py-3 text-sm text-n-1 outline-none transition placeholder:text-n-4 focus:border-color-1 focus:ring-2 focus:ring-color-1/20"
              />
            </div>

            <div>
              <label
                htmlFor="signup-email"
                className="mb-2 block text-sm font-medium text-n-2"
              >
                Email address
              </label>

              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-n-6 bg-n-8 px-4 py-3 text-sm text-n-1 outline-none transition placeholder:text-n-4 focus:border-color-1 focus:ring-2 focus:ring-color-1/20"
              />
            </div>

            <div>
              <label
                htmlFor="signup-password"
                className="mb-2 block text-sm font-medium text-n-2"
              >
                Password
              </label>

              <div className="flex items-center rounded-xl border border-n-6 bg-n-8 pr-3 transition focus-within:border-color-1 focus-within:ring-2 focus-within:ring-color-1/20">
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-n-1 outline-none placeholder:text-n-4"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="shrink-0 text-xs font-medium text-n-3 hover:text-n-1"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-confirm-password"
                className="mb-2 block text-sm font-medium text-n-2"
              >
                Confirm password
              </label>

              <div className="flex items-center rounded-xl border border-n-6 bg-n-8 pr-3 transition focus-within:border-color-1 focus-within:ring-2 focus-within:ring-color-1/20">
                <input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter your password"
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-n-1 outline-none placeholder:text-n-4"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((current) => !current)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  className="shrink-0 text-xs font-medium text-n-3 hover:text-n-1"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-300"
              >
                {error}

              </p>
            )}
            {success && (
              <p
                role="status"
                className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm leading-5 text-green-300"
              >
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-color-1 px-4 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-color-1 focus:ring-offset-2 focus:ring-offset-n-7 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>


          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-n-6" />
            <span className="text-xs text-n-4">
              OR SIGN UP WITH
            </span>
            <div className="h-px flex-1 bg-n-6" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-n-6 bg-n-8 px-4 py-3.5 text-sm font-semibold text-n-1 transition hover:bg-n-6 focus:outline-none focus:ring-2 focus:ring-color-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span
              aria-hidden="true"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-white font-bold text-blue-600"
            >
              G
            </span>
            Continue with Google
          </button>


          <p className="mt-6 text-center text-sm text-n-3">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-color-1 transition hover:opacity-80"
            >
              Sign in
            </Link>
          </p>
        </section>

        <p className="mt-6 text-center text-xs leading-5 text-n-4">
          By creating an account, you agree to BrainWave's Terms of Service and
          Privacy Policy.
        </p>
      </div>
    </main>
  );
}

export default Signup;
