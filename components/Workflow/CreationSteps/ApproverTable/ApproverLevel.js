import { useContext } from "react";
import ApproverTableRow from "./ApproverTableRow";
import { ApproversContext } from "../Second";
import { Stack, Divider, Button, Alert } from "@mui/material";
import { t } from "i18next";
import { v4 as uuidv4 } from 'uuid';

const ApproverLevel = ({ level, approverRoles, isMandatory }) => {
    const { approverTableState, dispatch } = useContext(ApproversContext)
    const isLastLevel = level === approverTableState?.length 
    const isDeletable = isLastLevel && !isMandatory // only last, non-mandatory level can be deleted
    const hasEmptyRoles = approverRoles?.some((approverRole) => approverRole?.role === null || approverRole?.user === null)

    const handleAddRoleClick = () => {
        dispatch({ type: "ADD_ROLE", payload: {
            level: level,
            uuid: uuidv4()
        }})
    }

    const handleDeleteLevelClick = () => {
        dispatch({ type: "DELETE_LEVEL", payload: {
            level: level
        }})
    }

    return (
        <Stack mb={4}>
            <Divider>{t("level")} {level}</Divider>
            <Stack alignItems={"end"} mb={0.8}>
                <Button color={"error"} sx={{ width: "11rem" }} variant={"outlined"} onClick={handleDeleteLevelClick} disabled={!isDeletable}>{t("remove_level")}</Button>
            </Stack>
            {approverRoles.length > 0 ?
                <>
                    {approverRoles.map((approverRole, index) => {
                            return (
                                <ApproverTableRow {...approverRole} level={level} key={approverRole?.user?.userid} index={index}/>
                            )
                        })
                    }
                </>
                :
                <Stack justifyContent={"center"} alignItems={"center"}>
                    <Alert severity="error" sx={{ display: "flex", justifyContent: "center", width: "65rem"}}>{t("empty_level_not_allowed")}</Alert>
                </Stack>
            }
            <Stack alignItems={"center"} justifyContent={"center"} mt={2}>
                <Button variant={"outlined"} sx={{ width: "20rem" }} disabled={hasEmptyRoles} onClick={handleAddRoleClick}>{t("add_new_approver_role")}</Button>
            </Stack>
        </Stack>
    );
}
 
export default ApproverLevel;