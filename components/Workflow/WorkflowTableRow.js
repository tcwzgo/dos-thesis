import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { Box } from "@mui/material";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import Table from "@mui/material/Table";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useTranslation } from "react-i18next";

const WorkflowTableRow = ({ document }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const innerTableHeaders = [
    t("workflow_status"),
    t("workflow_type"),
    t("workflow_id"),
    t("document_name"),
    t("document_id"),
    t("approval_state"),
  ];
  return (
    <>
      <React.Fragment>
        <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell>kaka1</TableCell>
          <TableCell>kaka2</TableCell>
          <TableCell>kaka3</TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Typography variant="h6" gutterBottom component="div">
                  Workflow valami
                </Typography>
                <Table sx={{ width: 10, height: "5rem" }}>
                  <TableHead>
                    <TableRow>
                      {innerTableHeaders.map((header) => {
                        return (
                          <TableCell sx={{ fontWeight: "bold" }}>
                            {header}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow
                      hover
                      onClick={() =>
                        navigate(
                          `/document-view/${document.id}/${document.document_version}`
                        )
                      }
                    >
                      <TableCell sx={{ minWidth: 170, fontSize: "13px" }}>
                        kaka4
                      </TableCell>
                      <TableCell sx={{ minWidth: 170, fontSize: "13px" }}>
                        kaka5
                      </TableCell>
                      <TableCell sx={{ minWidth: 170, fontSize: "13px" }}>
                        kaka6
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    </>
  );
};

export default WorkflowTableRow;
