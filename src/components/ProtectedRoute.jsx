

import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let active = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!active) return;

      setSession(newSession);
      setCheckingSession(false);
    });

    supabase.auth
      .getSession()
      .then(({ data: { session: currentSession } }) => {
        if (!active) return;

        setSession(currentSession);
        setCheckingSession(false);
      })
      .catch(() => {
        if (!active) return;

        setSession(null);
        setCheckingSession(false);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-n-8 px-4 text-n-1">
        <p className="text-sm text-n-3">
          Checking your session...
        </p>
      </main>
    );
  }

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
}

export default ProtectedRoute;
