import { useContext } from "react";
import ApproverLevel from './ApproverLevel'
import { Button, Stack } from '@mui/material';
import { t } from "i18next";
import { ApproversContext } from "../Second";

const Approvers = () => {
  const { approverTableState, dispatch } = useContext(ApproversContext) 

  const handleAddLevelClick = () => {
    dispatch({ type: "ADD_LEVEL" })
  }

  return (
    <>
      {approverTableState.map((level) => {
        return (
          <ApproverLevel {...level}/>
          )
        })
      }
      <Stack flexDirection={"row"} alignItems={"center"} justifyContent={"center"}>
        <Button sx={{ display: "flex", justifyContent: "center", width: "15rem", mb: 4 }} variant={"contained"} onClick={handleAddLevelClick}>+ {t("add_new_level")}</Button>
      </Stack>
    </>
  );
};

export default Approvers;
