
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import brainwaveLogo from "../assets/brainwave.svg";
import { supabase } from "../lib/supabase";
import { useLocation } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const location = useLocation();

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        if (!email.trim() || !password) {
            setError("Please enter your email and password.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError("Please enter a valid email address.");
            return;
        }

        setLoading(true);

        try {
            const { error: loginError } =
                await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password,
                });

            if (loginError) {
                throw loginError;
            }

            navigate("/app", { replace: true });
        } catch (error) {
            setError(
                error.message ||
                "Unable to sign in. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }


    async function handleGoogleSignIn() {
        setError("");
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
                "Unable to sign in with Google. Please try again."
            );
            setLoading(false);
        }
    }


    return (
        <main className="flex min-h-screen items-center justify-center bg-n-8 px-4 py-10 text-n-1 sm:px-6">
            <div className="w-full max-w-md">
                <Link
                    to="/"
                    className="mb-10 inline-flex items-center"
                >
                    <img
                        src={brainwaveLogo}
                        alt="BrainWave logo"
                        className="h-16 w-auto object-contain sm:h-20"
                    />
                </Link>

                <section className="rounded-3xl border border-n-6 bg-n-7 p-6 shadow-2xl sm:p-8">
                    <div className="mb-8">
                        <p className="mb-3 text-sm font-medium text-color-1">
                            WELCOME BACK
                        </p>

                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            Sign in to BrainWave
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="login-email"
                                className="mb-2 block text-sm font-medium text-n-2"
                            >
                                Email address
                            </label>

                            <input
                                id="login-email"
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
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <label
                                    htmlFor="login-password"
                                    className="text-sm font-medium text-n-2"
                                >
                                    Password
                                </label>

                                <Link
                                    to="/forgot-password"
                                    className="text-xs font-medium text-color-1 transition hover:opacity-80"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <div className="flex items-center rounded-xl border border-n-6 bg-n-8 pr-3 transition focus-within:border-color-1 focus-within:ring-2 focus-within:ring-color-1/20">
                                <input
                                    id="login-password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Enter your password"
                                    className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-n-1 outline-none placeholder:text-n-4"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((current) => !current)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="shrink-0 text-xs font-medium text-n-3 transition hover:text-n-1"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>
                        {location.state?.message && (
                            <p
                                role="status"
                                className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm leading-5 text-green-300"
                            >
                                {location.state.message}
                            </p>
                        )}

                        {error && (
                            <p
                                role="alert"
                                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-300"
                            >
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-color-1 px-4 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-color-1 focus:ring-offset-2 focus:ring-offset-n-7 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    <div className="my-5 flex items-center gap-3">
                        <div className="h-px flex-1 bg-n-6" />
                        <span className="text-xs text-n-4">
                            OR CONTINUE WITH
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
                        Don't have an account?{" "}
                        <Link
                            to="/signup"
                            className="font-semibold text-color-1 transition hover:opacity-80"
                        >
                            Create one
                        </Link>
                    </p>
                </section>

                <p className="mt-6 text-center text-xs leading-5 text-n-4">
                    By continuing, you agree to BrainWave's Terms of Service and Privacy
                    Policy.
                </p>
            </div>
        </main>
    );
}

export default Login;
