

import { useState } from "react";
import { Link } from "react-router-dom";
import brainwaveLogo from "../assets/brainwave.svg";
import { supabase } from "../lib/supabase";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setMessage("");

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        setLoading(true);

        try {
            const { error: resetError } =
                await supabase.auth.resetPasswordForEmail(
                    email.trim(),
                    {
                        redirectTo: `${window.location.origin}/reset-password`,
                    }
                );

            if (resetError) {
                throw resetError;
            }

            setMessage(
                "If an account exists for that email, a password recovery link will be sent. Please check your inbox and spam folder."
            );
        } catch (err) {
            setError(
                err.message ||
                "Unable to request password recovery. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-n-8 px-4 py-10 text-n-1 sm:px-6">
            <div className="w-full max-w-md">
                <Link to="/" className="mb-10 inline-flex items-center">
                    <img
                        src={brainwaveLogo}
                        alt="BrainWave logo"
                        className="h-16 w-auto object-contain sm:h-20"
                    />
                </Link>

                <section className="rounded-3xl border border-n-6 bg-n-7 p-6 shadow-2xl sm:p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl text-color-1">
                            Forgot your password?
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="recovery-email"
                                className="mb-2 block text-sm font-medium text-n-2"
                            >
                                Email address
                            </label>

                            <input
                                id="recovery-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder="you@example.com"
                                className="w-full rounded-xl border border-n-6 bg-n-8 px-4 py-3 text-sm text-n-1 outline-none transition placeholder:text-n-4 focus:border-color-1 focus:ring-2 focus:ring-color-1/20"
                            />
                        </div>

                        {error && (
                            <p
                                role="alert"
                                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-300"
                            >
                                {error}
                            </p>
                        )}

                        {message && (
                            <p
                                role="status"
                                className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm leading-5 text-green-300"
                            >
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-color-1 px-4 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-color-1 focus:ring-offset-2 focus:ring-offset-n-7 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Sending link..." : "Send recovery link"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-n-3">
                        Remember your password?{" "}
                        <Link
                            to="/login"
                            className="font-semibold text-color-1 transition hover:opacity-80"
                        >
                            Back to sign in
                        </Link>
                    </p>
                </section>
            </div>
        </main>
    );
}

export default ForgotPassword;
