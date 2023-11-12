import Table from "@mui/material/Table";
import Paper from "@mui/material/Paper";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import { Box } from "@mui/material";
import WFTableRow from "./WFTableRow";
import { useTranslation } from "react-i18next";

const WFTableForDocument = ({ documents, open, setOpen }) => {
  const { t } = useTranslation();
  return (
    <>
      <h4 style={{ marginTop: "2rem", marginBottom: "1rem" }}>{t("document_and_attachments")}</h4>
      <Box sx={{ width: "100%", marginY: "2rem" }}>
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
                <TableCell
                  sx={{ fontWeight: "bold", align: "center" }}
                ></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((row) => {
                return (
                  <WFTableRow
                    key={row.id}
                    attachments={row}
                    open={open}
                    setOpen={setOpen}
                  />
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};

export default WFTableForDocument;
