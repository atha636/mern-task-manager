import axios from "axios";

const API = axios.create({

    baseURL:
        import.meta.env.VITE_API_URL
});

// Attach token to every request
API.interceptors.request.use(

    (req)=>{

        const token = localStorage.getItem("token");

        if(token){

            req.headers.Authorization =
                `Bearer ${token}`;
        }

        return req;
    }
);

// If token is expired or invalid → auto logout and redirect to login
API.interceptors.response.use(

    (res) => res,

    (error) => {

        if(error.response?.status === 401){

            localStorage.removeItem("token");

            localStorage.removeItem("user");

            window.location.href = "/";
        }

        return Promise.reject(error);
    }
);

export default API;