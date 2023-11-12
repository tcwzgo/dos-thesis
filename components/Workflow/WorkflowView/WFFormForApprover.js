import { Box, Checkbox, Chip, FormControlLabel, FormGroup, Grid, TextField, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DSDialog from "../../Molecules/DSDialog";
import CircularProgress from "@mui/material/CircularProgress";
import { roles } from "../../utils";

const WFFormForApprover = ({
  sendApproverDecision,
  comment,
  setComment,
  buttonsDisabled,
  workflowData,
  isLoading,
  setIsLoading,
  approvableRoles,
  asmRoleIdNames,
  documentNames,
  allDepartments
}) => {
  const { t } = useTranslation();
  const [decisionType, setDecisionType] = useState("");
  const [openApproverModal, setOpenApproverModal] = useState(false);
  const [missingComment, setMissingComment] = useState(false);
  const [approvalRoles, setApprovalRoles] = useState([]);

  const notInApproval = workflowData?.status?.toLowerCase() !== "in_approval";

  useEffect(() => {
    if (approvableRoles?.length === 1) {
      setApprovalRoles(approvableRoles);
    }
  }, [approvableRoles]);

  const handleClick = (e) => {
    setIsLoading(true);
    const name = e.target.name;
    if (name === "approve") {
      setOpenApproverModal((prev) => !prev);
      setMissingComment(false);
      setDecisionType("approve");
    } else if (name === "reject") {
      if (comment === "") {
        setMissingComment(true);
      } else {
        setMissingComment(false);
        setOpenApproverModal((prev) => !prev);
        setDecisionType("reject");
      }
    }
    setIsLoading(false);
  };

  return (
    <>
      <Box >
        <Grid container sx={{
          marginX: "1rem"
        }}>
          <Grid item xs={12}>
            <Typography variant="body">{t("what_role_to_approve")}</Typography>
          </Grid>
          <Grid item xs={12}>
            <FormGroup>
              <Grid container sx={{
                marginX: "1rem"
              }}>
                {approvableRoles?.map((uuid) => {
                  const level = workflowData?.approvers?.find((level) => level?.level === workflowData.current_level);
                  const role = level?.approverRoles?.find((role) => role?.uuid === uuid);

                  return <Grid item xs={12} key={uuid}>
                    <FormControlLabel control={<Checkbox onChange={(e) => {
                      if (e.target.checked) {
                        setApprovalRoles((prev) => [...prev, uuid]);
                      } else {
                        setApprovalRoles((prev) => prev.filter((r) => r !== uuid));
                      }
                    }}
                      checked={approvalRoles.includes(uuid)}
                    />} label={role.role.startsWith("idm") ? `${roles[Object.keys(roles).filter((r) => roles[r].idmDisplayName === role.role)]?.name}` :
                      role.role.startsWith("asm") ? asmRoleIdNames[role.role] :
                        role.role.startsWith("creator") ? documentNames[role.role] : null} />
                    {role.role.startsWith("idm") && <Chip sx={{ marginRight: "1rem" }} label={`${allDepartments.find((r) => r.value === role.department)?.label}`} />}
                    {<Chip label={`${role.user.name}`} />}
                  </Grid>
                })}
              </Grid>
            </FormGroup>
          </Grid>
        </Grid>
      </Box>
      <Box component="div" sx={{ p: 2, border: "1px dashed grey" }}>
        <TextField
          disabled={notInApproval}
          id="outlined-multiline-flexible"
          label={
            notInApproval
              ? t("workflow_is_not_in_approval")
              : t("comment_for_approval")
          }
          multiline
          sx={{
            minWidth: "100%",
            mb: 1,
          }}
          error={missingComment}
          helperText={
            notInApproval ? "" : t("comment_is_mandatory_for_rejection")
          }
          rows={7}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div>
          <Button
            disabled={notInApproval || buttonsDisabled || approvalRoles.length === 0}
            onClick={handleClick}
            variant="contained"
            startIcon={<DoneIcon />}
            name="approve"
          >
            {t("approve")}
          </Button>
          <Button
            disabled={notInApproval || buttonsDisabled || approvalRoles.length === 0}
            onClick={handleClick}
            sx={{ ml: 2 }}
            variant="contained"
            color="error"
            startIcon={<CloseIcon />}
            name="reject"
          >
            {t("reject")}
          </Button>
        </div>
      </Box>

      <DSDialog
        open={openApproverModal}
        setOpen={setOpenApproverModal}
        type={decisionType === "approve" ? "info" : "error"}
        title={
          decisionType === "approve"
            ? t("are_you_sure_to_approve")
            : t("are_you_sure_to_reject")
        }
        content={
          decisionType === "approve"
            ? t("workflow_approve_warning")
            : t("workflow_reject_warning")
        }
      >
        {!isLoading ? (
          <>
            <Button
              variant="outlined"
              onClick={() => sendApproverDecision(decisionType?.toLowerCase(), approvalRoles)}
            >
              {t("yes")}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setOpenApproverModal((prev) => !prev)}
            >
              {t("cancel")}
            </Button>
          </>
        ) : (
          <CircularProgress size={20} color="inherit" />
        )}
      </DSDialog>
    </>
  );
};

export default WFFormForApprover;
