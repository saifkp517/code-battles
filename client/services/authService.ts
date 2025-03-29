import axios from "axios";

const API_URL = process.env.BACKEND_URL

export const loginUser = async (email: string, password: string) => {
    try {
        const res = await axios.post(`${API_URL}/auth/login`, { email, password }, { withCredentials: true });
        return { success: true, data: res.data };
    } catch (error: any) {
        console.error("Login Error:", error);
        
        if (error.code === "ERR_NETWORK") {
            return { success: false, message: "Network Error - Please try again later" };
        } else if (error.response?.status.toString().startsWith("40")) {
            return { success: false, message: "Invalid Credentials" };
        } else {
            return { success: false, message: "Server Error" };
        }
    }
}

export const registerUser = async (username: string, email: string, password: string) => {
    try {
        const res = await axios.post(`${API_URL}/auth/register`, { username, email, password });

        return { success: true, message: "User Created Successfully!" };
    } catch (error: any) {
        console.error("Register Error:", error);

        if (error.response?.status.toString().startsWith("40")) {
            return { success: false, message: "User Already Exists" };
        } else if (error.request) {
            return { success: false, message: "No Response from Server" };
        } else {
            return { success: false, message: "Request Failed" };
        }
    }
};

export const logOutUser = async () => {
    try {
        const res = await axios.post(`${API_URL}/auth/logout`,{}, { withCredentials: true });
        return { success: true, message: "Logged Out Successfully!" };
    } catch(error: any) {
        return { success: false, message: "Error logging out" };
    }
}

export const authorizeUser = async () => {
    try {
        const res = await axios.get(`${API_URL}/auth/authorization`, { withCredentials: true });
        console.log(res);
        return { success: true, message: "User logged in!" };
    } catch(error: any) {
        return { success: false, message: "Session Expired" };
    }
}