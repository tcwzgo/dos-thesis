import { useNavigate } from "react-router-dom";
import { Stack, Button, Chip, Card } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import Alert from '@mui/material/Alert';
import PostAddIcon from '@mui/icons-material/PostAdd';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import { useTranslation } from 'react-i18next';
import { UserContext } from "../../App";
import { useContext } from "react";
import { ROLES, hasRole } from "../utils";
import { useFetchFileFromFileshare } from "../../useFetchFileFromFileshare";

const DocumentUploaderLanding = () => {

  const { t } = useTranslation();
  const buttonStyle = {
    p: "2rem",
    fontSize: "17px",
    width: "20rem"
  }

  const stackStyle = {
    mt: "10rem"
  }

  const { loggedUserIdmRole } = useContext(UserContext)
  const { iFrameUrl: trainingTestUrl, error: trainingTestError } = useFetchFileFromFileshare("training_test")
  const navigate = useNavigate()

  const downloadFile = async () => {
    const a = document.createElement('a');
    a.href = trainingTestUrl;
    a.download = 'training_test_template.xlsx';
    a.click();
  };

  return (
    <>
      <Card
        sx={{
          width: { sx: "100%", md: "65%" },
          margin: "auto",
          padding: "2rem",
          textAlign: "center",
        }}
      >

        <Stack sx={stackStyle} direction="row" spacing={2} justifyContent="center" alignItems="center">
          <Button sx={buttonStyle} onClick={() => navigate('/document-uploader', { state: { isMigrating: false } })} variant="outlined" startIcon={<PostAddIcon fontSize="large" />}>
            {t("new_document")}
          </Button>
          {hasRole(loggedUserIdmRole, [ROLES.DOCUMENT_RESPONSIBLE, ROLES.SUPERUSER]) ? 
            <Button sx={buttonStyle} onClick={() => navigate('/document-uploader', { state: { isMigrating: true } })} variant="outlined" startIcon={<DriveFileRenameOutlineOutlinedIcon fontSize="large" />}>
              {t("migrate_document")}
            </Button>
            :
            null
          }
        </Stack>
        <div style={{ margin: "3rem", display: 'flex', alignItems: "center", justifyContent: 'center', flexDirection: 'column' }}>
          {trainingTestError ? 
            <Alert severity="error">{trainingTestError}</Alert>
            :
            <Chip
              deleteIcon={<DownloadIcon />}
              sx={{ display: "flex", justifyContent: "space-between", m: 1 }}
              label={t("test_questionnaire_template")}
              title={t("test_questionnaire_template")}
              onDelete={() => downloadFile()}
              onClick={() => downloadFile()}
            />
          }
          <Alert variant="outlined" severity="info" sx={{ maxWidth: "670px", width: { sx: "100%", md: "100%" }, fontSize: '11px' }}>{t("test_questionnaire_alert")}</Alert>

        </div>
      </Card>
    </>
  );
}

export default DocumentUploaderLanding;