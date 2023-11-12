import axios from "axios";
import { readIdmNamesOfGivenRoles } from "./components/utils";

const api = (isSuperuser = false, roles = []) => {
  const baseURL = process.env.REACT_APP_HOST_NAME;
  const newInstance = axios.create({ baseURL });

  newInstance.interceptors.request.use(
    function (config) {
      config.headers.dosAccessToken = localStorage.getItem("DOSaccessToken");
      config.headers.DOSaccessTokenForUsers = localStorage.getItem(
        "DOSaccessTokenForUsers"
      );
      if (isSuperuser) {
        const idmRoles = readIdmNamesOfGivenRoles(roles).map(role => "de.bosch.com\\" + role)
        config.headers["rolesfortesting"] = `${idmRoles}`
      }
      return Promise.resolve(config);
    },
    function (error) {
      return Promise.reject(error);
    }
  );
  return newInstance;
};

export default api;
