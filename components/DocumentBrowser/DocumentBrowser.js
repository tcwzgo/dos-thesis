import React, {
  useEffect,
  useReducer,
  useState,
  createContext,
  useContext,
} from "react";
import Spinner from "../Molecules/Spinner";
import { Box } from "@mui/material";
import DocumentList from "./DocumentList";
import {
  documentBrowserReducer,
  INITIAL_STATE,
} from "./documentBrowserReducer";
import api from "../../axios_conf.js";
import DocumentBrowserForm from "./DocumentBrowserForm";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../App";

export const DocumentBrowserContext = createContext();
export const fieldStyles = {
  control: (base, state) => ({
    ...base,
    marginRight: "5px",
    marginBottom: "5px",
    minHeight: "4rem",
  }),
};

const DocumentBrowser = ({ isArchive = false }) => {
  const { t } = useTranslation();
  /*const [bodySearch, setBodySearch] = useState(false);*/
  const [isPending, setIsPending] = useState(false);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const { loggedUserIdmRole, isSuperuser } = useContext(UserContext);
  const [storageState, dispatch] = useReducer(
    documentBrowserReducer,
    INITIAL_STATE
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [addedRelatedDocs, setAddedRelatedDocs] = useState([]);

  const submitStorageForm = (e = undefined) => {
    if (e){
      e.preventDefault();
      if (page > 0){
        setPage(0);
        return;
      }
    }
    setIsPending(true);
    const body = JSON.parse(JSON.stringify(storageState));

    for (const key of Object.keys(body["filter"])) {
      if (key === "related_documents") continue;
      if (key === "date") continue;
      if (key === "expiration_start" || key === "expiration_end") continue;
      else if (key === "training_method" || key === "creator") {
        body["filter"][key] = body["filter"][key].map(
          (element) => element.value
        );
      } else if (key === "document_status") {
        if (body["filter"][key].length === 0) {
          body["filter"][key] = ["active", "in_approval", "draft", "cancelled"];
        }
      } else if (
        key === "departments" ||
        key === "publisher_department" ||
        key === "areas" ||
        key === "product_family" ||
        key === "locations" ||
        key === "affected_roles"
      ) {
        body["filter"][key] = body["filter"][key].map(
          (element) => element.value
        );
      } else {
        body["filter"][key] = body["filter"][key].map(
          (element) => element.label
        );
      }
    }

    if (isArchive) {
      body.filter.document_status = ["archive"];
    }

    setFilteredDocuments([]);
    setIsPending(true);
    api(isSuperuser, loggedUserIdmRole)
      .post(`/api/documents/search?limit=${rowsPerPage}&page=${page + 1}`, {
        ...body,
      })
      .then((res) => {
        setTotal(res.data.total);
        const documentsToArray = [...res.data.data];
        setFilteredDocuments(documentsToArray);
        setIsPending(false);
      })
      .catch((err) => {
        console.error(err);
        setIsPending(false);
      });
  };

  useEffect(() => {
    setFilteredDocuments([]);
  }, [isArchive]);

  useEffect(() => {
    submitStorageForm();
  }, [page, rowsPerPage]);

  return (
    <DocumentBrowserContext.Provider value={{ storageState, dispatch }}>
      <Box
        sx={{
          boxShadow: 5,
          marginTop: 5,
          marginBottom: 5,
          padding: 4,
        }}
      >
        <DocumentBrowserForm
          isArchive={isArchive}
          handleSubmit={submitStorageForm}
          addedRelatedDocs={addedRelatedDocs}
          setAddedRelatedDocs={setAddedRelatedDocs}
        />
      </Box>
      <h3 style={{ marginTop: "3rem" }}>{t("filtered_documents")}</h3>
      {isPending ? (
        <Spinner size={"medium"} />
      ) : (
        <>
          <DocumentList
            documents={[...filteredDocuments]}
            isArchive={isArchive}
            page={page}
            setPage={setPage}
            total={total}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
          />
        </>
      )}
    </DocumentBrowserContext.Provider>
  );
};

DocumentBrowser.propTypes = {
  isArchive: PropTypes.bool,
};

export default DocumentBrowser;
