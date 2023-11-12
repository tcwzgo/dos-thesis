import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select as MUISelect,
  Stack,
  TextField as MuiTextField,
  FormControlLabel,
  Switch
} from "@mui/material";
import { useTranslation } from "react-i18next";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import React, { useContext, useState } from "react";
import PropTypes from "prop-types";
import { DocumentBrowserContext } from "./DocumentBrowser";
import DocumentBrowserOptionalFilters from "./DocumentBrowserOptionalFilters";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import moment from "moment/moment";

const DocumentBrowserForm = ({
  isArchive,
  handleSubmit,
  addedRelatedDocs,
  setAddedRelatedDocs,
}) => {
  const { t } = useTranslation();
  const { storageState, dispatch } = useContext(DocumentBrowserContext);
  const [showFilters, setShowFilters] = useState(false);
  const docStatus = [
    {
      value: "draft",
      name: t("draft"),
    },
    {
      value: "in_approval",
      name: t("in_approval"),
    },
    {
      value: "active",
      name: t("active"),
    },
  ];

  const clearSearch = () => {
    dispatch({
      type: "ADD_SEARCH",
      payload: {
        name: "query",
        value: "",
      },
    });
  };
  const handleStatusChange = (e) => {
    dispatch({
      type: "ADD_FILTER",
      payload: {
        name: e.target.name,
        value: [e.target.value],
      },
    });
  };
  const searchWithQuery = (e) => {
    dispatch({
      type: "ADD_SEARCH",
      payload: {
        name: e.target.name,
        value: e.target.value,
      },
    });
  };
  const clearStatus = () => {
    if (!storageState.filter.document_status) {
      return;
    } else {
      dispatch({
        type: "ADD_FILTER",
        payload: {
          name: "document_status",
          value: [],
        },
      });
      dispatch({
        type: "ADD_FILTER",
        payload: {
          name: "date",
          value: null,
        },
      });
    }
  };
  const resetAllFilters = () => {
    setAddedRelatedDocs([]);
    dispatch({
      type: "CLEAR_ALL",
      payload: {
        value: null,
        name: null,
      },
    });
  };
  const handleDateChange = (newVal) => {
    dispatch({
      type: "ADD_FILTER",
      payload: {
        name: "date",
        value: newVal.format("YYYY-MM-DD"),
      },
    });
  };
  const clearDate = () => {
    dispatch({
      type: "ADD_FILTER",
      payload: {
        name: "date",
        value: null,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ marginBottom: "1rem" }}>{t("search_and_filter")}</h3>
      <div className="storage-mandatory-filters">
        <MuiTextField
          clearInput={clearSearch}
          value={storageState.search.query}
          onChange={searchWithQuery}
          label={t("document_search")}
          name={"query"}
          variant="outlined"
        />
        {isArchive ? (
          <div>
            <MobileDatePicker
              value={storageState.filter.date}
              label={t("valid_at")}
              onChange={(newDate) => handleDateChange(newDate)}
              maxDate={moment()}
              minDate={moment("1998-01-01")}
              renderInput={(params) => (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <MuiTextField
                    {...params}
                    helperText={params?.inputProps?.placeholder}
                    fullWidth
                  />
                  <i
                    className="a-icon boschicon-bosch-ic-reset"
                    title={t("reset")}
                    onClick={clearDate}
                  ></i>
                </Stack>
              )}
            />
          </div>
        ) : (
          <div className="status-clear">
            <FormControl sx={{ mr: 2, minWidth: 380 }}>
              <InputLabel id="demo-simple-select-autowidth-label">
                {t("document_status")}
              </InputLabel>
              <MUISelect
                labelId="demo-simple-select-autowidth-label"
                id="demo-simple-select-autowidth"
                value={storageState.filter.document_status[0] || ""}
                onChange={handleStatusChange}
                name="document_status"
                label={t("document_status")}
                MenuProps={{ disableScrollLock: true }}
                autoWidth
              >
                {docStatus.map((d) => {
                  return (
                    <MenuItem sx={{ minWidth: 380 }} value={d.value} key={d.id}>
                      {d.name}
                    </MenuItem>
                  );
                })}
              </MUISelect>
            </FormControl>
            <i
              className="a-icon boschicon-bosch-ic-reset"
              title={t("reset")}
              onClick={clearStatus}
            ></i>
          </div>
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "start",
            justifyContent: "start",
          }}
        >
           <FormControlLabel 
            sx={{ ml: 0 }}
            control={
                <Switch
                  id={"toggle-show-filters"}
                  sx={{ float: "left" }}
                  onChange={() => setShowFilters((prev) => !prev)}
                />
              }
            label={t("show_extra_filters")}
            labelPlacement="start"
          />
        </div>
      </div>

      {showFilters ? (
        <DocumentBrowserOptionalFilters
          isArchive={isArchive}
          addedRelatedDocs={addedRelatedDocs}
          setAddedRelatedDocs={setAddedRelatedDocs}
        />
      ) : null}
      <Stack flexDirection="row" spacing={1} justifyContent="space-between">
        <Button
          sx={{ p: 1.5 }}
          type={"submit"}
          variant="contained"
          startIcon={<SearchIcon />}
        >
          {t("search_documents")}
        </Button>
        <Button
          sx={{ p: 1.5 }}
          type={"button"}
          onClick={resetAllFilters}
          variant="outlined"
          startIcon={<RefreshIcon />}
        >
          {t("reset_all_filters")}
        </Button>
      </Stack>
    </form>
  );
};

DocumentBrowserForm.propTypes = {
  isArchive: PropTypes.bool,
  handleSubmit: PropTypes.func,
  addedRelatedDocs: PropTypes.array,
  setAddedRelatedDocs: PropTypes.func,
};

export default DocumentBrowserForm;
