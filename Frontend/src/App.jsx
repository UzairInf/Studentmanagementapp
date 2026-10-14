
import { useState, useEffect } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function AppRoutes() {
    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("token")
    );

    useEffect(() => {
        const handleLogin = () => {
            setIsLoggedIn(true);
        };

        const handleLogout = () => {
            setIsLoggedIn(false);
        };

        window.addEventListener("auth-login", handleLogin);
        window.addEventListener("auth-logout", handleLogout);

        return () => {
            window.removeEventListener("auth-login", handleLogin);
            window.removeEventListener("auth-logout", handleLogout);
        };
    }, []);

    return (
        <Routes>
            <Route
                path="/"
                element={
                    <Navigate
                        to={isLoggedIn ? "/dashboard" : "/login"}
                        replace
                    />
                }
            />

            <Route
                path="/login"
                element={
                    isLoggedIn
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
                    isLoggedIn
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
