
import { Avatar, Chip, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import AvatarComponent from "../../Molecules/AvatarComponent";
import PersonIcon from "@mui/icons-material/Person";

const WFStickyHeader = ({ creator, creatorName, status, type, id, startDate, closedDate }) => {
    const { t } = useTranslation();
    return (
        <Stack flexDirection={"row"} justifyContent={"space-evenly"} sx={{ width: '100%', borderBottom: "1px solid grey", p: 1, backgroundColor: "white", position: "sticky", top: '53px', zIndex: '2' }}>
            <Stack flexDirection={"column"} gap={0.1}>
                <Typography sx={{ fontWeight: "bold" }}>
                    {t("workflow_id")}:
                </Typography>
                <Chip label={id} title={id} />
            </Stack>
            <Stack flexDirection={"column"} gap={0.1} sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Typography sx={{ fontWeight: "bold"}}>
                    {t("workflow_creator")}:
                </Typography>
                <Chip 
                avatar={creator ? (
                    <AvatarComponent
                        userid={creator}
                        name={creatorName}
                        size="small"
                    />
                ) : (
                    <Avatar
                        alt={creatorName}
                        sx={{ width: 24, height: 24 }}
                    >
                        <PersonIcon />
                    </Avatar>
                )}
                label={creatorName}>
                </Chip>
            </Stack>
            <Stack flexDirection={"column"} gap={0.1}>
                <Typography sx={{ fontWeight: "bold" }}>
                    {t("workflow_status")}:
                </Typography>
                <Chip label={t(status).toUpperCase()} title={t(status).toUpperCase()}
                    color={status?.toLowerCase() === 'approved' ? 'success' : status?.toLowerCase() === 'rejected' ? 'error' : status?.toLowerCase() === "withdrawn" ? "warning" : "info"} />
            </Stack>
            <Stack flexDirection={"column"} gap={0.1}>
                <Typography sx={{ fontWeight: "bold" }}>
                    {t("workflow_type")}:
                </Typography>
                <Chip label={t(type).toUpperCase()} title={t(type).toUpperCase()} color="info" />
            </Stack>
            <Stack flexDirection={"column"} gap={0.1}>
                <Typography sx={{ fontWeight: "bold" }}>
                    {t("workflow_start_date")}:
                </Typography>
                <Chip label={startDate} title={startDate} />
            </Stack>
            <Stack flexDirection={"column"} gap={0.1}>
                <Typography sx={{ fontWeight: "bold" }}>
                    {t("workflow_closed_date")}:
                </Typography>
                <Chip label={closedDate} title={closedDate} />
            </Stack>
        </Stack>
    );
}

export default WFStickyHeader;