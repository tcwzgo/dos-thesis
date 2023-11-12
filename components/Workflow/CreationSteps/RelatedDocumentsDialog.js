import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import LoadingButton from "@mui/lab/LoadingButton";
import RelatedDocumentsList from './RelatedDocumentsList';

const RelatedDocumentsDialog = ({ open, setOpen, documents, isCreateWorkflowPending, createWorkflow }) => {
    const { t } = useTranslation()
    return ( 
        <Dialog open={open} keepMounted={false} setOpen={setOpen} fullWidth maxWidth={"sm"} maxHeight={"md"} PaperProps={{ sx: { borderTop: '7px solid #1565c0' }}}>
            <DialogTitle>{t("optional_workflow_create_dialog_title")}</DialogTitle>
            <DialogContent>
                <>
                    {documents.length === 0 ? 
                        <Typography variant="subtitle1">{t("optional_workflow_create_dialog_content")}</Typography>
                    :
                        <>
                            {documents.map(document => {
                                return (
                                    <RelatedDocumentsList document={document} key={document?.value}/>
                                    )
                                })}
                        </>
                    }
                </>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" color='error' onClick={() => setOpen(false)}>{t("cancel")}</Button>
                {/* <Button variant="outlined" disabled={true}>{t("email_notification")}</Button> */}
                <LoadingButton type='button' variant="contained" loading={isCreateWorkflowPending} onClick={createWorkflow}>{t("create_workflow")}</LoadingButton>
            </DialogActions>
        </Dialog>
     );
}
 
export default RelatedDocumentsDialog;