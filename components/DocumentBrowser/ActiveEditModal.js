import { Button, Stack, Alert, AlertTitle } from '@mui/material';
import DSDialog from "../Molecules/DSDialog";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../axios_conf";
import { getNewVersion } from '../DocumentUploader/DocumentUploader';
import { useEffect, useCallback, useState, useContext } from 'react';
import { UserContext } from '../../App';

const ActiveEditModal = ({ isOpen, setIsOpen, document }) => {

    const [formalDraft, setFormalDraft] = useState(null)
    const { loggedUserIdmRole, isSuperuser } = useContext(UserContext)
    const [contentDraft, setContentDraft] = useState(null)
    const navigate = useNavigate()
    const { t } = useTranslation()
    const actionBtnStyles = {
        padding: '1rem',
    }

    const returnVersionIfExists = useCallback(async (version) => {
        try {
            const res = await api(isSuperuser, loggedUserIdmRole).get(`/api/documents/${document?.id}/${version}`);
            if (res.data) {
                const foundDocument = res.data;
                return foundDocument;
            } else {
                return null;
            }
        } catch (error) {
            console.error(`Error fetching document with version: ${version}` );
            return null;
        }
    }, [document?.id]);

    useEffect(() => {
        if (isOpen) {
            const formalVersion = getNewVersion('formal', document);
            returnVersionIfExists(formalVersion)
                .then(existingFormalDraft => {
                    if (existingFormalDraft?.document_status === "draft") {
                        setFormalDraft(existingFormalDraft);
                    }
                    else {
                        setFormalDraft(null)
                    }
                });
        }
    }, [document, isOpen, returnVersionIfExists]);
    
    useEffect(() => {
        if (isOpen) {
            const contentVersion = getNewVersion('content', document);
            returnVersionIfExists(contentVersion)
                .then(existingContentDraft => {
                    if (existingContentDraft?.document_status === "draft") {
                        setContentDraft(existingContentDraft);
                    }
                    else {
                        setContentDraft(null)
                    }
                });
        }
    }, [document, isOpen, returnVersionIfExists]);

    return (
        <DSDialog open={isOpen} setOpen={setIsOpen} type={"info"} title={t("active_modification_modal_title")} content={
            <>
            
                {contentDraft ? 
                    <Alert severity="info" sx={{ mt: "8px", mb: "8px" }}>
                        <AlertTitle>{t("version_already_exists")} <strong>{contentDraft?.document_version}</strong></AlertTitle>
                        {t("creator")}: <strong>{contentDraft?.creator_name}</strong>
                    </Alert>
                    :
                    null
                }
                {formalDraft ? 
                    <Alert severity="info" sx={{ mt: "8px", mb: "8px" }}>
                        <AlertTitle>{t("version_already_exists")} <strong>{formalDraft?.document_version}</strong></AlertTitle>
                        {t("creator")}: <strong>{formalDraft?.creator_name}</strong>
                    </Alert>
                    :
                    null
                }
                <Stack flexDirection={"row"} justifyContent={"center"} alignItems={"center"} gap={2} sx={{ mt: 1, mb: 1, paddingTop: "20px" }}>
                    <Button sx={actionBtnStyles} disabled={!!formalDraft} color={"primary"} variant={"contained"} onClick={() => navigate("/document-uploader", {
                        state: {
                            document: document,
                            isEditing: true,
                            isMigrating: document.migrated,
                            isActive: true,
                            changeType: "formal",
                        }
                    })}>{t("formal_change")}</Button>
                    <Button sx={actionBtnStyles} disabled={!!contentDraft} color={"primary"} variant={"contained"} onClick={() => navigate("/document-uploader", {
                        state: {
                            document: document,
                            isEditing: true,
                            isMigrating: document.migrated,
                            isActive: true,
                            changeType: "content",
                        }
                    })}>{t("normal_change")}</Button>
                </Stack>
            </>
        }>
            <Button color={"error"} variant={"outlined"} sx={{ float: "left", margin: 0 }} onClick={() => setIsOpen(false)}>{t("cancel")}</Button>
        </DSDialog>
    )
}

export default ActiveEditModal