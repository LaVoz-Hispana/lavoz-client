import axios from "axios"
import { navigateTo } from "./utils/navigation";
import { resolveApiBaseUrl } from "./utils/apiBaseUrl";

const baseURL = resolveApiBaseUrl({
    nodeEnv: process.env.NODE_ENV,
    apiUrl: process.env.REACT_APP_API_URL,
    hostname: window.location.hostname,
    protocol: window.location.protocol,
});

export const makeRequest = axios.create({
    baseURL,
    withCredentials: true,
});

makeRequest.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

makeRequest.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            const hasSession = localStorage.getItem("user") || localStorage.getItem("accessToken");
            if (hasSession) {
                localStorage.removeItem("user");
                localStorage.removeItem("accessToken");
                window.dispatchEvent(new Event("poststation:session-cleared"));
                navigateTo("/login");
            }
        }
        return Promise.reject(error);
    }
);
