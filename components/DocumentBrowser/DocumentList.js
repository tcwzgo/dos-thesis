import { Table, Paper, TableBody, TableCell, TableRow, TableContainer, TableHead, TablePagination } from "@mui/material";
import React from 'react';
import DSTableRow from "./DSTableRow";
import { useTranslation } from "react-i18next";

const DocumentList = ({
  documents,
  isArchive,
  page,
  setPage,
  total,
  rowsPerPage,
  setRowsPerPage,
}) => {
  const { t } = useTranslation();
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <>
      {documents.length === 0 ? (
          <div
              style={{
                height: "10rem",
                fontWeight: "bold",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
          >
            <p style={{ fontSize: "18px", opacity: "0.5" }}>
              *{t("cricket_noise")}*
            </p>
          </div>
      )
      :
        <>
          <TableContainer component={Paper}>
            <Table aria-label="collapsible table" >
              <TableHead>
                <TableRow>
                  <TableCell align="left"></TableCell>
                  <TableCell sx={{ fontWeight: "bold", maxWidth: "100px" }} style={{
                      whiteSpace: "normal",
                      wordWrap: "break-word"
                    }}>{t("document_name")}</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} style={{
                      whiteSpace: "normal",
                      wordWrap: "break-word"
                    }}>{t("document_id")} </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>{t("document_version")}</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>{t("document_type")}</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>{t("document_status")}</TableCell>
                  {!isArchive ? (
                    <>
                      <TableCell sx={{ fontWeight: "bold" }}></TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}></TableCell>
                    </>
                    ) : null
                  }
                  <TableCell sx={{ fontWeight: "bold" }}></TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}></TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((d) => (
                  <React.Fragment key={d.id}>
                      <DSTableRow
                        isArchive={isArchive}
                        document={d}
                      />
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={total}
            labelRowsPerPage={t("rows_per_page")}
            labelDisplayedRows={({from, to, count, }) => {
              return `${from}–${to} / ${count}`
            }}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      }
    </>
  );
};

export default DocumentList;
