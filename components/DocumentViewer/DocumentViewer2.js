import React, { useState, useEffect, useContext } from "react";
import api from "../../axios_conf.js";
import { useParams, useNavigate } from "react-router-dom";
import Iframe from "react-iframe";
import { Link } from "react-router-dom";
import { hasRole, ROLES } from "../utils.js";
import { UserContext } from "../../App.js";
import { IconButton, Typography, Grid, Chip, Tooltip, Alert, Stack, Popover, Button } from "@mui/material";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { OverlayActivityIndicator } from "@bosch/react-frok";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import { useTranslation } from "react-i18next";
import ActiveEditModal from "../DocumentBrowser/ActiveEditModal";
import RuleIcon from '@mui/icons-material/Rule';
import NoRoleMessage from "../NoRoleMessage.js";
import DocumentDetailsBlock from "../Molecules/DocumentDetailsBlock.js";

function DocumentViewer2() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const { loggedUserIdmRole, isSuperuser } = useContext(UserContext);
  const { version } = useParams();
  const navigate = useNavigate();
  const [documentData, setDocumentData] = useState({});
  const [iframeurl, setIframeUrl] = useState();
  const [isPending, setIsPending] = useState(true);
  const [isActiveEditModalOpen, setIsActiveEditModalOpen] = useState(false)
  const [noRoleError, setNoRoleError] = useState(false)
  const [documentStatusPopoverOpen, setDocumentStatusPopoverOpen] = useState(false)
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [documentStatusPopoverLoading, setDocumentStatusPopoverLoading] = useState(false)

  const statusColors = {
    archive: "warning",
    active: "success",
    in_approval: "primary",
    draft: "default",
    cancelled: "warning"
  }

  useEffect(() => {
    if (!version) {
      return
    }
    api().post("/api/notifications/seen", {
      type: "document",
      document_unique_id: id,
      document_version: version,
    });
  }, [id, version]);

  const fetchDocumentPdf = () => {
    if (!version) {
      return
    }
    setIsPending(true);
    const documentFetched = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const blob = new Blob([xhr.response], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          setIframeUrl(url);
        }

        setIsPending(false);
      }
    };
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = documentFetched;
    xhr.open(
      "GET",
      `${process.env.REACT_APP_HOST_NAME}/api/documents/${id}/${version}/document`,
      true
    );
    xhr.responseType = "blob";
    xhr.setRequestHeader(
      "DOSaccessToken",
      localStorage.getItem("DOSaccessToken")
    );
    xhr.send();
  }

  useEffect(() => {
    if (!version) {
      const url = `/api/documents/${id}/latest`;
      api(isSuperuser, loggedUserIdmRole)
        .get(url, {})
        .then(function (response) {
          navigate(`/document-view-details/${id}/${response.data.document_version}`)
        })
        .catch(error => {
          console.log('error ', error)
          if (error.response.status === 403) {
            setNoRoleError(true)
          }
        })
    }
    else {
      fetchDocument();
      fetchDocumentPdf();
    }
  }, [id, version]);

  const fetchDocument = () => {
    if(!version){
      return
    }
    const getData = async () => {
      const url = `/api/documents/${id}/${version}`;
      await api(isSuperuser, loggedUserIdmRole)
        .get(url, {})
        .then(function (response) {
          setDocumentData(response.data);
        })
        .catch(error => {
          console.log('error ', error)
          if (error.response.status === 403) {
            setNoRoleError(true)
          }
        })
    };
    getData();
  }

  const handleEditClick = (status) => {
    if (status === "active") {
      setIsActiveEditModalOpen(true)
    }
    else {
      navigate("/document-uploader", {
        state: {
          document: documentData,
          isEditing: true,
          isMigrating: documentData.migrated,
          isActive: false,
        },
      })
    }
  }

  const handleRegenerateClick = () => {
    setIsPending(true)
    api(isSuperuser, loggedUserIdmRole).post(`/api/documents/${id}/${version}/regenerate_cover`)
    .then(() => {
      window.location.reload()
      setIsPending(false)
    })
    .catch(error => {
      console.error(error)
      setIsPending(false)
    })
  }

  const handleSuperuserStatusChange = (status) => {
    setDocumentStatusPopoverLoading(true)
    api(isSuperuser, loggedUserIdmRole).post(`/api/documents/${id}/${version}/set_status`, {
      status: status
    }).then(() => {
      setDocumentStatusPopoverOpen(false)
      setAnchorEl(null)
      fetchDocument()
      setDocumentStatusPopoverLoading(false)

    })
  }

  const MyDocument = () => {
    return (
      <>
        <ActiveEditModal isOpen={isActiveEditModalOpen} setIsOpen={setIsActiveEditModalOpen} />
        <Grid container xs="12">
          <Stack sx={{ width: "96%" }} flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"}>
            <Typography sx={{ mt: 1, mb: 1 }} variant="h6" component="div">
              {documentData?.document_name}
            </Typography>
            <Stack flexDirection={"row"} alignItems={"center"} justifyContent={"center"} gap={1}>
            {hasRole(loggedUserIdmRole, [ROLES.SUPERUSER]) ?
                  (
                    <>
                      <Chip
                        label={t(documentData?.document_status)}
                        title={t(documentData?.document_status)}
                        color={statusColors[documentData?.document_status]}
                        aria-aria-describedby="document-status"
                        onClick={(event) => {
                          setAnchorEl(event.currentTarget);
                          setDocumentStatusPopoverOpen(true)
                        }}
                      />
                      <Popover
                        id="document-status"
                        open={documentStatusPopoverOpen}
                        anchorEl={anchorEl}
                        onClose={() => {
                          setAnchorEl(null);
                          setDocumentStatusPopoverOpen(false)
                        }}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'center',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'center',
                        }}>
                        <Typography sx={{ p: 2 }}>{t("set_document_status")}</Typography>
                        {documentStatusPopoverLoading && <OverlayActivityIndicator size={"small"} disableBlur={true} />}
                        <Grid container sx={{
                          padding: "1rem"
                          
                        }}
                        style={{ filter: documentStatusPopoverLoading ? 'blur(3px)' : "", position: 'relative', zIndex: 0 }}>
                          {["active", "draft", "archive"].map((status) => {
                            return <Grid item xs={12} sx={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}>
                              <Button sx={{ textTransform: "none" }} disabled={status === documentData?.document_status || documentStatusPopoverLoading}
                                onClick={() => {
                                  handleSuperuserStatusChange(status)
                                }} >
                                <Chip
                                  sx={{
                                    cursor: "pointer"
                                  }}
                                  label={t(status)}
                                  title={t(status)}
                                  color={statusColors[status]} />
                              </Button>
                            </Grid>
                          })}
                        </Grid>
                      </Popover>
                    </>

                  ) :
                  (<Chip
                    label={t(documentData?.document_status)}
                    title={t(documentData?.document_status)}
                    color={statusColors[documentData?.document_status]} />)
                }
              <Tooltip title={t("view_relevant_workflow")}>
                <IconButton color={"primary"} disabled={documentData?.relevant_workflow_id === null} onClick={() => {
                  if(documentData?.document_status === "active" || documentData?.document_status === "in_approval") {
                    navigate(`/workflow-view/${documentData?.relevant_workflow_id}`)
                  }
                  else if (documentData?.document_status === "archive") {
                    navigate(`/workflow-view/${documentData?.relevant_archival_workflow_id}`)
                  } 
                }}>
                  <RuleIcon />
                </IconButton>
              </Tooltip>
              {hasRole(loggedUserIdmRole, [
                ROLES.SUPERUSER,
                ROLES.EDITOR,
                ROLES.PLANT_DOCUMENT_RESPONSIBLE,
                ROLES.DOCUMENT_RESPONSIBLE,
                ROLES.DEPARTMENT_LEADER,
                ROLES.GROUP_LEADER,
                ROLES.HSE,
                ROLES.TEF6,
                ROLES.QTEAMER,
                ROLES.TWI_COORDINATOR,
                ROLES.PRODUCT_PLANNER,
              ]) &&
                ["active", "draft"].indexOf(documentData?.document_status) >= 0 && (
                  <>
                      <Tooltip title={t("regenerate_cover")}>
                        <IconButton
                          color="primary"
                          onClick={() => handleRegenerateClick()}
                          aria-label={t("regenerate_cover")}
                        >
                          <NoteAddIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={t("edit_document")}>
                        <IconButton
                          color="primary"
                          onClick={() => handleEditClick(documentData?.document_status)}
                          aria-label={t("edit_document")}
                        >
                          <BorderColorIcon />
                        </IconButton>
                      </Tooltip>
                  </>
                )}
              <Tooltip title={t("view_document")}>
                <Link
                  target="_blank"
                  to={`/document-view/${documentData?.id}/${documentData?.document_version}`}
                >
                  <IconButton color={"primary"}>
                    <FindInPageIcon />
                  </IconButton>
                </Link>
              </Tooltip>
            </Stack>
          </Stack>
          <Grid item xs="8" sx={{
            marginBottom: "1rem"
          }}>
            <Grid container>
              <Grid item xs={12}>
                <Typography sx={{ mt: 1, mb: 1 }} variant="caption" component="div">
                  {documentData?.document_id}
                </Typography>
              </Grid>

            </Grid>
          </Grid>
        </Grid>
        <DocumentDetailsBlock documentData={documentData} sx={{

        }} />
      </>
    );
  };

  function CustomLoadingOverlay() {
    return <OverlayActivityIndicator size={"small"} disableBlur={true} />;
  }

  return (
    <>
      {noRoleError ?
        <NoRoleMessage />
        :
        <div>
          {!isPending ? (
            <Grid container xs={12}>
              <Grid item xs={6}>
                {MyDocument()}
              </Grid>
              <Grid item xs={6} >
                {iframeurl ? (
                  <div>
                    <Iframe
                      url={iframeurl}
                      width="100%"
                      height="850rem"
                      id=""
                      className=""
                      display="block"
                      position="relative"
                      flexDirection="row"
                    />
                  </div>) : (
                  <div sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}>
                    <Alert sx={{
                      marginTop: "45vh",
                      marginLeft: "15vw",
                      width: "50%",

                    }} severity="error">{t("could_not_find_document")}</Alert>
                  </div>
                )
                }
              </Grid>
            </Grid>
          ) : (
            <CustomLoadingOverlay />
          )}
        </div>
      }
    </>
  );
}

export default DocumentViewer2;
