import { Dialog, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import DataProtectionNoticeContent from "./DataProtectionNoticeContent";

const DataProtectionNotice = ({ open, setOpen }) => {
    const { t } = useTranslation()

    return ( 
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          scroll={"paper"}
          maxWidth="lg"
          aria-labelledby="scroll-dialog-title"
          aria-describedby="scroll-dialog-description"
        >
        <DialogContent>
          <DialogContentText>
            <DataProtectionNoticeContent />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t("close")}</Button>
        </DialogActions>
      </Dialog>
     );
}
 
export default DataProtectionNotice;