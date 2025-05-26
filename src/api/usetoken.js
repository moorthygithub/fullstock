import { useSelector } from "react-redux";

const usetoken = () => {
  return useSelector((state) => state.auth.token);
};
export default usetoken;
