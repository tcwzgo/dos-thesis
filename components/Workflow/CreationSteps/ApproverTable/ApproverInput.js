import Select from "react-select";
import { t } from "i18next";
import useSearchApprover from './useSearchApprover'
import { useContext, useEffect, useState } from "react";
import api from "../../../../axios_conf";
import { UserContext } from "../../../../App";

const ApproverInput = ({ handleSelect, role, isMandatory, departmentName }) => {
    const [isUsersPending, setIsUsersPending] = useState(false)
    const { searchApprover, filteredApprovers, userNoOptionsMessage } = useSearchApprover(isMandatory, setIsUsersPending, role, departmentName)
    const { loggedUserIdmRole, isSuperuser } = useContext(UserContext)

    const [usersToRole, setUsersToRole] = useState(null)
    const selectStyles = {
      control: (base) => ({
        ...base,
        width: "30rem",
      }),
      menuPortal: (base) => ({ ...base, zIndex: 9999 })
    };

    useEffect(() => {
      if (role && !isMandatory) {
        setIsUsersPending(true)
        const roleId = Number(role?.id.split('-')[1])
        api(isSuperuser, loggedUserIdmRole).get(`/api/asm/get-users-to-role?role_id=${roleId}`)
        .then((res) => {
          setUsersToRole(
            res.data
              ?.filter((user) => user.nt_user !== null)
              ?.map((user) => ({ label: user.name, value: user.nt_user?.toLowerCase() }))
          )
          setIsUsersPending(false)
        })
        .catch((error) => console.error(error))
      }
    }, [role, isMandatory])

    const options = (role && !isMandatory) ? usersToRole : filteredApprovers

    return (
      <Select
        placeholder={t("search_user")}
        id="name"
        label={t("name")}
        name="user"
        fullWidth
        autoFocus
        required
        margin="dense"
        menuPortalTarget={document.body}
        styles={selectStyles}
        variant="standard"
        options={options}
        className="basic-single"
        classNamePrefix="select"
        onInputChange={searchApprover}
        onChange={handleSelect}
        isLoading={isUsersPending}
        noOptionsMessage={() => userNoOptionsMessage}
      />
    )
}

export default ApproverInput