import { useState, useEffect } from "react"
import { t } from "i18next"
import { transformUserData, hasRole, ROLES } from "../../../utils"
import api from "../../../../axios_conf"
import { useContext } from "react"
import { UserContext } from "../../../../App"

const useSearchApprover = (isMandatory, setIsPending, role, departmentName) => {
    const [approverSearchQuery, setApproverSearchQuery] = useState("")
    const [filteredApprovers, setFilteredApprovers] = useState([])
    const [userNoOptionsMessage, setUserNoOptionsMessage] = useState(
        t("please_type_more_letters")
      );

    const { loggedUserIdmRole } = useContext(UserContext)

    const filterUsersToDepartments = (users) => {
      const mapped = 
      users
        .filter((user) => {
          const indexOfOpeningBrace = user.displayName.indexOf('(')
          const departmentOfUser = user.displayName.slice(indexOfOpeningBrace + 1, -1).split(' ')
          for (const d of departmentOfUser) {
            if (departmentName === "HtvP/PC") {
              return d.includes("HSE")
            }
            if (d.includes(departmentName)) {
              return true
            }
            return false
          }
        })
        .map((user) => {
          return {
            label: user.displayName,
            value: user.userPrincipalName.split('@')[0]
          }
        })

      return mapped
    }

    const searchApprover = (value) => {
        if (value.length < 3) {
            setUserNoOptionsMessage(t("please_type_more_letters"));
        } 
        else {
            setUserNoOptionsMessage(t("no_result"));
        }
        setApproverSearchQuery(value);
    };

    useEffect(() => {
        const controller = new AbortController();
        const hasSuperuser = hasRole(loggedUserIdmRole, [ROLES.SUPERUSER])
        const handleSearch = async () => {
          try {
            if (approverSearchQuery === "") {
                setFilteredApprovers([]);
            } 
            else {
              setIsPending(true);
  
              const response = await api().get(`/api/users/search?query=${approverSearchQuery}`, {
                signal: controller.signal,
              });
  
              const result = response.data;
              setFilteredApprovers(transformUserData(result));
              setIsPending(false);
            }
          } catch (error) {
            console.error(error);
          }
        };

        const getUsersInIdmRole = () => {
          setIsPending(true)
          api().get(`/api/users/idm-role/${role?.id}`)
          .then((res) => {
            setFilteredApprovers(filterUsersToDepartments(res.data))
            setIsPending(false)
          })
          .catch((error) => {
            console.error(error)
            setIsPending(false)
          })
        }
        if (isMandatory && !hasSuperuser) {
          getUsersInIdmRole()
        }
        if (!isMandatory || hasSuperuser) {
          handleSearch()
        }
        
    
        return () => {
          controller.abort();
        };
      }, [approverSearchQuery]);

    return { searchApprover, filteredApprovers, userNoOptionsMessage }
}

export default useSearchApprover