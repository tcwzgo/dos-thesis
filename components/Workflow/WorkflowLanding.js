import api from "../../axios_conf.js";
import React, { useState, useEffect } from "react";
import {
  Box,
  Badge,
  Button,
  Grid,
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CustomLoadingOverlay } from '../utils.js';
import FindInPageIcon from "@mui/icons-material/FindInPage";

function WorkflowLanding() {
  const { t, i18n } = useTranslation();

  const columns = [
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
      editable: false,
    },
    {
      field: "approval_count",
      headerName: t("approval_state"),
      width: 150,
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
      editable: false,
    },
    {
      field: "approval_count",
      headerName: t("approval_state"),
      width: 150,
      editable: false,
    },
    {
      field: "status",
      headerName: t("status"),
      flex: 1,
      editable: false,
    },
  ];

  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [waitingPage, setWaitingPage] = useState(1);
  const [isWaitingListLoading, setIsWaitingListLoading] = useState(true)
  const [isYourListLoading, setIsYourListLoading] = useState(true)
  const [waitingPageSize, setWaitingPageSize] = useState(10);
  const [yourlist, setYourList] = useState([]);
  const [yourlistcount, setYourListCount] = useState(0);
  const [showCC, setShowCC] = useState(false);
  const [waitinglist, setWaitingList] = useState([]);
  const [waitinglistcount, setWaitingListCount] = useState(0);

  useEffect(() => {
    const getData = async () => {
      const yourWorkflowUrl = `/api/workflows/my?limit=${pageSize}&page=${page}`;

      await api()
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
  }, [page, pageSize, i18n.language, t]);

  useEffect(() => {
    const getData = async () => {
      let waitingWorkflowUrl;
      if (showCC === false) {
        waitingWorkflowUrl = `/api/workflows/waiting?limit=${waitingPageSize}&page=${waitingPage}`;
      } else {
        waitingWorkflowUrl = `/api/workflows/ccs?limit=${waitingPageSize}&page=${waitingPage}`;
      }

      await api()
        .get(waitingWorkflowUrl, {})
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

          setWaitingList(data);
          setWaitingListCount(response.data.total);
          setIsWaitingListLoading(false)
        });
    };
    getData();
  }, [waitingPage, waitingPageSize, i18n.language, showCC, t]);

  const renderWaitingList = () => {
    return (
      <Grid item xs={12}>
        <Box sx={{ height: 300, width: "100%" }}>
          <DataGrid
            rows={waitinglist}
            columns={columnsWaiting}
            page={waitingPage - 1}
            pageSize={waitingPageSize}
            rowCount={waitinglistcount}
            getRowId={(row) => row.workflow_id}
            onPageChange={(newPage) => setWaitingPage(newPage + 1)}
            onPageSizeChange={(newPageSize) => setWaitingPageSize(newPageSize)}
            rowsPerPageOptions={[10, 25, 50, 100]}
            paginationMode={"server"}
            pagination
            components={{
              LoadingOverlay: CustomLoadingOverlay,
            }}
            disableSelectionOnClick
            experimentalFeatures={{ newEditingApi: true }}
            disableExtendRowFullWidth
            loading={isWaitingListLoading}
            disableColumnMenu
            getRowHeight={() => "auto"}
          />
        </Box>
      </Grid>
    );
  };
  const renderYourList = () => {
    return (
      <Grid item xs={12}>
        <Box sx={{ height: 300, width: "100%" }}>
          <DataGrid
            rows={yourlist}
            columns={columns}
            page={page - 1}
            pageSize={pageSize}
            rowCount={yourlistcount}
            getRowId={(row) => row.workflow_id}
            onPageChange={(newPage) => setPage(newPage + 1)}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            rowsPerPageOptions={[10, 25, 50, 100]}
            paginationMode={"server"}
            pagination
            components={{
              LoadingOverlay: CustomLoadingOverlay,
            }}
            loading={isYourListLoading}
            disableSelectionOnClick
            experimentalFeatures={{ newEditingApi: true }}
            disableExtendRowFullWidth
            disableColumnMenu
            getRowHeight={() => "auto"}
          />
        </Box>
      </Grid>
    );
  };

  return (
    <Stack flexDirection={"column"} gap={1}>
      <Stack flexDirection={"row"} gap={1.5} sx={{ margin: 2 }}>
        <Button
          variant="contained"
          onClick={() => navigate("/workflow-creation")}
        >
          {t("create_workflow")}{" "}
        </Button>
        <Button
          variant={"outlined"}
          onClick={() => navigate("/workflow-history")}
        >
          {t("search_workflow_history")}
        </Button>
      </Stack>

      <Box
        sx={{
          boxShadow: 5,
          margin: 2,
          padding: 2,
        }}
      >
        <Grid
          container
          direction="row"
          justifyContent="space-between"
          alignItems="baseline"
          spacing={2}
        >
          <Grid item xs={4}>
            <Badge badgeContent={waitinglistcount} color="primary">
              <Button sx={{ color: "black" }} size="medium" color="primary">
                {t("workflows_waiting_for_your_action")}
              </Button>
            </Badge>
          </Grid>
          <Grid item xs={2.5}>
            <Button
              variant="contained"
              onClick={() => setShowCC((current) => !current)}
            >
              {!showCC
                ? t("show_user_in_cc_table")
                : t("show_user_in_approver_table")}
            </Button>
          </Grid>
          {renderWaitingList()}
        </Grid>
      </Box>
      <Box
        sx={{
          boxShadow: 5,
          margin: 2,
          padding: 2,
        }}
      >
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Badge badgeContent={yourlistcount} color="primary">
              <Button sx={{ color: "black" }} size="medium" color="primary">
                {t("your_workflows")}
              </Button>
            </Badge>
          </Grid>

          {renderYourList()}
        </Grid>
      </Box>
    </Stack>
  );
}

export default WorkflowLanding;
