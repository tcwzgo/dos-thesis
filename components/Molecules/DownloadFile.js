import { useTranslation } from "react-i18next";
import React, {useState} from "react";
import api from "../../axios_conf";
import {Chip} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PropTypes from 'prop-types'
import { UserContext } from "../../App";
import { useContext } from "react";

const DownloadFile = ({ filename, data, fileType }) => {
    const { t } = useTranslation()
    const [error, setError] = useState(null);
    const { loggedUserIdmRole, isSuperuser } = useContext(UserContext)
    const downloadFile = async () => {
        setError(null);
        try {
            const url = `/api/documents/${data?.id}/${data?.document_version}/${fileType}/${filename}`;

            const response = await api(isSuperuser, loggedUserIdmRole).get(url, {
                responseType: "blob",
            });

            const fileBlob = new Blob([response.data], {
                type: response.headers["content-type"],
            });

            const downloadUrl = URL.createObjectURL(fileBlob);

            const link = window.document.createElement("a");
            link.href = downloadUrl;
            link.download = filename;
            link.click();

            link.remove();
            URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            setError(error);
            console.error(error);
        }
    };

    return (
        <>
            {error && (
                <p
                    style={{
                        color: "red",
                        fontSize: "11px",
                        marginLeft: "10px",
                        marginTop: "1px",
                        marginBottom: "0px",
                    }}
                >
                    {t("file_download_error_message")}
                </p>
            )}
            <Chip
                deleteIcon={<DownloadIcon />}
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    m: 1,
                    width: "15rem",
                }}
                label={filename}
                title={filename}
                color={error ? "error" : "default"}
                onDelete={() => downloadFile()}
                onClick={() => downloadFile()}
            />
        </>
    );
};

DownloadFile.propTypes = {
    filename: PropTypes.string,
    data: PropTypes.object,
    fileType: PropTypes.oneOf(['attachments', 'training_tests', 'training_material', 'supporting_documents'])
}
export default DownloadFile