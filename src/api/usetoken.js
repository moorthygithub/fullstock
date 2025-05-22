import { useSelector } from "react-redux";

const usetoken = () => {
  return useSelector((state) => state.auth.token);
  // return localStorage.getItem("token");
};
export default usetoken;
