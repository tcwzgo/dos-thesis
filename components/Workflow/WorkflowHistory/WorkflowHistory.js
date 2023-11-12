import api from "../../../axios_conf.js";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  TableHead,
  TablePagination,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import WorkflowList from "./WorkflowList.js";
import WorkflowForm from "./WorkflowForm.js";
import Spinner from "../../Molecules/Spinner.js";
import Grid from "@mui/material/Grid";

function WorkflowHistory() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchPressed, setIsSearchPressed] = useState(false);
  const [page, setPage] = useState(0);
  const [error, setError] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [isPending, setIsPending] = useState(true);
  const [workflows, setWorkflows] = useState([]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const headers = [
    "workflow_id",
    "document_name",
    "document_id",
    "document_version",
    "workflow_type",
    "workflow_status",
    "workflow_starter",
    "", // workflow view btn
    "", // doc open btn
  ];

  const fetchWorkflows = useCallback(
    (ctrl) => {
      setError(null);
      setIsPending(true);
      setWorkflows([])
      const typeQuery =
        workflowType.length > 0
          ? `&type=${workflowType.map((d) => d.value).join(",")}`
          : "";
      const statusQuery =
        workflowStatus.length > 0
          ? `&status=${workflowStatus.map((d) => d.value).join(",")}`
          : "";
      const usersQuery =
        users.length > 0 ? `&users=${users.map((d) => d.value).join(",")}` : "";
      api()
        .get(
          `/api/workflows/search?limit=${rowsPerPage}&page=${
            page + 1
          }&query=${searchQuery}${typeQuery}${statusQuery}${usersQuery}`,
          { signal: ctrl.signal }
        )
        .then((res) => {
          setTotal(parseInt(res.data.total));
          setWorkflows(res.data.data);
          setIsPending(false);
        })
        .catch((error) => {
          setIsPending(false);
          if (error.message !== "canceled") {
            setError(error);
          }
        });
    },
    [rowsPerPage, page, isSearchPressed]
  );

  useEffect(() => {
    const ctrl = new AbortController();
    fetchWorkflows(ctrl);

    return () => ctrl.abort();
  }, [fetchWorkflows, page, rowsPerPage]);

  const [workflowType, setWorkflowType] = useState([]);
  const [workflowStatus, setWorkflowStatus] = useState([]);
  const [users, setUsers] = useState([]);

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIosNewIcon />}
            onClick={() => navigate(-1)}
          >
            {t("back")}
          </Button>
        </Grid>
        <Grid item xs={12}>
          <WorkflowForm
            fetchWorkflows={fetchWorkflows}
            isPending={isPending}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setIsSearchPressed={setIsSearchPressed}
            workflowStatus={workflowStatus}
            setWorkflowStatus={setWorkflowStatus}
            workflowType={workflowType}
            setWorkflowType={setWorkflowType}
            users={users}
            setUsers={setUsers}
          />
        </Grid>
        <Grid item xs={12}>
          <TableContainer component="paper">
            <Table aria-label="collapsible table" sx={{ marginTop: "2rem" }}>
              <TableHead>
                <TableRow>
                  {headers.map((header, index) => {
                    return (
                      <TableCell key={index} sx={{ fontWeight: "bold" }}>
                        {t(header)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                <WorkflowList workflows={workflows} />
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={12}>
          {isPending ? 
            <Spinner size={"small"}/>
            :
            <>
              {error && (
                <Typography
                  sx={{ fontSize: "18px", opacity: "0.5", p: 5 }}
                  color={"error"}
                  align={"center"}
                >
                  An error has occured: {error?.message} - {" "}
                  {error?.response?.data?.message}
                </Typography>
              )}
              {workflows?.length === 0 && error === null && (
                <Typography
                  sx={{ fontSize: "18px", opacity: "0.5", p: 5 }}
                  align={"center"}
                >
                  {t("cricket_noise")}
                </Typography>
              )}
            </>
          }
        </Grid>
        <Grid item xs={12}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={total}
            labelRowsPerPage={t("rows_per_page")}
            labelDisplayedRows={({ from, to, count }) => {
              return `${from}–${to} / ${count}`;
            }}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Grid>
      </Grid>
    </>
  );
}

export default WorkflowHistory;
