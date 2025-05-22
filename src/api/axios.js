import BASE_URL from "@/config/BaseUrl";
import axios from "axios";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export default apiClient;
