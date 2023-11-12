import api from "../axios_conf.js";
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@bosch/react-frok";
import { Tooltip, Badge, Box, Grid, IconButton } from "@mui/material";
import RuleIcon from "@mui/icons-material/Rule";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import { Button as MuiButton } from "@mui/material";
import { UserContext } from "./../App.js";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import axios from "axios";
import "./Home.scss";

import { useTranslation } from "react-i18next";
import { hasRole, ROLES, CustomLoadingOverlay } from "./utils";

function Home() {
  const [showwaiting, setShowWaiting] = useState(false);
  const [isWaitingListLoading, setIsWaitingListLoading] = useState(true)
  const [isYourListLoading, setIsYourListLoading] = useState(true)
  const [isDraftListLoading, setIsDraftListLoading] = useState(true)
  const [showyour, setShowYour] = useState(false);
  const [showdraft, setShowDraft] = useState(true);
  const [showCC, setShowCC] = useState(false);
  const [draftlist, setDraftList] = useState([]);
  const [draftlistcount, setDraftListCount] = useState(0);
  const [yourlist, setYourList] = useState([]);
  const [yourlistcount, setYourListCount] = useState(0);
  const [waitinglist, setWaitingList] = useState([]);
  const [waitinglistcount, setWaitingListCount] = useState(0);
  const [waitingPage, setWaitingPage] = useState(1);
  const [waitingPageSize, setWaitingPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [draftPage, setDraftPage] = useState(1);
  const [draftPageSize, setDraftPageSize] = useState(10);
  const { loggedUserId, loggedUserIdmRole, isSuperuser, loggedUserName } =
    useContext(UserContext);
  const indexOfOpeningBrace = loggedUserName.indexOf('(')
  const departmentOfUser = loggedUserName.slice(indexOfOpeningBrace + 1, -1).split(' ')[0]
  const navigate = useNavigate();

  const { t, i18n } = useTranslation();

  const getPublisherDepartmentName = async (id) => {
    try {
      const response = await axios.get(`https://locationstore-htvp.emea.bosch.com/api/departments?id=${id}`);
      return response.data[0].label
    } catch (error) {
      console.error("An error occurred:", error)
      return null
    }
  }

  const columnsDraft = [
    {
      field: "actions",
      headerName: "",
      width: 150,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const hasRolesForEdit = hasRole(loggedUserIdmRole, [
          ROLES.SUPERUSER,
          ROLES.EDITOR,
          ROLES.PLANT_DOCUMENT_RESPONSIBLE,
          ROLES.QTEAMER,
          ROLES.TWI_COORDINATOR,
          ROLES.DEPARTMENT_LEADER,
          ROLES.TEF6,
          ROLES.HSE,
          ROLES.GROUP_LEADER,
          ROLES.PRODUCT_PLANNER,
          ROLES.DOCUMENT_RESPONSIBLE,
        ])
        return (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "start",
              alignItems: "center",
            }}
          >
            <Tooltip title={t("open_document")}>
              <Link
                target="_blank"
                to={`/document-view-details/${params.row.unique_id}/${params.row.document_version}`}
              >
                <IconButton color={"primary"}>
                  <FindInPageIcon color={"primary"} />
                </IconButton>
              </Link>
            </Tooltip>
            {hasRolesForEdit ? (
              <Tooltip title={t("modify_document")}>
                <IconButton
                  color="primary"
                  onClick={() => {
                    const doc = { ...params.row };
                    const id = doc.unique_id;
                    delete doc.unique_id;
                    navigate("/document-uploader", {
                      state: {
                        document: { ...doc, id: id },
                        isEditing: true,
                        isMigrating: params.row.migrated,
                        isActive: params.row.document_status === "active",
                      },
                    });
                  }}
                  aria-label="Edit document"
                  >
                  <BorderColorIcon />
                </IconButton>
              </Tooltip>
            ) :
              null
            }
            {params.row.isSameDepartment ? 
              <Tooltip title={t("create_workflow")}>
                <IconButton
                  color={"primary"}
                  onClick={() =>
                    navigate("/workflow-creation", {
                      state: { step: 2, document: { ...params.row } },
                    })
                  }
                >
                  <RuleIcon variant="contained" color={"primary"} />
                </IconButton>
              </Tooltip>
              :
              null
            }
          </Box>
        );
      },
    },

    { field: "id", headerName: "ID", width: 90, hide: true },
    {
      field: "document_name",
      headerName: t("document_name"),
      flex: 1,
      renderCell: (params) => (
        <div style={{ whiteSpace: "pre-wrap" }}>{params.value}</div>
      ),
      editable: false,
    },
    {
      field: "document_id",
      headerName: t("document_id"),
      flex: 1,
      renderCell: (params) => (
        <div style={{ whiteSpace: "pre-wrap" }}>{params.value}</div>
      ),
      editable: false,
    },
    {
      field: "document_version",
      headerName: t("document_version"),
      flex: 1,
      editable: false,
    },
  ];

  const yourColumns = [
    {
      field: "actions",
      headerName: "",
      width: 30,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Tooltip title={t("open_workflow")}>
              <Link to={`/workflow-view/${params.id}`}>
                <IconButton color={"primary"}>
                  <FindInPageIcon color={"primary"} />
                </IconButton>
              </Link>
            </Tooltip>
          </Box>
        );
      },
    },
    {
      field: "workflow_id",
      headerName: t("workflow_id"),
      flex: 1,
      renderCell: (params) => (
        <div style={{ whiteSpace: "pre-wrap" }}>{params.value}</div>
      ),
      editable: false,
    },
    {
      field: "document_id",
      headerName: t("document_id"),
      flex: 1,
      renderCell: (params) => (
        <div style={{ whiteSpace: "pre-wrap" }}>{params.value}</div>
      ),
      editable: false,
    },
    {
      field: "start_date",
      headerName: t("started_at"),
      flex: 1,
      renderCell: (params) => (
        <div style={{ whiteSpace: "pre-wrap" }}>{params.value}</div>
      ),
      editable: false,
    },
    {
      field: "approval_count",
      headerName: t("approval_state"),
      flex: 1,
      editable: false,
    },
    {
      field: "status",
      headerName: t("status"),
      flex: 1,
      editable: false,
    },
  ];
  const columnsWaiting = [
    {
      field: "actions",
      headerName: "",
      width: 30,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Tooltip title={t("open_workflow")}>
              <Link to={`/workflow-view/${params.id}`}>
                <IconButton color={"primary"}>
                  <FindInPageIcon color={"primary"} />
                </IconButton>
              </Link>
            </Tooltip>
          </Box>
        );
      },
    },
    {
      field: "workflow_id",
      headerName: t("workflow_id"),
      flex: 1,
      renderCell: (params) => (
        <div style={{ whiteSpace: "pre-wrap" }}>{params.value}</div>
      ),
      editable: false,
    },
    {
      field: "document_id",
      headerName: t("document_id"),
      flex: 1,
      renderCell: (params) => (
        <div style={{ whiteSpace: "pre-wrap" }}>{params.value}</div>
      ),
      editable: false,
    },
    {
      field: "start_date",
      headerName: t("started_at"),
      flex: 1,
      renderCell: (params) => (
        <div style={{ whiteSpace: "pre-wrap" }}>{params.value}</div>
      ),
      editable: false,
    },
    {
      field: "approval_count",
      headerName: t("approval_state"),
      flex: 1,
      editable: false,
    },
    {
      field: "status",
      headerName: t("status"),
      flex: 1,
      editable: false,
    },
  ];

  

  const renderWaitingList = () => {
    if (showwaiting) {
      return (
        <Grid container>
          <Grid item xs={12}>
            <Box open={!!showwaiting} sx={{ height: 300, width: "100%" }}>
              <DataGrid
                rows={waitinglist}
                columns={columnsWaiting}
                page={waitingPage - 1}
                pageSize={waitingPageSize}
                getRowId={(row) => row.workflow_id}
                onPageChange={(newPage) => setWaitingPage(newPage + 1)}
                onPageSizeChange={(newPageSize) =>
                  setWaitingPageSize(newPageSize)
                }
                components={{
                  LoadingOverlay: CustomLoadingOverlay,
                }}
                paginationMode={"server"}
                pagination
                loading={isWaitingListLoading}
                disableSelectionOnClick
                experimentalFeatures={{ newEditingApi: true }}
                getRowHeight={() => "auto"}
              />
            </Box>
          </Grid>
        </Grid>
      );
    }
  };
  useEffect(() => {
    const getData = async () => {
      const yourWorkflowUrl = `/api/workflows/my?limit=${pageSize}&page=${page}`;

      await api(isSuperuser, loggedUserIdmRole)
        .get(yourWorkflowUrl, {})
        .then(function (response) {
          const data = response.data.data.map((e) => {
            return {
              workflow_id: e.workflow_id,
              document_id: e.document_id,
              start_date: e.start_date,
              approval_count: e.approval_count,
              status: t(e.status),
            };
          });

          setYourList(data);
          setYourListCount(response.data.total);
          setIsYourListLoading(false)
        });
    };
    getData();
  }, [page, pageSize, i18n.language]);
  useEffect(() => {
    const getData = async () => {
      let waitingWorkflowUrl;
      if (showCC === false) {
        waitingWorkflowUrl = `/api/workflows/waiting?limit=${waitingPageSize}&page=${waitingPage}`;
      } else {
        waitingWorkflowUrl = `/api/workflows/ccs?limit=${waitingPageSize}&page=${waitingPage}`;
      }

      await api(isSuperuser, loggedUserIdmRole)
        .get(waitingWorkflowUrl, {})
        .then(function (response) {
          const data = response.data.data.map((e) => {
            return {
              workflow_id: e.workflow_id,
              start_date: e.start_date,
              document_id: e.document_id,
              approval_count: e.approval_count,
              status: t(e.status),
            };

          });
          
          setWaitingList(data);
          setWaitingListCount(response.data.total);
          setIsWaitingListLoading(false)
        });
    };
    getData();
  }, [waitingPage, waitingPageSize, i18n.language, showCC]);

  useEffect(() => {

    const getData = async () => {
      const url = `/api/documents/search?limit=${draftPageSize}&page=${draftPage}`;
      const body = {
        filter: {
          creator: [`${loggedUserId}`],
          document_status: ["draft"],
        },
      };
      await api(isSuperuser, loggedUserIdmRole)
      .post(url, body, {})
      .then(async function (response) {
        const data = await Promise.all(
          response.data.data.map(async (e) => {
            const res = await getPublisherDepartmentName(e?.publisher_department);
            const isSameDepartment = departmentOfUser?.toLowerCase().includes(res?.toLowerCase());
            return {
              ...e,
              unique_id: e.id,
              isSameDepartment: isSameDepartment,
            };
          })
        );

        setDraftList(data);
        setDraftListCount(response.data.total);
        setIsDraftListLoading(false);
      });
    };
    getData();
  }, [draftPage, draftPageSize]);

  const renderYourList = () => {
    if (showyour) {
      return (
        <Grid container>
          <Grid item xs={12}>
            <Box open={!!showyour} sx={{ height: 300, width: "100%" }}>
              <DataGrid
                className="custom-row-height"
                rows={yourlist}
                columns={yourColumns}
                page={page - 1}
                pageSize={pageSize}
                getRowId={(row) => row.workflow_id}
                rowCount={yourlistcount}
                onPageChange={(newPage) => setPage(newPage + 1)}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                paginationMode={"server"}
                pagination
                components={{
                  LoadingOverlay: CustomLoadingOverlay,
                }}
                loading={isYourListLoading}
                disableSelectionOnClick
                getRowHeight={() => "auto"}
              />
            </Box>
          </Grid>
        </Grid>
      );
    }
  };
  const renderDraftList = () => {
    if (showdraft) {
      return (
        <Grid container>
          <Grid item xs={12}>
            <Box open={!!showdraft} sx={{ height: 300, width: "100%" }}>
              <DataGrid
                rows={draftlist}
                columns={columnsDraft}
                page={draftPage - 1}
                pageSize={draftPageSize}
                rowCount={draftlistcount}
                onPageChange={(newDraftPage) =>
                  setDraftPage(newDraftPage + 1)
                }
                onPageSizeChange={(newDraftPageSize) =>
                  setDraftPageSize(newDraftPageSize)
                }
                components={{
                  LoadingOverlay: CustomLoadingOverlay,
                }}
                rowsPerPageOptions={[10, 25, 50, 100]}
                getRowId={(row) => {
                  return row?.unique_id
                }}
                paginationMode={"server"}
                pagination
                disableSelectionOnClick
                loading={isDraftListLoading}
                experimentalFeatures={{ newEditingApi: true }}
                getRowHeight={() => "auto"}
              />
            </Box>
          </Grid>
        </Grid>
      );
    }
  };

  return (
    <div>
      <Box
        data-cy="waiting-data"
        sx={{
          boxShadow: 5,
          margin: 5,
          padding: 2,
          flexGrow: 1,
        }}
      >
        <Grid
          container
          direction="row"
          justifyContent="space-between"
          alignItems="baseline"
        >
          <Grid item xs={4}>
            <Badge badgeContent={waitinglistcount} color="primary">
              <Button
                className="a-button a-button--integrated -without-icon"
                onClick={() => setShowWaiting((current) => !current)}
                icon={!showwaiting ? "down-small" : "up-small"}
                label={t("workflows_waiting_for_your_action")}
                data-i18n="workflows_waiting_for_your_action"
              ></Button>
            </Badge>
          </Grid>
          <Grid item xs={2.5}>
            <MuiButton
              variant="contained"
              onClick={() => setShowCC((current) => !current)}
            >
              {!showCC
                ? t("show_user_in_cc_table")
                : t("show_user_in_approver_table")}
            </MuiButton>
          </Grid>
          {renderWaitingList()}
        </Grid>
      </Box>

      <Box
        sx={{
          boxShadow: 5,
          margin: 5,
          padding: 2,
          flexGrow: 1,
        }}
      >
        <Grid
          container
          direction="row"
          justifyContent="space-between"
          alignItems="baseline"
        >
          <Grid item xs={12}>
            <Badge badgeContent={yourlistcount} color="primary">
              <Button
                className="a-button a-button--integrated -without-icon"
                onClick={() => setShowYour((current) => !current)}
                icon={!showyour ? "down-small" : "up-small"}
                label={t("your_workflows")}
              ></Button>
            </Badge>
          </Grid>
          {renderYourList()}
        </Grid>
      </Box>
      <Box
        sx={{
          boxShadow: 5,
          margin: 5,
          padding: 2,
          flexGrow: 1,
        }}
      >
        <Grid
          container
          direction="row"
          justifyContent="space-between"
          alignItems="baseline"
        >
          <Grid item xs={12}>
            <Button
              className="a-button a-button--integrated -without-icon"
              onClick={() => setShowDraft((current) => !current)}
              icon={!showdraft ? "down-small" : "up-small"}
              label={t("your_draft_documents")}
            ></Button>
          </Grid>

          {renderDraftList()}
        </Grid>
      </Box>
    </div>
  );
}

export default Home;
