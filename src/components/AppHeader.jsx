
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function AppHeader({ onMenuClick }) {
    const navigate = useNavigate();

    const [userName, setUserName] = useState("User");

    useEffect(() => {
        async function loadUser() {
            const { data, error } = await supabase.auth.getUser();

            if (error || !data.user) {
                return;
            }

            const fullName = data.user.user_metadata?.full_name;
            const emailName = data.user.email?.split("@")[0];

            const name = fullName?.trim() || emailName || "User";

            setUserName(name.split(/\s+/)[0]);
        }

        loadUser();
    }, []);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSignOut() {
        setError("");
        setLoading(true);

        try {
            const { error: signOutError } =
                await supabase.auth.signOut();

            if (signOutError) {
                throw signOutError;
            }

            navigate("/login", { replace: true });
        } catch (error) {
            setError(
                error.message || "Unable to sign out. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <header className="border-b border-n-6 px-4 py-4 md:px-6">
            <div className="flex items-center justify-between gap-3">
                {/* Mobile menu button */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onMenuClick}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-n-3 hover:bg-n-6 md:hidden"
                        aria-label="Open navigation"
                    >
                        ☰
                    </button>
                </div>

                {/* User and sign out */}
                <div className="flex items-center gap-3">
                    <div className="hidden text-right sm:block">
                        <p className="text-sm font-medium">
                            {userName}
                        </p>

                        <p className="text-xs text-n-3">
                            Free Plan
                        </p>
                    </div>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-n-6">
                        {userName.charAt(0).toUpperCase()}
                    </div>

                    <button
                        type="button"
                        onClick={handleSignOut}
                        disabled={loading}
                        className="rounded-lg border border-n-6 px-3 py-2 text-sm font-medium text-n-2 transition hover:bg-n-6 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Signing out..." : "Sign out"}
                    </button>
                </div>
            </div>

            {error && (
                <p
                    role="alert"
                    className="mt-3 text-right text-sm text-red-400"
                >
                    {error}
                </p>
            )}
        </header>
    );
}

export default AppHeader;
