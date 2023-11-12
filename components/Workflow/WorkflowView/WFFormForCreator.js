import { Button } from "@mui/material";
import UpdateDisabledIcon from "@mui/icons-material/UpdateDisabled";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import DSDialog from "../../Molecules/DSDialog";
import CircularProgress from "@mui/material/CircularProgress";

const WFFormForCreator = ({
  wdBtnDisabled,
  sendCreatorDecision,
  isLoading,
  setIsLoading,
}) => {
  const { t } = useTranslation();
  const [decisionType, setDecisionType] = useState("");
  const [openCreatorModal, setOpenCreatorModal] = useState(false);

  const handleClick = (e) => {
    setIsLoading(true);
    setDecisionType("withdraw");
    setOpenCreatorModal((prev) => !prev);
    setIsLoading(false);
  };
  const handleConfirmClick = (e) => {
    setIsLoading(true);
    setOpenCreatorModal((prev) => !prev);
    sendCreatorDecision(e);
    setIsLoading(false);
  };
  return (
    <div className="approver-submission-container">
      <Button
        disabled={wdBtnDisabled}
        name={"withdraw"}
        onClick={handleClick}
        variant="contained"
        color="warning"
        startIcon={<UpdateDisabledIcon />}
      >
        {t("withdraw")}
      </Button>

      <DSDialog
        open={openCreatorModal}
        setOpen={setOpenCreatorModal}
        type={"warning"}
        title={t("withdraw")}
        content={t("withdraw_confirm")}
      >
        {!isLoading ? (
          <>
            <Button
              variant="outlined"
              onClick={() => handleConfirmClick(decisionType?.toLowerCase())}
            >
              {t("yes")}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setOpenCreatorModal(false)}
            >
              {t("cancel")}
            </Button>
          </>
        ) : (
          <CircularProgress size={20} color="inherit" />
        )}
      </DSDialog>
    </div>
  );
};

export default WFFormForCreator;
