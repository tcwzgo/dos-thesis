import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { Layout, TableRow } from "@bosch/react-frok";
import { OverlayActivityIndicator } from "@bosch/react-frok";
import WFStickyHeader from "./WFStickyHeader";
import WFApproverTable from "./WFApproverTable";
import WFFormForApprover from "./WFFormForApprover";
import WFFormForCreator from "./WFFormForCreator";
import WFFormForPending from "./WFFormForPending";
import api from "../../../axios_conf.js";
import Grid from "@mui/material/Grid";
import PersonIcon from "@mui/icons-material/Person";
import { UserContext } from "../../../App";
import {
  Box,
  ListItem,
  Chip,
  Avatar,
  Card,
  Typography,
  TableCell,
  TableHead,
  TableBody,
  TableContainer,
  Paper,
  Button,
  Table,
} from "@mui/material";
import AvatarComponent from "../../Molecules/AvatarComponent";
import { useTranslation } from "react-i18next";
import DSTableRow from "../../DocumentBrowser/DSTableRow";
import DSDialog from "../../Molecules/DSDialog";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function WorkflowView() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isWorkflowLoading, setIsWorkflowLoading] = useState(true);
  const [isPublishPending, setIsPublishPending] = useState(false)
  const [error, setError] = useState({
    status: false,
    content: "",
  });
  const { loggedUserId, loggedUserIdmRole, isSuperuser } =
    useContext(UserContext);
  const [documentIsPending, setDocumentIsPending] = useState(false);
  const [approvers, setApprovers] = useState([]);
  const [approverResponses, setApproverResponses] = useState([]);
  const [relatedDocument, setRelatedDocument] = useState({});
  const [comment, setComment] = useState("");
  const [workflowData, setWorkflowData] = useState({});
  const [CCs, setCCs] = useState([]);
  const [wdBtnDisabled, setWdBtnDisabled] = useState(true);
  const [isPendingDialogOpen, setIsPendingDialogOpen] = useState(false);
  const [canUserApprove, setCanUserApprove] = useState(false);
  const [canUserPublish, setCanUserPublish] = useState(false);
  const [approvableRoles, setApprovableRoles] = useState([]);
  const { id: workflowId } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [documentsMarkedForArchival, setDocumentsMarkedForArchival] = useState(
    []
  );

  const [asmRoleIdNames, setAsmRoleIdNames] = useState({})
  const [documentNames, setDocumentNames] = useState({})
  const [allDepartments, setAllDepartments] = useState([])

  useEffect(() => {
    const fetchDepartments = async () => {
      await axios
        .get(process.env.REACT_APP_LOS_API_ENDPOINT + `/api/departments`)
        .then((res) => {
          setAllDepartments([...res.data]);
        })
        .catch((error) => {
          console.error(error);
        });
    }
    fetchDepartments();
  }, [])


  useEffect(() => {
    setAsmRoleIdNames({})
    setDocumentNames({})
    let asmRoleIds = []
    let documentIds = []
    approvers.map((level, i) => {
      level.approverRoles.map((approver, i) => {
        if (approver?.role.startsWith("asm")) {
          asmRoleIds.push(approver?.role.split("-")[1])
        }
        if (approver?.role.startsWith("creator")) {
          documentIds.push({ id: approver?.role.split(":")[1], version: approver?.role.split(":")[2] })
        }
      }
      )
    })
    if (asmRoleIds.length > 0) {
      api()
        .get(`/api/asm/role-name?ids=[${asmRoleIds.toString()}]`)
        .then((res) => {
          res.data.map((asmRole) => {
            setAsmRoleIdNames((prev) => ({ ...prev, [`asm-${asmRole.value.toString()}`]: asmRole.label }))
          })
        });
    }

    documentIds.map((document) => {
      api()
        .get(`/api/documents/${document.id}/${document.version}`)
        .then((res) => {
          setDocumentNames((prev) => ({ ...prev, [`creator:${res.data.id}:${res.data.document_version}`]: `${t("creator")}: ${res.data.document_id}` }))
        });
    });

  }, [approvers])

  useEffect(() => {
    api().post("/api/notifications/seen", {
      workflow_id: workflowId,
      type: "workflow",
    });
  }, [workflowId]);

  const fetchRelatedDocument = async (docId, docVersion) => {
    setIsWorkflowLoading(true);
    const ctrl = new AbortController();
    const signal = ctrl.signal;

    if (documentIsPending) {
      ctrl.abort();
    }
    setDocumentIsPending(true);

    await api(isSuperuser, loggedUserIdmRole)
      .get(`/api/documents/${docId}/${docVersion}`, { signal })
      .then((res) => {
        setDocumentIsPending(false);
        setRelatedDocument(res.data);
      })
      .catch((error) => {
        setDocumentIsPending(false);
      });
    setIsWorkflowLoading(false);
  };



  useEffect(() => {
    const fetchData = async () => {
      const ctrl = new AbortController();
      const signal = ctrl.signal;

      setIsWorkflowLoading(true);

      try {
        const response = await api(isSuperuser, loggedUserIdmRole).get(
          `/api/workflows/${workflowId}`,
          {
            signal,
          }
        );

        setIsWorkflowLoading(false);
        setWorkflowData(response.data);

        if (response.data.status === "in_approval") {
          setWdBtnDisabled(false);
        }

        const responsesData = response.data.responses;
        const approversData = response.data.approvers;

        setApproverResponses(responsesData);
        setCCs(response.data.cc);
        setApprovers(approversData);

        fetchRelatedDocument(
          response.data.document_unique_id,
          response.data.document_version
        );

        const promises = response.data.marked_documents_for_archival.map(
          (item) =>
            api(isSuperuser, loggedUserIdmRole)
              .get(`/api/documents/${item}/latest`)
              .then((res) => res.data)
        );

        const documentsMarked = await Promise.all(promises);
        setDocumentsMarkedForArchival(documentsMarked);
        const canApproveResponse = await api(isSuperuser, loggedUserIdmRole).get(
          `/api/workflows/${workflowId}/can-approve`,
          {
            signal,
          }
        );
        if (canApproveResponse.data.result === "success") {
          setCanUserApprove(canApproveResponse.data.can_approve);
          setApprovableRoles(canApproveResponse.data.approvable_roles);
        } else {
          setCanUserApprove(false);
          setApprovableRoles([]);
        }
        const canPublishResponse = await api(isSuperuser, loggedUserIdmRole).get(
          `/api/workflows/${workflowId}/can-publish`,
          {
            signal,
          }
        );

        if (canPublishResponse.data.result === "success") {
          setCanUserPublish(canPublishResponse.data.can_publish);
        } else {
          setCanUserPublish(false);
        }
      } catch (error) {
        if (error.response.status === 403) {
          setError({
            status: true,
            content: t("unauthorized_logged_in"),
          });
        } else {
          setError({
            status: true,
            content: `Something went wrong! ${error.response.data.message}`,
          });
        }
        setShowModal((prev) => !prev);
        setIsWorkflowLoading(false);
      }
    };

    fetchData();


    return () => { };
  }, [workflowId]);

  const sendApproverDecision = async (type, approvalRoles) => {
    setIsLoading(true);
    let body = {
      approved: type === "approve",
      comment: comment,
      approval_roles: approvalRoles,
    };

    await api(isSuperuser, loggedUserIdmRole)
      .post(`/api/workflows/${workflowId}/approve`, body)
      .then(() => {
        Refresh();
      })
      .catch((error) => {
        setError({
          status: true,
          content: `${t("something_went_wrong")} ${error.response.data.message
            }`,
        });
      });
    setIsLoading(false);
  };

  function Refresh() {
    window.location.reload(false);
  }

  const sendCreatorDecision = (e) => {
    setIsPublishPending(true);
    if (e === "withdraw") {
      setWdBtnDisabled(true);
      const url = `/api/workflows/${workflowId}/withdraw`;
      api(isSuperuser, loggedUserIdmRole)
        .post(url)
        .then(() => {
          Refresh()
          setError({
            status: false,
            content: "",
          });
          setIsPublishPending(false);
        })
        .catch((error) => {
          setError({
            status: true,
            content: error?.response?.data?.message,
          });
          setIsPublishPending(false);
        });
    } else if (e === "publish") {
      api(isSuperuser, loggedUserIdmRole)
        .post(`/api/workflows/${workflowId}/publish`)
        .then(() => {
          Refresh()
          setIsPublishPending(false)
        })
        .catch((error) => {
          setError({
            status: true,
            content: `${t("something_went_wrong")} ${error.response.data.message
              }`,
          });
          setIsPublishPending(false)
        });
    }
  };

  function CustomLoadingOverlay() {
    return <OverlayActivityIndicator size={"small"} disableBlur={true} />;
  }

  const checkShowPage = (loggedUserId) => {
    return true;
  }


  return (
    <>
      {isWorkflowLoading || relatedDocument?.creator === undefined ? (
        <CustomLoadingOverlay />
      ) : (
        <>
          {checkShowPage(loggedUserId) === true && !error.status ? (
            <>
              <WFStickyHeader
                creator={workflowData?.creator}
                creatorName={workflowData?.creator_name}
                status={workflowData?.status}
                type={workflowData?.workflow_type}
                id={workflowData?.workflow_id}
                startDate={workflowData?.start_date}
                closedDate={
                  workflowData?.closed_date ? workflowData?.closed_date : "-"
                }
              />
              <h3 style={{ marginTop: "2rem" }}>{t("workflow_view")}</h3>

              <Box>
                <h4>{t("selected_document")}</h4>
                <TableContainer component={Paper}>
                  <Table aria-label="collapsible table">
                    <TableHead>
                      <TableRow>
                        <TableCell align="left"></TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          {t("document_name")}
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          {t("document_id")}
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          {t("document_version")}
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          {t("document_type")}
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          {t("document_status")}
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}></TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}></TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <React.Fragment>
                        <DSTableRow
                          isArchive={false}
                          document={relatedDocument}
                          dontShowActions={true}
                        />
                      </React.Fragment>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {documentsMarkedForArchival.length > 0 && (
                <Box>
                  <h4>{t("marked_documents_for_archival")}</h4>
                  <TableContainer component={Paper}>
                    <Table aria-label="collapsible table">
                      <TableHead>
                        <TableRow>
                          <TableCell align="left"></TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            {t("document_name")}
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            {t("document_id")}
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            {t("document_version")}
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            {t("document_type")}
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            {t("document_status")}
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}></TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}></TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {documentsMarkedForArchival.map((d) => (
                          <React.Fragment key={d.id}>
                            <DSTableRow
                              isArchive={false}
                              document={d}
                              dontShowActions={true}
                            />
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
              <Box>
                <h4>{t("change_reason")}</h4>
                <Card sx={{ marginBottom: "1rem", padding: "1rem" }}>
                  <Typography variant="body2" component="div">
                    {workflowData?.change_reason}
                  </Typography>
                </Card>
                <WFApproverTable approvers={approvers} responses={approverResponses} asmRoleIdNames={asmRoleIdNames} documentNames={documentNames} allDepartments={allDepartments} />
                <Grid container paddingTop={1} paddingBottom={2}>
                  {CCs?.length > 0 && (
                    <Grid item xs={12}>
                      <h4 style={{ margin: "0", marginBottom: "1rem" }}>
                        {t("cc_users")}
                      </h4>
                    </Grid>
                  )}
                  {CCs?.map((inner, index) => (
                    <Grid container xs={12} spacing={1} padding={1}>
                      <Grid item xs={5} key={index}>
                        <ListItem>
                          <Grid item xs={12}>
                            <Chip
                              sx={{ height: "41px" }}
                              avatar={
                                inner.name ? (
                                  <AvatarComponent
                                    userid={inner.userid}
                                    name={inner.name}
                                  />
                                ) : (
                                  <Avatar
                                    alt={inner.name}
                                    sx={{ width: 24, height: 24 }}
                                  >
                                    <PersonIcon />
                                  </Avatar>
                                )
                              }
                              label={inner.name}
                            ></Chip>
                          </Grid>
                        </ListItem>
                      </Grid>
                    </Grid>
                  ))}
                </Grid>

                {workflowData?.comment && workflowData?.comment !== "" && (
                  <Box>
                    <h4 style={{ margin: "0", marginBottom: "1rem" }}>
                      {t("workflow_description")}
                    </h4>
                    <Card sx={{ marginBottom: "2rem", padding: "1rem" }}>
                      <Typography variant="body2" component="div">
                        {workflowData?.comment}
                      </Typography>
                    </Card>
                  </Box>
                )}
              </Box>

              {canUserApprove ? (
                <>
                  <WFFormForApprover
                    workflowData={workflowData}
                    buttonsDisabled={false}
                    setComment={setComment}
                    sendApproverDecision={sendApproverDecision}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    comment={comment}
                    approvableRoles={approvableRoles}
                    asmRoleIdNames={asmRoleIdNames}
                    documentNames={documentNames}
                    allDepartments={allDepartments}
                  />
                </>
              ) : null}

              {workflowData?.status === "pending" && (
                <WFFormForPending
                  sendCreatorDecision={sendCreatorDecision}
                  isLoading={isPublishPending}
                  setIsOpen={setIsPendingDialogOpen}
                  isOpen={isPendingDialogOpen}
                  isLoggedUserProxy={false}
                  loggedInUserIsDocumentResponsible={
                    canUserPublish
                  }
                />
              )}
            </>
          ) : (
            <Layout fullWidth={false}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    boxShadow: 5,
                    margin: 5,
                    padding: 2,
                  }}
                >
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      {t("workflow_open_error")}
                    </Grid>
                  </Grid>
                </Box>
              </div>
            </Layout>
          )}
        </>
      )}
      {
        workflowData?.creator === loggedUserId &&
        workflowData?.status === "in_approval" && (
          <WFFormForCreator
            workflowId={workflowData?.id}
            sendCreatorDecision={sendCreatorDecision}
            wdBtnDisabled={wdBtnDisabled}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}
      {error.status && (
        <DSDialog
          open={showModal}
          setOpen={setShowModal}
          type={"error"}
          title={error.status}
          content={error.content}
        >
          <Button variant="outlined" onClick={() => {
             setShowModal(false)
             if(error.content === t("unauthorized_logged_in")){
              navigate("/")
             }
          }}>
            OK
          </Button>
        </DSDialog>
      )}
    </>
  );
}

export default WorkflowView;
