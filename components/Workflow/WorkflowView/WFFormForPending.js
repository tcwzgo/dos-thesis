import { Button, Typography } from "@mui/material";
import PublishIcon from "@mui/icons-material/Publish";
import UpdateDisabledIcon from "@mui/icons-material/UpdateDisabled";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import DSDialog from "../../Molecules/DSDialog";
import CircularProgress from "@mui/material/CircularProgress";

const WFFormForPending = ({
  sendCreatorDecision,
  isOpen,
  setIsOpen,
  loggedInUserIsDocumentResponsible,
  isLoggedUserProxy,
  isLoading,
}) => {
  const { t } = useTranslation();
  
  const [decisionType, setDecisionType] = useState("");

  const handleClick = (e) => {
    setDecisionType(e.target.name);
    setIsOpen(true);
  };

  const handleConfirmClick = (e) => {
    sendCreatorDecision(e)
  };

  return (
    <>
      {(loggedInUserIsDocumentResponsible || (isLoggedUserProxy && !loggedInUserIsDocumentResponsible)) && (
        <>
          <div className="approver-submission-container">
            <Button
              name={"publish"}
              onClick={handleClick}
              variant="contained"
              color="success"
              startIcon={<PublishIcon />}
            >
              {t("publish")}
            </Button>
            <Button
              name={"withdraw"}
              onClick={handleClick}
              variant="contained"
              color="warning"
              startIcon={<UpdateDisabledIcon />}
            >
              {t("withdraw")}
            </Button>

            <DSDialog
              open={isOpen}
              setOpen={setIsOpen}
              type={"info"}
              title={decisionType === "publish" ? t("publish") : t("withdraw")}
              content={
                decisionType === "publish"
                  ? t("publish_dialog_text")
                  : t("withdraw_confirm")
              }
            >
              {!isLoading ? (
                <>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      handleConfirmClick(decisionType?.toLowerCase())
                    }
                  >
                    {t("yes")}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setIsOpen(false)}
                  >
                    {t("cancel")}
                  </Button>
                </>
              ) : (
                <CircularProgress size={20} color="inherit" />
              )}
            </DSDialog>
          </div>
        </>
      )}
      {!loggedInUserIsDocumentResponsible && (
        <div className="approver-submission-container">
          <Typography variant="subtitle2" component="div" gutterBottom>
            {t("waiting_for_document_responsible")}
          </Typography>
        </div>
      )}
    </>
  );
};

export default WFFormForPending;
