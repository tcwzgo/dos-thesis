import React, { useState, useContext } from "react";
import {
  TableCell,
  TableRow,
  Collapse,
  IconButton,
  Chip,
  Tooltip,
  Container
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import RuleIcon from '@mui/icons-material/Rule';
import { Link, useNavigate } from "react-router-dom";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import { UserContext } from "../../App";
import { hasRole, ROLES } from "../utils";
import { useTranslation } from "react-i18next";
import PropTypes from 'prop-types';
import FindInPageIcon from "@mui/icons-material/FindInPage";
import ActiveEditModal from "./ActiveEditModal";
import DocumentDetailsBlock from "../Molecules/DocumentDetailsBlock";

const DSTableRow = ({ isArchive = false, document, dontShowActions = false }) => {
  const { t } = useTranslation();
  const [isRowOpen, setIsRowOpen] = useState(false);
  const [isActiveEditModalOpen, setIsActiveEditModalOpen] = useState(false)
  const { loggedUserIdmRole } = useContext(UserContext);
  const navigate = useNavigate();

  const statusColors = {
    archive: "warning",
    active: "success",
    in_approval: "primary",
    draft: "default",
    cancelled: "warning"
  }

  const handleEditClick = (status) => {
    if (status === "active") {
      setIsActiveEditModalOpen(true)
    }
    else {
      navigate("/document-uploader", {
        state: {
          document: document,
          isEditing: true,
          isMigrating: document.migrated,
          isActive: false,
        },
      })
    }
  }

  return (
    <React.Fragment>
      <ActiveEditModal isOpen={isActiveEditModalOpen} setIsOpen={setIsActiveEditModalOpen} document={document} />
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell sx={{ minWidth: "50px" }}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setIsRowOpen(!isRowOpen)}
          >
            {isRowOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ minWidth: "130px" }}>
          {document.document_name}
        </TableCell>
        <TableCell sx={{ minWidth: "130px" }}>{document.document_id}</TableCell>
        <TableCell sx={{ width: "150px", fontSize: "13px" }}>
          <Chip
            label={document?.document_version}
            title={document?.document_version}
            sx={{ m: 0.5 }}
          />
        </TableCell>
        <TableCell sx={{ minWidth: "130px" }}>
          {document.document_type}
        </TableCell>
        <TableCell sx={{ minWidth: "100px" }}>
          <Chip
            label={t(document.document_status)}
            title={t(document.document_status)}
            color={statusColors[document.document_status]}
          />
        </TableCell>
        {!isArchive ? (
          <>
            <TableCell>
              {(hasRole(loggedUserIdmRole, [
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
              ]) && !dontShowActions) &&
                <Tooltip title={t("edit_document")}>
                  <IconButton
                    color="primary"
                    disabled={(document?.document_status !== "draft") && (document?.document_status !== "active")}
                    onClick={() => handleEditClick(document?.document_status)}
                    aria-label="Edit document"
                  >
                    <BorderColorIcon />
                  </IconButton>
                </Tooltip>
              }
            </TableCell>
            <TableCell>
              <Tooltip title={t("relevant_workflow")}>
                <IconButton color={"primary"} disabled={document?.relevant_workflow_id === null} onClick={() => navigate(`/workflow-view/${document?.relevant_workflow_id}`)}>
                  <RuleIcon />
                </IconButton>
              </Tooltip>
            </TableCell>
          </>
        ) : null
        }
        <TableCell>
          <Tooltip title={t("open_document_pdf")}>
            <Link
              target="_blank"
              to={`/document-view-details/${document?.id}/${document?.document_version}`}
            >
              <IconButton color={"primary"}>
                <FindInPageIcon />
              </IconButton>
            </Link>
          </Tooltip>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
          <Collapse in={isRowOpen} timeout="auto" unmountOnExit>
            <Container maxWidth="xl">
              <DocumentDetailsBlock documentData={document} />
            </Container>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

DSTableRow.propTypes = {
  document: PropTypes.object
}

export default DSTableRow;
