import Tooltip from "@mui/material/Tooltip";
import { Button } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import api from "../../../axios_conf.js";
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "./../../../App.js";
import { hasRole, ROLES, CustomLoadingOverlay } from "../../utils";
import {
  DataGrid,
  huHU,
  enUS,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import { Link } from "react-router-dom";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Initial = ({ stepForward, setSelectedDocument, selectedDocument, setIsArchival }) => {
  const { t, i18n } = useTranslation();
  const isHun = ["hu", "HU", "hu-HU"].includes(i18n.language)
  const columnsDraft = [
    {
      field: t("actions"),
      headerName: "",
      width: 350,
      sortable: false,
      disableColumnMenu: true,

      renderCell: (params) => {
        return (
          <div>
            <Tooltip title={t("open_document")}>
              <Link
                target="_blank"
                to={`/document-view-details/${params.row.id}/${params.row.document_version}`}
              >
                <IconButton color={"primary"}>
                  <FindInPageIcon color={"primary"} />
                </IconButton>
              </Link>
            </Tooltip>
            <Button
              variant="contained"
              onClick={() => {
                setIsArchival(false)
                handleSelect(params.row);
              }}
            >
              {t("select_document")}
            </Button>
          </div>
        );
      },
    },
    { field: "id", headerName: "ID", width: 90, hide: true },

    {
      field: "document_name",
      headerName: t("document_name"),
      flex: 1,
      editable: false,
    },
    {
      field: "document_id",
      headerName: t("document_id"),
      flex: 1,
      editable: false,
    },
    {
      field: "document_version",
      headerName: t("document_version"),
      width: 200,
      editable: false,
    },
  ];
  const columnsArchive = [
    {
      field: t("actions"),
      headerName: "",
      width: 350,
      sortable: false,
      disableColumnMenu: true,

      renderCell: (params2) => {
        return (
          <div>
            <Tooltip title={t("open_document")}>
              <Link
                target="_blank"
                to={`/document-view-details/${params2.row.id}/${params2.row.document_version}`}
              >
                <IconButton color={"primary"}>
                  <FindInPageIcon color={"primary"} />
                </IconButton>
              </Link>
            </Tooltip>
            <Button
              variant="contained"
              onClick={() => {
                setIsArchival(true)
                handleSelect(params2.row);
              }}
            >
              {t("select_document")}
            </Button>
          </div>
        );
      },
    },
    { field: "id", headerName: "ID", width: 90, hide: true },

    {
      field: "document_name",
      headerName: t("document_name"),
      flex: 1,
      editable: false,
    },
    {
      field: "document_id",
      headerName: t("document_id"),
      flex: 1,
      editable: false,
    },
    {
      field: "document_version",
      headerName: t("document_version"),
      width: 200,
      editable: false,
    },
  ];
  const navigate = useNavigate();
  const { loggedUserId, loggedUserIdmRole, isSuperuser } = useContext(UserContext);
  const [draftlist, setDraftList] = useState([]);
  const [draftlistcount, setDraftListCount] = useState(0);
  const [isDraftListLoading, setIsDraftListLoading] = useState(true)
  const [isArchiveListLoading, setIsArchiveListLoading] = useState(true)
  const [archivelist, setArchiveList] = useState([]);
  const [archivelistcount, setArchiveListCount] = useState(0);
  const [language, setLanguage] = useState("enUS");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [page2, setPage2] = useState(1);
  const [pageSize2, setPageSize2] = useState(10);
  const submitInitialForm = (e) => {
    e.preventDefault();
    stepForward();
  };

  function handleSelect(document) {
    setSelectedDocument(document);
  }

  useEffect(() => {
    const getData = async () => {
      const myDocUrl = `/api/workflows/can-create-approval?limit=${pageSize}&page=${page}`;
      
      await api(isSuperuser, loggedUserIdmRole)
        .get(myDocUrl, {}, {})
        .then(function (response) {
          const data = response.data.data
          setDraftList(data);
          setDraftListCount(response.data.total);
          setIsDraftListLoading(false)
        });
    };

    getData();
  }, [page, pageSize, loggedUserId]);

  useEffect(() => {
    if (isHun) {
      setLanguage(huHU.components.MuiDataGrid.defaultProps.localeText);
    } else {
      setLanguage(enUS.components.MuiDataGrid.defaultProps.localeText);
    }
  }, [i18n.language]);

  useEffect(() => {
    const getData = async () => {
      const myDocUrl = `/api/workflows/can-create-archival?limit=${pageSize}&page=${page}`;
      
      await api(isSuperuser, loggedUserIdmRole)
        .get(myDocUrl, {}, {})
        .then(function (response) {
          const data = response.data.data;
          setArchiveList(data);
          setArchiveListCount(response.data.total);
          setIsArchiveListLoading(false)
        });
    };
    getData();
  }, [page2, pageSize2, loggedUserId, page, pageSize]);

  const CustomToolbar = () => {
    return (
      <div>
        {/* Render the columns button */}
        <GridToolbarColumnsButton />

        {/* Render the filter button */}
        <GridToolbarFilterButton />

        {/* Render the density selector */}
        <GridToolbarDensitySelector />

        {/* You can add other custom buttons or components here if needed */}
      </div>
    );
  };

  const renderDraftList = () => {
    return (
      <Box open sx={{ height: 350, width: "100%" }}>
        <DataGrid
          sx={{
            ".highlight": {
              bgcolor: "lightblue",
              "&:hover": {
                bgcolor: "lightgrey",
              },
            },
          }}
          rows={draftlist}
          columns={columnsDraft}
          page={page - 1}
          pageSize={pageSize}
          rowCount={draftlistcount}
          getRowId={(row) => row.id}
          getRowClassName={(params) => {
            return params.row.id === selectedDocument.id ? `highlight` : "";
          }}
          localeText={language}
          components={{
            Toolbar: CustomToolbar, // Use the custom Toolbar component
            LoadingOverlay: CustomLoadingOverlay,
          }}
          componentsProps={{
            toolbar: {
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          paginationMode={"server"}
          pagination
          loading={isDraftListLoading}
          onPageChange={(newPage) => setPage(newPage + 1)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          disableSelectionOnClick
          experimentalFeatures={{ newEditingApi: true }}
          disableExtendRowFullWidth
          disableColumnMenu
          getRowHeight={() => "auto"}
        />
      </Box>
    );
  };
  const renderArchiveList = () => {
    return (
      <Box sx={{ height: 350, width: "100%" }}>
        <DataGrid
          sx={{
            ".highlight": {
              bgcolor: "lightblue",
              "&:hover": {
                bgcolor: "lightgrey",
              },
            },
          }}
          rows={archivelist}
          columns={columnsArchive}
          page={page2 - 1}
          pageSize={pageSize2}
          rowCount={archivelistcount}
          getRowId={(row) => row.id}
          getRowClassName={(rowParameters) => {
            return rowParameters.row.id === selectedDocument.id
              ? `highlight`
              : "";
          }}
          localeText={language}
          components={{
            Toolbar: CustomToolbar, // Use the custom Toolbar component
            LoadingOverlay: CustomLoadingOverlay,
          }}
          componentsProps={{
            toolbar: {
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          paginationMode={"server"}
          pagination
          loading={isArchiveListLoading}
          onPageChange={(newPage) => setPage2(newPage + 1)}
          onPageSizeChange={(newPageSize) => setPageSize2(newPageSize)}
          disableSelectionOnClick
          experimentalFeatures={{ newEditingApi: true }}
          disableExtendRowFullWidth
          disableColumnMenu
          getRowHeight={() => "auto"}
        />
      </Box>
    );
  };
  return (
    <>
      <form onSubmit={submitInitialForm}>
        <Box
          sx={{
            boxShadow: 5,
            margin: 5,
            padding: 2,
          }}
        >
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <h4>{t("your_draft_documents")}</h4>
              {renderDraftList()}
            </Grid>
            {hasRole(loggedUserIdmRole, [
              ROLES.SUPERUSER,
              ROLES.ARCHIVE,
              ROLES.PLANT_DOCUMENT_RESPONSIBLE,
              ROLES.DOCUMENT_RESPONSIBLE,
              ROLES.TWI_COORDINATOR
            ]) && (
                <Grid item xs={12}>
                  <h4>{t("archive_documents")}</h4>
                  {renderArchiveList()}
                </Grid>
              )}
          </Grid>
        </Box>
        <Button
          variant="contained"
          startIcon={<ArrowBackIosNewIcon />}
          onClick={() => navigate("/workflow-management")}
        >
          {t("workflow_management")}
        </Button>
        {selectedDocument.document_id != null && (
          <Button
            type="submit"
            variant="contained"
            sx={{ float: "right" }}
            startIcon={<ArrowForwardIosIcon />}
          >
            {t("next_step")}
          </Button>
        )}
      </form>
    </>
  );
};

export default Initial;
