
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import QuickAction from "../../components/QuickAction";


function DashBoard() {
    const [userName, setUserName] = useState("User");
    const [greeting, setGreeting] = useState("");

    useEffect(() => {
        function updateGreeting() {
            const hour = new Date().getHours();

            if (hour >= 5 && hour < 12) {
                setGreeting("Good morning");
            } else if (hour >= 12 && hour < 17) {
                setGreeting("Good afternoon");
            } else {
                setGreeting("Good evening");
            }
        }

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

        updateGreeting();
        loadUser();
    }, []);

    return (
        <div className="min-h-screen">
            <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 lg:py-12">
                <section className="mb-10">
                    <p className="mb-2 text-sm text-n-3">
                        Welcome back
                    </p>

                    <h1 className="text-3xl font-semibold md:text-4xl">
                        {greeting}, {userName} 👋
                    </h1>

                    <p className="mt-3 max-w-2xl text-n-3">
                        What would you like to accomplish today?
                    </p>
                </section>

                
                <QuickAction />
            </main>
        </div>
    );
}

export default DashBoard;
