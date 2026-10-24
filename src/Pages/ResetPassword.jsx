


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import brainwaveLogo from "../assets/brainwave.svg";
import { supabase } from "../lib/supabase";

function ResetPassword() {
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

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
            const { data, error: updateError } =
                await supabase.auth.updateUser({ password });

            if (updateError) {
                throw updateError;
            }

            if (!data.user) {
                throw new Error(
                    "Your recovery session is unavailable. Please request a new recovery link."
                );
            }

            navigate("/login", {
                replace: true,
                state: {
                    message: "Your password has been updated. Please sign in with your new password.",
                },
            });
        } catch (err) {
            setError(
                err.message ||
                "Unable to update your password. Please request a new recovery link."
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
                        <p className="mb-3 text-sm font-medium text-color-1">
                            SECURE YOUR ACCOUNT
                        </p>
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            Set a new password
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-n-3">
                            Choose a new password for your BrainWave account.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="new-password"
                                className="mb-2 block text-sm font-medium text-n-2"
                            >
                                New password
                            </label>
                            <input
                                id="new-password"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={8}
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                placeholder="At least 8 characters"
                                className="w-full rounded-xl border border-n-6 bg-n-8 px-4 py-3 text-sm text-n-1 outline-none transition placeholder:text-n-4 focus:border-color-1 focus:ring-2 focus:ring-color-1/20"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="confirm-password"
                                className="mb-2 block text-sm font-medium text-n-2"
                            >
                                Confirm new password
                            </label>
                            <input
                                id="confirm-password"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={8}
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(event.target.value)
                                }
                                placeholder="Enter your new password again"
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-color-1 px-4 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-color-1 focus:ring-offset-2 focus:ring-offset-n-7 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Updating password..." : "Update password"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-n-3">
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

export default ResetPassword;
