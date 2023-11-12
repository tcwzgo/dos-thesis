import { Chip, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const Filelist = ({files, removeFile}) => {
    return ( 
        <Stack direction="column" spacing={1}>
        {files && files.map((a, i) => {
            return (
                <Chip 
                    key={i} 
                    sx={{ display: "flex", width: "28rem", justifyContent: "space-between" }}
                    label={a}
                    title={a}
                    deleteIcon={<DeleteIcon />}
                    onDelete={() => removeFile(a)}/>
            )
        })}   
        </Stack>
     );
}
 
export default Filelist;