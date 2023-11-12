import React, { useState, useEffect, useContext, useReducer } from "react";
import api from "../../../axios_conf.js";
import { useNavigate } from "react-router-dom";
import { Alert, Button } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { TableRow, OverlayActivityIndicator } from "@bosch/react-frok";
import Grid from "@mui/material/Grid";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {
  Typography,
  TextField,
  Box,
  Stack,
  TableCell,
  TableHead,
  TableBody,
  TableContainer,
  Paper,
  Table,
} from "@mui/material/";
import Approvers from "./ApproverTable/Approvers.js"
import NewCCRowDialog from "./NewCCRowDialog";
import AvatarComponent from "../../Molecules/AvatarComponent";
import {
  List,
  ListItem,
  ListItemIcon,
  Avatar,
  Chip,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import DeleteIcon from "@mui/icons-material/Delete";
import { UserContext } from "../../../App";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import Switch from "@mui/material/Switch";
import DSTableRow from "../../DocumentBrowser/DSTableRow";
import DSDialog from "../../Molecules/DSDialog.js";
import RelatedDocumentsDialog from "./RelatedDocumentsDialog.js";
import { approverTableReducer } from "./approverTableReducer.js";
import { createContext } from "react";
import { v4 as uuidv4 } from 'uuid';

export const ApproversContext = createContext()

const Second = ({ selectedDocument, isArchival, approverRoles }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loggedUserId, loggedUserIdmRole, isSuperuser } =
    useContext(UserContext);
  const [open, setOpen] = useState(false);
  const [documentsToCheck, setDocumentsToCheck] = useState([]);
  const [isPending, setIsPending] = useState(true);
  const [success, setSuccess] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [pendingState, setPendingState] = useState(true);
  const [isFormalChange, setIsFormalChange] = useState(false);
  const [isApproval, setIsApproval] = useState(false);

  const [CCs, setCCs] = useState([]);
  const [comment, setComment] = useState("");
  const [changeReason, setChangeReason] = useState("");
  const [isRelatedDocsPending, setIsRelatedDocsPending] = useState(false);
  const [docsForArchival, setDocsForArchival] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isRelatedDialogOpen, setIsRelatedDialogOpen] = useState(false);
  const [addedDocsForArchival, setAddedDocsForArchival] = useState([]);
  const [noOptionsMessage, setNoOptionsMessage] = useState(
    t("please_type_more_letters")
  );
  const [documentsForArchivalQuery, setDocumentsForArchivalQuery] =
    useState("");


  const [approverTableState, dispatch] = useReducer(approverTableReducer, approverRoles)
  const contextValue = {
    approverTableState,
    dispatch
  }

  const isChangeReasonMissing = changeReason.length === 0
  const approversMissing = approverTableState?.some((level) => level?.approverRoles?.some((approverRole) => approverRole?.user === null))

  useEffect(() => {
    if (selectedDocument?.document_type === "TWI" || !isApproval) {
      setPendingState(false);
    }else{
      setPendingState(true);
    }
  }, [isApproval])

  useEffect(() => {


    setIsPending(true);
    if (selectedDocument.allowed_editors) {
      const temp = [...CCs];
      // add allowed editors array to CCs
      selectedDocument.allowed_editors.forEach((element) => {
        if (
          !(
            element.userid === loggedUserId ||
            CCs.filter((e) => e.userid === element.userid).length > 0
          )
        ) {
          temp.push(element);
        }
      });
      setCCs([...temp]);
    }
    if (
      selectedDocument?.document_version !== undefined &&
      selectedDocument?.document_version !== null &&
      selectedDocument?.document_version !== ""
    ) {
      setIsFormalChange(
        parseInt(selectedDocument?.document_version.split(".")[1]) !== 0
      );
    }
    if (
      selectedDocument?.document_type !== undefined &&
      selectedDocument?.document_type !== null &&
      selectedDocument?.document_type !== ""
    ) {
      setIsApproval(selectedDocument?.document_status !== "active");
    }
    setIsPending(false);
  }, []);

  const createWorkflow = async () => {
    setIsLoading(true);
    const approvers = approverTableState.map((level) => {
      const approverRoles = level.approverRoles.map((approverRole) => {
        return {
          ...approverRole,
          role: approverRole.role.id,
        }
      })
      return {
        ...level,
        approverRoles: approverRoles
      }
    })
    const merged = {
      approvers: approvers,
      cc: CCs,
      comment: comment,
      document_unique_id: selectedDocument?.id,
      document_version: selectedDocument?.document_version,
      change_reason: changeReason,
      marked_documents_for_archival: addedDocsForArchival.map((e) => e.value),
      pending_state: pendingState,
    };

    try {
      await api(isSuperuser, loggedUserIdmRole).post(
        "/api/workflows/create",
        merged
      );
      setFetchError(null);
      setShowError(false);
      setIsRelatedDialogOpen(false);
      setSuccess(true);
    } catch (error) {
      setShowError(true);
      setSuccess(false);
      if (
        error?.response?.data?.message.includes(
          "Workflow cannot be created, because there is already one in progress"
        )
      ) {
        setFetchError(t("workflow_already_in_progress"));
      } else {
        setFetchError(error);
      }
      setIsRelatedDialogOpen(false);
    }
    setIsLoading(false);
  };

  const addCCUser = (newUser) => {
    if (CCs.filter((e) => e.name === newUser.name).length > 0) {
    } else {
      const temp = [...CCs];
      temp.push(newUser);
      setCCs([...temp]);
    }
  };

  const fieldStyles = {
    menu: (base) => ({
      ...base,
      zIndex: 9999999,
    }),
    control: (base) => ({
      ...base,
      marginRight: "5px",
      minHeight: "3rem",
    }),
  };

  useEffect(() => {
    setIsPending(true);
    const controller = new AbortController();
    if (documentsForArchivalQuery === "") {
      setIsRelatedDocsPending(false);
    } else {
      const body = {
        group_by_version: true,
        search: {
          query: documentsForArchivalQuery,
          find_in_document_body: false,
        },
        filter: {
          document_status: ["active"],
        },
      };

      setIsRelatedDocsPending(true);

      api(isSuperuser, loggedUserIdmRole)
        .post(`/api/documents/search?limit=100&page=1`, body, {
          signal: controller.signal,
        })
        .then((res) => {
          const temp = [];
          for (const doc of res.data.data) {
            temp.push({
              value: doc.id,
              label: doc.document_id + " - " + doc.document_name,
              document_name: doc.document_name,
              creator: doc.document_versions[0].creator,
              creator_name: doc.document_versions[0].creator_name,
            });
          }
          setDocsForArchival(temp.filter((e) => e.value !== selectedDocument.id));
          setIsRelatedDocsPending(false);
        })
        .catch((err) => {
          setIsRelatedDocsPending(false);
        });
    }
    setIsPending(false);
  }, [documentsForArchivalQuery]);

  const handleDocumentArchivalChange = async (docs) => {
    await setAddedDocsForArchival(docs);
  };

  const searchActiveDocument = (value) => {
    if (value.length < 3) {
      setNoOptionsMessage(t("please_type_more_letters"));
      return;
    } else {
      setNoOptionsMessage(t("no_result"));
    }
    setDocumentsForArchivalQuery(value);
  };

  const handleChangeReasonChange = (event) => {
    setChangeReason(event.target.value);
  };

  const onChangeComment = (event) => {
    setComment(event.target.value);
  };

  const openCCDialog = () => {
    setOpen((prev) => !prev);
  };
  const deleteCCRow = (elementIndex) => {
    const temp = [...CCs];
    temp.splice(elementIndex, 1);
    setCCs([...temp]);
  };
  const returnHome = () => {
    navigate("/");
  };
  const goWorkflowUrl = async () => {
    setIsLoading(true);
    const yourWorkflowUrl = `/api/workflows/my?limit=1&page=1`;

    await api(isSuperuser, loggedUserIdmRole)
      .get(yourWorkflowUrl, {})
      .then(function (response) {
        const data = response.data.data;
        navigate(`/workflow-view/${data[0].workflow_id}`);
      });
    setIsLoading(false);
  };

  useEffect(() => {
    if (isArchival) {
      dispatch({
        type: "ADD_CREATOR", payload: {
          creator: {
            name: selectedDocument?.creator_name,
            userid: selectedDocument?.creator
          },
          role: {
            name: `Dokumentum készítő - ${selectedDocument?.document_id}`,
            id: `creator:${selectedDocument?.id}:${selectedDocument?.document_version}`
          },
          uuid: uuidv4()
        }
      })
    }
  }, [isArchival]);

  function CustomLoadingOverlay() {
    return <OverlayActivityIndicator size={"small"} disableBlur={true} />;
  }

  const CClist = (CCs) => {
    return (
      <List sx={{ width: "100%" }} dense={true}>
        <Grid container p={1} spacing={1} xs={8}>
          <React.Fragment>
            {CCs?.map((inner, index) => {
              return (
                <Grid item xs={8}>
                  <ListItem>
                    <Grid item xs>
                      <ListItemIcon>
                        {inner.userid ? (
                          <>
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
                              label={
                                <Stack direction={"row"} sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center"
                                }}>
                                  <Typography>{inner.name}</Typography>
                                  <IconButton
                                    onClick={() => deleteCCRow(index)}
                                    aria-label="delete"
                                    color="error"
                                  >
                                    <DeleteIcon fontSize="inherit" />
                                  </IconButton>
                                </Stack>
                              }
                            ></Chip>
                          </>
                        ) : (
                          <></>
                        )}
                      </ListItemIcon>
                    </Grid>
                  </ListItem>
                </Grid>
              );
            })}
          </React.Fragment>
        </Grid>
      </List>
    );
  };

  return (
    <React.Fragment>
      {isPending === false ? (
        <>
          <div>
            <Box
              sx={{
                boxShadow: 5,
                marginTop: "1rem",
                padding: 2,
              }}
            >
              <NewCCRowDialog
                open={open}
                handleClose={() => setOpen(false)}
                handleAddUser={addCCUser}
                CCusers={CCs}
              />

              <Grid container spacing={1} sx={{ marginY: 1, padding: 1 }}>
                <Grid item xs={12}>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold", marginBottom: "2rem" }}
                  >
                    {t("manage_users")}
                  </Typography>
                  <Alert severity="info" fontSize={12}>
                    {t("manage_users_alert")}
                  </Alert>
                </Grid>

                {/* Approver table notes: the add user is not yet functional */}
                <Grid item xs={12}>
                  <Box>
                    <ApproversContext.Provider value={contextValue}>
                      <Approvers />
                    </ApproversContext.Provider>
                  </Box>
                </Grid>
                <Grid
                  container
                  p={0}
                  spacing={2}
                  alignItems="stretch"
                  justifyContent="center"
                >
                  <Grid item xs={11}>
                    <Button
                      variant="contained"
                      onClick={() => openCCDialog()}
                    // onClick={() => openModal()}
                    >
                      {t("add_cc_user")}
                    </Button>

                    {CClist(CCs)}
                  </Grid>
                </Grid>
                <Stack direction="column" sx={{ width: "100%", mt: 2 }}>
                  <Box sx={{ margin: "1rem", p: 1 }}>
                    <Typography variant="h6">{t("change_reason")}</Typography>
                    <TextField
                      multiline
                      onChange={handleChangeReasonChange}
                      label={t("change_reason")}
                      rows={1}
                      sx={{ width: "100%", mt: 1, mb: 3, height: "2rem" }}
                      required
                    />
                  </Box>
                  {((!isFormalChange && isApproval) || !isApproval) && (
                    <Box sx={{ margin: "1rem", p: 1 }}>
                      <Typography variant="h6" sx={{ marginBottom: "1rem" }}>
                        {t("mark_documents_for_archival")}
                      </Typography>
                      <Grid container alignItems={"center"}>
                        <Grid item xs={6}>
                          <Select
                            onChange={handleDocumentArchivalChange}
                            onInputChange={searchActiveDocument}
                            name={"document_archival"}
                            label={t("related_documents")}
                            isMulti
                            isLoading={isRelatedDocsPending}
                            placeholder={t("mark_documents_for_archival")}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            options={docsForArchival}
                            value={addedDocsForArchival}
                            noOptionsMessage={() => noOptionsMessage}
                            styles={fieldStyles}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={6}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Alert
                            variant="outlined"
                            severity="info"
                            sx={{ fontSize: "11px" }}
                          >
                            {t("docs_for_archival_alert")}
                          </Alert>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                  <Box sx={{ margin: "1rem", p: 1 }}>
                    <Grid container spacing={1} alignItems={"center"}>
                      <Grid item xs={6} md={4} lg={3}>
                        <Typography variant="h6">
                          {t("pending_state_label")}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={1} lg={1}>
                        <Switch
                          checked={!pendingState}
                          disabled={selectedDocument?.document_type === "TWI" || !isApproval}
                          onChange={(e) => setPendingState(!e.target.checked)}
                        />{" "}
                        {/*peding state is the opposite of automatical activation*/}
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        md={7}
                        lg={8}
                        sx={{
                          paddingX: "3rem",
                        }}
                      >
                        <Alert
                          variant="outlined"
                          severity="info"
                          sx={{ fontSize: "11px" }}
                        >
                          {t("pending_state_alert")}
                        </Alert>
                      </Grid>
                    </Grid>
                  </Box>
                  <Box sx={{ margin: "1rem", p: 1 }}>
                    <Typography variant="h6">
                      {t("workflow_description")}
                    </Typography>
                    <TextField
                      multiline
                      onChange={onChangeComment}
                      label={t("workflow_description")}
                      rows={7}
                      sx={{ width: "100%", mt: 1, mb: 3, height: "10rem" }}
                    />
                  </Box>
                  <Box sx={{ margin: "1rem" }}>
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
                              document={selectedDocument}
                              dontShowActions={true}
                            />
                          </React.Fragment>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Stack>
              </Grid>
            </Box>
          </div>
          <div>
            <Stack flexDirection={"column"} gap={1} sx={{ marginTop: "2rem", marginBottom: "2rem" }}>
              {approversMissing ?
                <Alert severity="error">{t("mandatory_approvers_missing")}</Alert>
                :
                null
              }
              {isChangeReasonMissing ?
                <Alert severity="error">{t("change_reason_missing_alert")}</Alert>
                :
                null
              }
            </Stack>
          </div>
          <Button
            disabled={approversMissing || isChangeReasonMissing}
            type="button"
            variant="contained"
            sx={{ float: "right" }}
            onClick={() => {
              setDocumentsToCheck(addedDocsForArchival);
              setIsRelatedDialogOpen(true);
            }}
            startIcon={<ArrowForwardIosIcon />}
          >
            {t("create_workflow")}
          </Button>

          <RelatedDocumentsDialog
            isCreateWorkflowPending={isLoading}
            createWorkflow={createWorkflow}
            documents={documentsToCheck}
            open={isRelatedDialogOpen}
            setOpen={setIsRelatedDialogOpen}
          />
          <DSDialog
            open={success}
            setOpen={setSuccess}
            type={"success"}
            title={t("great")}
            content={t("workflow_created_successfully")}
          >
            <Button variant="outlined" onClick={() => goWorkflowUrl()}>
              {t("open_created_workflow_page")}
            </Button>
            <Button variant="outlined" onClick={() => returnHome()}>
              OK
            </Button>
          </DSDialog>

          <DSDialog
            open={showError}
            setOpen={setShowError}
            type={"error"}
            title={t("could_not_create_workflow")}
            content={`${fetchError}`}
          >
            <Button variant="outlined" onClick={() => setShowError(false)}>
              {t("return_to_editor")}
            </Button>
          </DSDialog>
        </>
      ) : (
        <CustomLoadingOverlay />
      )}
    </React.Fragment>
  );
};

export default Second;
