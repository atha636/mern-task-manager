import axios from "axios";

const API = axios.create({

    baseURL:"https://mern-task-manager-production-0e30.up.railway.app/api"
    
});

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

export default API;