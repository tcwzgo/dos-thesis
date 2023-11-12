import { Stack, Typography, Tooltip, IconButton, Divider, Chip } from "@mui/material"
import Delete from "@mui/icons-material/Delete"
import { Edit } from "@mui/icons-material"
import AvatarChip from "../../../Molecules/AvatarChip"
import ApproverInput from "./ApproverInput"
import { useContext } from "react"
import { ApproversContext } from "../Second";
import RoleInput from "./RoleInput"
import { t } from "i18next"

const ApproverTableRow = ({ role, user, departmentName, isMandatory, level, index }) => {
    const { dispatch } = useContext(ApproversContext)
    const isCreator = role?.id.includes('creator')
    const handleDeleteRoleClick = () => {
        dispatch({ type: "REMOVE_ROLE", payload: {
            index: index,
            level: level
        }})
    }

    const handleApproverSelect = (newApprover) => {
        dispatch({ type: "ADD_USER", payload: {
            level: level,
            index: index,
            user: {
              name: newApprover.label,
              userid: newApprover.value
            }
        }})
    }

    const handleRoleSelect = (newRole) => {
        dispatch({ type: "ADD_RESPONSIBILITY", payload: {
            level: level,
            index: index,
            role: {
                name: newRole.label,
                id: `asm-${newRole.value}`
            }
        }})
    }

    const handleEditUserClick = () => {
        dispatch({ type: "REMOVE_USER", payload:{
            level: level,
            index: index
        }})
    }

    const handleEditRoleClick = () => {
        dispatch({ type: "EDIT_ROW", payload: {
            level: level,
            index: index
        }})
    }

    return (
        <Stack justifyContent={"center"} alignItems={"center"}>
            <Stack
                sx={{
                    backgroundColor: "rgba(0, 0, 0, 0.03)",
                    padding: "4px",
                    width: "65rem",
                    overflowX: "auto",
                    margin: "4px",
                    height: "65px",
                    borderRadius: "5px",
                    overflow: "hidden"
                }}
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
            >
                <Stack flexDirection={"row"} gap={1} alignItems={"center"}>
                    {role ? 
                        <Stack flexDirection={"row"} alignItems={"center"} justifyContent={"center"} gap={1} sx={{ width: "25rem" }}>
                            <Tooltip title={role?.name}>
                                <Typography ml={1} textAlign={"center"} noWrap>{departmentName && <Chip label={departmentName}/>} {role?.name}</Typography>
                            </Tooltip>
                        </Stack>
                        :
                        <RoleInput handleSelect={handleRoleSelect} user={user} isMandatory={isMandatory}/>
                    }
                    <Divider orientation="vertical" flexItem />
                </Stack>
                <Stack flexDirection={"row"} alignItems={"center"} justifyContent={"center"}>
                    {user ?
                        <Stack flexDirection={"row"} alignItems={"center"} gap={1}>
                            <AvatarChip userid={user?.userid} name={user?.name}/>
                        </Stack>
                        :
                        <ApproverInput handleSelect={handleApproverSelect} role={role} isMandatory={isMandatory} departmentName={departmentName}/>
                    }
                </Stack>
                <Stack flexDirection={"row"} alignItems={"center"}>
                    <Divider orientation="vertical" flexItem />
                    {!isCreator ?
                        <Tooltip title={t("edit_row")}>
                            <IconButton onClick={isMandatory ? handleEditUserClick : handleEditRoleClick} color={"primary"}>
                                <Edit />
                            </IconButton>
                        </Tooltip>
                        :
                        null
                    }
                    <Tooltip title={t("delete_row")}>
                        <IconButton disabled={isMandatory} color="error" mr={1} onClick={handleDeleteRoleClick}>
                            <Delete />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Stack>
        </Stack>
    )
}

export default ApproverTableRow