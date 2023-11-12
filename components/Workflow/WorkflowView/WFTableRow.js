import { Link } from "react-router-dom";
import { TableCell, TableRow, Button } from "@mui/material";
import { useTranslation } from "react-i18next";

const WFTableRow = ({ attachments, open, setOpen }) => {
  const { t } = useTranslation();
  return (
    <>
      <TableRow>
        <TableCell>{attachments.doc_name}</TableCell>
        <TableCell>{attachments.doc_id}</TableCell>
        <TableCell sx={{ minWidth: "200px" }}>
          <Link
            target="_blank"
            to={`/document-view-details/${attachments?.id}/${attachments?.doc_version}`}
          >
            <Button color={"primary"} variant="contained">
              {t("open_document")}
            </Button>
          </Link>
        </TableCell>
      </TableRow>
    </>
  );
};

export default WFTableRow;
