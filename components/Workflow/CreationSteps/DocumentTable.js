import Table from "@mui/material/Table";
import Paper from "@mui/material/Paper";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import { Box, Button } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DSMetadataSummary from "../../DSMetadataSummary/DSMetadataSummary";

const DocumentTable = ({ documents, open, setOpen }) => {
  const { t } = useTranslation();
  const transformDocumentData = (doc) => {
    return [
      {
        id: doc.id,
        doc_name: doc.document_name,
        doc_id: doc.document_id,
        doc_version: doc.document_version,
      },
    ];
  };

  const WFTableRow = ({ attachments, open, setOpen }) => {
    return (
      <>
        <TableRow>
          <TableCell>{attachments.document_name}</TableCell>
          <TableCell>{attachments.document_id}</TableCell>
        </TableRow>
      </>
    );
  };
  return (
    <>
      <Grid container>
        <Grid item xs="11">
          <h4 style={{ marginTop: "2rem" }}>{t("document_and_attachments")}</h4>
        </Grid>
        <Grid item xs="1">
          <Link
            target="_blank"
            to={`/document-view/${documents?.id}/${documents?.document_version}`}
          >
            <IconButton size="large" color={"primary"}>
              <FindInPageIcon />
            </IconButton>
          </Link>
        </Grid>
      </Grid>
      <Box sx={{ height: 200, width: "100%", mt: 2 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", align: "center" }}>
                  {t("document_name")}
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", align: "center" }}>
                  {t("document_id")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <WFTableRow
                key={documents.id}
                attachments={documents}
                open={open}
                setOpen={setOpen}
              />
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <DSMetadataSummary
        document={documents}
        documentVersion={documents.document_version}
      />
    </>
  );
};

export default DocumentTable;
