import { useState, useEffect } from "react"
import { t } from "i18next"
import api from "../../../../axios_conf"

const useSearchRole = (setIsPending) => {
    const [roleSearchQuery, setRoleSearchQuery] = useState("")
    const [filteredRoles, setFilteredRoles] = useState([])
    const [roleNoOptionsMessage, setRoleNoOptionsMessage] = useState(
        t("please_type_more_letters")
      );

    const searchApprover = (value) => {
        if (value.length < 3) {
            setRoleNoOptionsMessage(t("please_type_more_letters"));
        } 
        else {
            setRoleNoOptionsMessage(t("no_result"));
        }
        setRoleSearchQuery(value);
    };


    useEffect(() => {
        const controller = new AbortController();
    
        const handleSearch = async () => {
          try {
            if (roleSearchQuery === "") {
                setFilteredRoles([]);
            } 
            else {
              setIsPending(true);
  
              const response = await api().get(`/api/asm/get-roles?query=${roleSearchQuery}`, {
                signal: controller.signal,
              });
  
              const result = response.data;
              setFilteredRoles(result.map((role) => {
                return {
                  label: role.name,
                  value: role.id
                }
              }));
              setIsPending(false);
            }
          } catch (error) {
            console.error(error);
          }
        };
    
        handleSearch();
    
        return () => {
          controller.abort();
        };
      }, [roleSearchQuery]);

      return { filteredRoles, roleNoOptionsMessage, searchApprover }
}

export default useSearchRole