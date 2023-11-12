import Select from 'react-select'
import useSearchRole from './useSearchRole'
import { t } from 'i18next'
import { useEffect, useState } from 'react'
import api from '../../../../axios_conf'

const RoleInput = ({ handleSelect, user, isMandatory }) => {
    const [isRolePending, setIsRolePending] = useState(false)
    const { filteredRoles, searchApprover, roleNoOptionsMessage } = useSearchRole(setIsRolePending)
    const [rolesToUser, setRolesToUser] = useState(null)
    const selectStyles = {
      control: (base) => ({
        ...base,
        width: "25rem"
      }),
      menuPortal: (base) => ({ ...base, zIndex: 9999 })
    };

    useEffect(() => {
      if (user && !isMandatory) {
        setIsRolePending(true)
        api().get(`/api/asm/get-roles-to-user?userid=${user?.userid}`)
        .then((res) => {
          const filteredRoles = res.data
          .map((role) => ({ label: role.role_name, value: role.role_id }))
          setRolesToUser(filteredRoles);
          setIsRolePending(false)
        })
        .catch((error) => console.error(error))
      }
    }, [user, isMandatory])

    const filteredOptions = (user && !isMandatory) ? rolesToUser : filteredRoles

    return ( 
        <Select
          placeholder={t("search_approver_role")}
          name='role'
          label={t("role")}
          fullWidth
          required
          menuPortalTarget={document.body}
          autoFocus
          margin="dense"
          styles={selectStyles}
          variant="standard"
          options={filteredOptions}
          className="basic-single"
          classNamePrefix="select"
          onInputChange={searchApprover}
          onChange={handleSelect}
          isLoading={isRolePending}
          noOptionsMessage={() => roleNoOptionsMessage}
        />
     );
}
 
export default RoleInput;