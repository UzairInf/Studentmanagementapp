
const API_URL = "http://localhost:5000";

export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            ...options.headers,
            ...(token && {
                Authorization: `Bearer ${token}`,
            }),
        },
    });

    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("auth-expired"));
        throw new Error("Session expired. Please log in again.");
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
    }

    return data;
};
