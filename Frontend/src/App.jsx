import { useState, useEffect } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import { supabase } from "./supabaseClient";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function AppRoutes() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        supabase.auth.getSession().then(({ data, error }) => {
            if (!mounted) return;

            if (error) {
                console.error("Session error:", error.message);
            }

            setSession(data?.session ?? null);
            setLoading(false);
        });

        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <Routes>
            <Route
                path="/"
                element={
                    <Navigate
                        to={session ? "/dashboard" : "/login"}
                        replace
                    />
                }
            />

            <Route
                path="/login"
                element={
                    session
                        ? <Navigate to="/dashboard" replace />
                        : <Login />
                }
            />

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/dashboard"
                element={
                    session
                        ? <Dashboard />
                        : <Navigate to="/login" replace />
                }
            />

            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}

export default App;