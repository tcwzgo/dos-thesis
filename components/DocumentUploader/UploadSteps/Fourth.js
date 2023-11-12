import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentContext, MAX_FILE_SIZE, TARGET_EXTENSION, QUESTIONNARE_TARGET_EXTENSION } from "../DocumentUploader";
import { UserContext } from "../../../App";
import FileInput from "../../Molecules/FileInput";
import Tooltip from "../../Molecules/Tooltip";
import Filelist from "../../Molecules/Filelist";
import api from '../../../axios_conf.js';
import LoadingButton from '@mui/lab/LoadingButton';
import { Chip, Button, Grid, Box, Typography, Alert, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneIcon from '@mui/icons-material/Done';
import { searchForDuplication } from '../../utils';
import { v4 as uuidv4 } from 'uuid';
import SaveIcon from '@mui/icons-material/Save';
import { useTranslation } from 'react-i18next';
import { useEffect } from "react";
import DSDialog from '../../Molecules/DSDialog'
import DocumentDetailsBlock from "../../Molecules/DocumentDetailsBlock.js";


const Fourth = ({ document, setDocument, supportingDocumentFiles, setSupportingDocumentFiles, attachmentFiles, setAttachmentFiles, trainingTestFiles, setTrainingMaterialFiles, setTrainingTestFiles, trainingMaterialFiles, isEditing, isMigrating, documentVersion, isActive, expirationDate }) => {
  const { t } = useTranslation();
  const { documentState, dispatch } = useContext(DocumentContext)
  const { loggedUserId, loggedUserName, loggedUserIdmRole, isSuperuser } = useContext(UserContext)
  const navigate = useNavigate()
  /* #region state variables */
  const [showModal, setShowModal] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isPending, setIsPending] = useState(false)
  // files are only touched when the user uploads a new file!
  // if we are modifying a document only the document name


  const [fetchError, setFetchError] = useState(null)
  const [missingDocument, setMissingDocument] = useState(false)
  const [missingTestFiles, setMissingTestFiles] = useState(false)
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false)
  const [filesDuplicated, setFilesDuplicated] = useState(false)
  const [wrongExtension, setWrongExtension] = useState(false)
  const [questionnaireWrongExtension, setQuestionnaireWrongExtension] = useState(false)
  const [filesTooLarge, setFilesTooLarge] = useState(false)
  const [config, setConfig] = useState(null)
  /*#endregion state variables */


  useEffect(() => {
    api().get("/api/admin/config").then(res => {
      setConfig(res.data)
    })
  }, [])

  useEffect(() => {
    dispatch({
      type: 'CHANGE_INPUT', payload: {
        name: "id",
        value: isEditing ? documentState.id : uuidv4()
      }
    })
  }, [])

  /*#region event handlers */
  const submitForm = (e) => {
    setMissingDocument(false)
    setMissingTestFiles(false)
    e.preventDefault();
    if (documentState.documents.length !== 1) {
      setMissingDocument(true)
    }
    else if (isEditing && (config?.training_methods?.filter(a => a.key === documentState.training_method)[0].training_questionnaire_mandatory && documentState.training_tests.length === 0)) {
      setMissingTestFiles(true)
    }
    else if (!isEditing && (config?.training_methods?.filter(a => a.key === documentState.training_method)[0].training_questionnaire_mandatory && trainingTestFiles.length === 0)) {
      setMissingTestFiles(true)
    }
    else if (filesTooLarge.length > 0) {
      return
    }
    else {
      setMissingTestFiles(false)
      setMissingDocument(false)
      finalizeUpload();
    }
  };

  const finalizeUpload = () => {
    if (!isMigrating) {
      const indexOfUser = documentState?.allowed_editors.findIndex(e => e.name === loggedUserName)
      if (indexOfUser === -1) {
        dispatch({
          type: "CHANGE_INPUT", payload: {
            name: "allowed_editors",
            value: [
              ...documentState?.allowed_editors,
              {
                "userid": loggedUserId,
                "name": loggedUserName
              }
            ]
          }
        })
      }
    }
    setShowModal(true)

  }

  const addSupportingDocument = (e) => {
    let files = []
    if (e.type === "drop") {
      files = e.dataTransfer.files
    }
    if (e.type === "change") {
      files = e.target.files
    }
    const trimmedSupportingDocuments = Array.from(files).map(e => {
      const indexOfDot = e.name.lastIndexOf(".")
      return e.name.slice(0, indexOfDot)
    })

    const trimmedUploadedSupportingDocuments = documentState.supporting_documents.map(a => {
      const indexOfDot = a.lastIndexOf(".")
      return a.slice(0, indexOfDot)
    })

    if (searchForDuplication([...trimmedSupportingDocuments, ...trimmedUploadedSupportingDocuments])) {
      setFilesDuplicated(true)
    }
    else if (validateFileSize(files)) {
      setFilesTooLarge(true)
    }
    else {
      setFilesTooLarge(false)
      setFilesDuplicated(false)
      setSupportingDocumentFiles(prev => [...prev, ...files])
      handleFileChanges(e)
    }
  }

  const uploadDocument = (e) => {
    let files = []
    if (e.type === "drop") {
      files = e.dataTransfer.files
    }
    if (e.type === "change") {
      files = e.target.files
    }
    setMissingDocument(false)
    const indexOfDot = files[0].name.lastIndexOf(".")
    const lengthOfDocumentName = files[0].name.length
    const extension = files[0].name.slice(indexOfDot, lengthOfDocumentName)

    if (validateFileSize(files)) {
      setFilesTooLarge(true)
    }
    else if (extension !== TARGET_EXTENSION) {
      setWrongExtension(true)
    }
    else {
      setFilesTooLarge(false)
      setWrongExtension(false)
      setDocument(files[0])
      dispatch({
        type: 'CHANGE_INPUT', payload: {
          name: "documents",
          value: [...Array.from(files).map(e => e.name)]
        }
      })
    }
  }

  const removeDocument = (e) => {
    dispatch({
      type: "CHANGE_INPUT", payload: {
        name: "documents",
        value: []
      }
    })
  }
  const handleFileChanges = (e) => {
    let files = []
    if (e.type === "drop") {
      files = e.dataTransfer.files
    }
    if (e.type === "change") {
      files = e.target.files
    }
    const name = e.target.getAttribute("name")
    dispatch({
      type: "CHANGE_INPUT", payload: {
        name: name,
        value: [...documentState[name], ...Array.from(files).map(e => e.name)]
      }
    })
  }

  
  const validateFileSize = (files) => {
    for (const file of files) {
      const sizeInKB = file.size / 1024
      if (sizeInKB > MAX_FILE_SIZE) {
        return true
      }
    }
    return false
  }

  const addAttachments = (e) => {
    let files = []
    if (e.type === "drop") {
      files = e.dataTransfer.files
    }
    if (e.type === "change") {
      files = e.target.files
    }
    const trimmedAttachments = Array.from(files).map(e => {
      const indexOfDot = e.name.lastIndexOf(".")
      return e.name.slice(0, indexOfDot)
    })

    const trimmedUploadedAttachments = documentState.attachments.map(a => {
      const indexOfDot = a.lastIndexOf(".")
      return a.slice(0, indexOfDot)
    })

    if (searchForDuplication([...trimmedAttachments, ...trimmedUploadedAttachments])) {
      setFilesDuplicated(true)
    }
    else if (validateFileSize(files)) {
      setFilesTooLarge(true)
    }
    else {
      setFilesTooLarge(false)
      setFilesDuplicated(false)
      setAttachmentFiles(prev => [...prev, ...files])
      handleFileChanges(e)
    }
  }
  const addTrainingMaterial = (e) => {
    let files = []
    if (e.type === "drop") {
      files = e.dataTransfer.files
    }
    if (e.type === "change") {
      files = e.target.files
    }
    if (validateFileSize(files)) {
      setFilesTooLarge(true)
    }
    else {
      setFilesTooLarge(false)
      setFilesDuplicated(false)
      setTrainingMaterialFiles([files[0]])
      dispatch({
        type: "CHANGE_INPUT", payload: {
          name: "training_material",
          value: [files[0].name]
        }
      })
    }
  }
  const addTrainingTests = (e) => {
    let files = []
    if (e.type === "drop") {
      files = e.dataTransfer.files
    }
    if (e.type === "change") {
      files = e.target.files
    }
    const indexOfDot = files[0].name.lastIndexOf(".")
    const lengthOfDocumentName = files[0].name.length
    const extension = files[0].name.slice(indexOfDot, lengthOfDocumentName)

    if (validateFileSize(files)) {
      setFilesTooLarge(true)
    }
    else if (extension !== QUESTIONNARE_TARGET_EXTENSION && documentState?.training_method === 'online_training') {
      setQuestionnaireWrongExtension(true)
    }
    else {
      setFilesTooLarge(false)
      setQuestionnaireWrongExtension(false)
      setMissingTestFiles(false)
      setTrainingTestFiles([files[0]])
      dispatch({
        type: "CHANGE_INPUT", payload: {
          name: "training_tests",
          value: [files[0].name]
        }
      })
    }
  }

  useEffect(() => {
    if (documentState.document_type !== "online_training") {
      setTrainingTestFiles([])
      dispatch({
        type: 'CHANGE_INPUT', payload: {
          name: 'training_tests', value: []
        }
      })
    }
  }, [documentState.document_type])

  const removeAttachment = (name) => {
    setAttachmentFiles(prev => prev.filter(a => a.name !== name))
    dispatch({
      type: 'CHANGE_INPUT', payload: {
        name: "attachments",
        value: documentState.attachments.filter(a => a !== name)
      }
    })
  }
  const removeSupportingDocuments = (name) => {
    setSupportingDocumentFiles(prev => prev.filter(a => a.name !== name))
    dispatch({
      type: 'CHANGE_INPUT', payload: {
        name: "supporting_documents",
        value: documentState.supporting_documents.filter(a => a !== name)
      }
    })
  }
  const removeTrainingMaterial = (name) => {
    setTrainingMaterialFiles(prev => prev.filter(a => a.name !== name))
    dispatch({
      type: "CHANGE_INPUT", payload: {
        name: "training_material",
        value: documentState.training_material.filter(a => a !== name)
      }
    })
  }
  const removeTrainingTests = (name) => {
    setMissingTestFiles(true)
    setTrainingTestFiles(prev => prev.filter(a => a.name !== name))
    dispatch({
      type: "CHANGE_INPUT", payload: {
        name: "training_tests",
        value: documentState.training_tests.filter(a => a !== name)
      }
    })
  }
  const sendDocument = () => {
    const temp = {
      ...documentState,
      migrated: isMigrating,
      document_version: documentVersion,
      expiration_date: expirationDate ? expirationDate.format("YYYY-MM-DD") : null

    }

    setIsPending(true)
    api(isSuperuser, loggedUserIdmRole).post('/api/documents/create', temp)
      .then(res => {
        setFetchError(null)
        sendAttachments()
      })
      .catch(error => {
        setFetchError(error)
        setIsPending(false)
        setSuccess(false)
      })
  }
  const modifyActiveDocument = () => {
    const temp = {
      ...documentState,
      document_version: documentVersion,
      document_status: "draft",
      expiration_date: expirationDate ? expirationDate.format("YYYY-MM-DD") : null,
      migrated: isMigrating
    }

    setIsPending(true)
    api(isSuperuser, loggedUserIdmRole).post('/api/documents/create', temp)
      .then(res => {
        setFetchError(null)
        sendAttachments()
      })
      .catch(error => {
        setFetchError(error)
        setIsPending(false)
        setSuccess(false)
      })
  }
  const modifyDocument = () => {
    const temp = {
      ...documentState,
      migrated: isMigrating,
      document_version: documentVersion ? documentVersion : documentState.document_version,
      expiration_date: expirationDate ? expirationDate.format("YYYY-MM-DD") : null
    }


    setIsPending(true)
    api(isSuperuser, loggedUserIdmRole).post('/api/documents/edit', temp)
      .then(res => {
        setFetchError(null)
        sendAttachments()
        setSuccess(true)
      })
      .catch(error => {
        setFetchError(error)
        setIsPending(false)
        setSuccess(false)
      })
  }
  const sendAttachments = () => {
    const body = {
      "id": documentState.id,
      "document_version": documentVersion,
      "document_file": document,
      "attachments": attachmentFiles,
      "training_material": trainingMaterialFiles,
      "training_tests": trainingTestFiles,
      "supporting_documents": supportingDocumentFiles
    }

    api(isSuperuser, loggedUserIdmRole).post('/api/documents/upload', body, {
      headers: {
        'Accept': '*/*',
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(res => {
        setIsPending(false)
        setFetchError(null)
        setSuccess(true)
      })
      .catch(error => {
        setFetchError(error)
        setIsPending(false)
        setSuccess(false)
      })
  }
  const returnHome = () => {
    setShowModal(prev => !prev)
    navigate("/")
  }
  /* #endregion event handler */

  return (
    <React.Fragment>
      <form onSubmit={submitForm}>
        <Box
          sx={{
            boxShadow: 5,
            marginTop: 5,
            marginBottom: 5,
            padding: 4,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={9}>
              <Typography sx={{ mt: 1, mb: 1 }} variant="h5" component="div">
                {t("document_uploading_and_verification")}
              </Typography>

            </Grid>
            <Grid item xs={3}>
              <Alert severity="info" variant="outlined">{t("file_size_notification")}</Alert>
            </Grid>
          </Grid>
          <Stack flexDirection={"row"} sx={{ width: "inherit", m: 1 }} flexWrap={"wrap"} flexBasis={"100%"} justifyContent={"center"} gap={2}>
            <Stack flexDirection={"column"} gap={1}>
              <FileInput
                handleFileUpload={uploadDocument}
                name="documents"
                multiple={false}
                label={t("upload_document")}
              />
              {documentState.documents.length > 0 && (
                <Chip
                  sx={{ display: "flex", justifyContent: "space-between", width: "28rem" }}
                  label={documentState.documents[0]}
                  title={documentState.documents[0]}
                  deleteIcon={<DeleteIcon />}
                  onDelete={removeDocument} />
              )}
            </Stack>
            <Stack flexDirection={"column"} gap={1}>
              <FileInput
                handleFileUpload={addTrainingMaterial}
                name="training_material"
                multiple={false}
                label={t("upload_training_material")}
              />
              <Filelist
                files={documentState.training_material}
                removeFile={removeTrainingMaterial}
              />
            </Stack>
            <Stack flexDirection={"column"} gap={1}>
              <FileInput
                handleFileUpload={addSupportingDocument}
                name="supporting_documents"
                multiple={true}
                label={t("upload_supporting_document")}
              />
              <Filelist
                files={documentState.supporting_documents}
                removeFile={removeSupportingDocuments}
              />
            </Stack>
            <Stack flexDirection={"column"} gap={1}>
              <FileInput
                handleFileUpload={addAttachments}
                name="attachments"
                multiple={true}
                label={t("upload_attachments")}
              />
              <Filelist files={documentState.attachments} removeFile={removeAttachment} />
            </Stack>
            <Stack flexDirection={"column"} gap={1}>
              <FileInput
                handleFileUpload={addTrainingTests}
                name="training_tests"
                multiple={false}
                disabled={config?.training_methods?.filter(a => a.key === documentState?.training_method).length > 0 ? !config?.training_methods?.filter(a => a.key === documentState?.training_method)[0].training_questionnaire_mandatory : true}
                label={t("upload_test_questionnaire")}
              />
              <Filelist
                files={documentState.training_tests}
                removeFile={removeTrainingTests}
              />
            </Stack>
          </Stack>
        </Box>

        
        <DocumentDetailsBlock documentData={documentState} />

        <Button
          type="submit"
          variant="contained"
          sx={{ float: "right", width: "12rem" }}
          startIcon={<DoneIcon />}
        >
          {isEditing ? t("modify") : t("finalize")}
        </Button>

      </form>
      {filesDuplicated && (
        <Tooltip
          message={t("files_duplicated_alert")}
          type="alert-warning"
        />
      )}
      {filesTooLarge && (
        <Tooltip
          message={t("file_too_large_alert")}
          type="alert-warning"
        />
      )}
      {missingDocument && (
        <Tooltip
          message={t("missing_document_alert")}
          type="alert-warning"
        />
      )}
      {missingTestFiles && (
        <Tooltip
          message={t("test_questionnaire_mandatory_alert")}
          type="alert-warning"
        />
      )}
      {wrongExtension && (
        <Tooltip
          message={t("wrong_document_extension").replace("${extensions}", TARGET_EXTENSION)}
          type="alert-warning"
        />
      )}
      {questionnaireWrongExtension && (
        <Tooltip
          message={t("queastionnare_wrong_extension_alert").replace("${extensions}", QUESTIONNARE_TARGET_EXTENSION)}
          type="alert-warning"
        />
      )}

      <DSDialog
        open={showModal}
        setOpen={setShowModal}
        type={"info"}
        title={t("are_you_sure")}
        content={isEditing ? t("modifying_document") : t("uploading_document")}
      >
        <LoadingButton
          sx={{ m: 1 }}
          loading={isPending}
          loadingPosition="start"
          startIcon={<SaveIcon />}
          variant="outlined"
          onClick={() => {
            if (isEditing && !isActive) {
              modifyDocument()
            }
            else if (isEditing && isActive) {
              modifyActiveDocument()
            }
            else {
              sendDocument()
            }
          }}
        >
          {isEditing ? t("modify_document") : t("upload_document_dialog")}
        </LoadingButton>
        <Button variant="contained" disabled={isPending} onClick={() => setShowModal(false)}>{t("cancel")}</Button>
      </DSDialog>

      <DSDialog
        open={showModal && success}
        setOpen={setShowModal}
        type={"success"}
        title={t("great")}
        content={isEditing ? t("document_modified_successfully") : t("document_uploaded_successfully")}
      >
        <Button sx={{ m: 1 }} variant="contained" onClick={() => {
          if (documentState?.document_status === 'active' || documentState?.document_status === 'draft') {
            setShowModal(false)
            setIsCreatingWorkflow(true)
          }
          else
            returnHome()
        }
        }>OK</Button>
      </DSDialog>

      <DSDialog
        open={isCreatingWorkflow}
        setOpen={setIsCreatingWorkflow}
        type={"info"}
        title={t("optional_workflow_create_dialog_title")}
        content={t("optional_workflow_create_dialog_content")}
      >
        <Button sx={{ m: 1 }} variant="contained" onClick={() => navigate('/workflow-creation', { state: { step: 2, document: { ...documentState, unique_id: documentState.id } } })}>{t("create_workflow")}</Button>
        <Button sx={{ m: 1 }} variant="outlined" onClick={() => returnHome()}>{t("cancel")}</Button>
      </DSDialog>

      <DSDialog
        open={showModal && fetchError}
        setOpen={setShowModal}
        type={"error"}
        title={isEditing ? t("couldnt_modify_document") : t("couldnt_upload_document")}
        content={isEditing ? (t("error_modify_document") + `: ${fetchError?.message}`) : (t("error_upload_document") + `: ${fetchError?.message}`)}
      >
        <Button sx={{ m: 1 }} variant="contained" onClick={() => {
          setShowModal(prev => !prev)
          setFetchError(null)
        }}>
          {t("return_to_editor")}
        </Button>
      </DSDialog>
    </React.Fragment>
  );
};

export default Fourth;
