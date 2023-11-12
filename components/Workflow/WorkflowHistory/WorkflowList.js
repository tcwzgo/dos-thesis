import { TableRow, TableCell, Chip, IconButton, Tooltip} from '@mui/material'
import { Link } from 'react-router-dom';
import RuleIcon from '@mui/icons-material/Rule';
import FindInPageIcon from "@mui/icons-material/FindInPage";
import { useTranslation } from 'react-i18next';

const WorkflowList = ({ workflows }) => {
    const { t } = useTranslation()

    const statusColorCodes = {
        draft: "default",
        in_approval: "primary",
        rejected: "error",
        approved: "success",
        withdrawn: "warning"
    }
    return ( 
        <>
            {workflows?.map((workflow, index) => {
                return (
                    <TableRow sx={{ fontSize: '10em', overflowX: 'hidden' }} hover key={workflow?.workflow_id}>
                        <TableCell sx={{ minWidth: 30, fontSize: "13px", fontWeight: 'bold'}}>
                            {workflow?.workflow_id}
                        </TableCell>
                        <TableCell sx={{ minWidth: 145, fontSize: "15px"}}>
                            {workflow?.document_name}
                        </TableCell>
                        <TableCell sx={{ minWidth: 145, fontSize: "15px"}} >
                            {workflow?.document_id}
                        </TableCell>
                        <TableCell sx={{ minWidth: 145, fontSize: "15px"}} >
                            {workflow?.document_version}
                        </TableCell>
                        <TableCell sx={{ minWidth: 130, fontSize: "15px"}}>
                            {t(workflow?.workflow_type)}
                        </TableCell>
                        <TableCell sx={{ minWidth: 135, fontSize: "15px"}}>
                            <Chip
                                label={t(workflow?.status)}
                                title={t(workflow?.status)}
                                color={statusColorCodes[workflow?.status]}
                            />
                        </TableCell>
                        <TableCell sx={{ minWidth: 160, fontSize: "15px"}}>
                            {workflow?.creator_name}
                        </TableCell>
                        <TableCell sx={{ pl: 0.7, pr: 0.7 }}>
                            <Tooltip title={t("workflow_view")}>
                                <Link target='_blank' to={`/workflow-view/${workflow?.workflow_id}`}>
                                    <IconButton color="primary">
                                        <RuleIcon />
                                    </IconButton>   
                                </Link>
                            </Tooltip>
                        </TableCell>
                        <TableCell sx={{ pl: 0.7, pr: 0.7 }}>
                            <Tooltip title={t("open_document")}>
                                <Link target='_blank' to={`/document-view/${workflow?.document_unique_id}/${workflow?.document_version}`}>
                                    <IconButton color="primary">
                                        <FindInPageIcon />
                                    </IconButton>   
                                </Link>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                )
            })} 
        </>
     );
}
 
export default WorkflowList;