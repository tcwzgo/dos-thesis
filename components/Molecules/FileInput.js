import { Button } from "@mui/material";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import { useTranslation } from "react-i18next";
import { useState } from "react";

const FileInput = ({ handleFileUpload, name, multiple, label, required, disabled }) => {
    const [isDragActive, setIsDragActive] = useState(false)
    const { t } = useTranslation()

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragActive(true);
      }
    
      const handleDragLeave = (e) => {
        setIsDragActive(false)
      }
    
      const handleDrop = (e) => {
        e.preventDefault();
        setIsDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e)
        }
      }
    return (
        <>
            {(isDragActive && !disabled) 
                ? 
                    <Button 
                        onDragOver={handleDragOver} 
                        name={name} 
                        onDrop={handleDrop} 
                        onDragLeave={handleDragLeave} 
                        sx={{ width: "28rem", p: 2, justifyContent: "center", border: "2px solid", borderStyle: "dashed" }} 
                        disabled={disabled} 
                        variant="outlined" 
                        component="label" 
                        startIcon={<CreateNewFolderIcon />}>
                        {t("drag_and_drop_placeholder")}
                    </Button>
                :
                    <Button 
                        onDragOver={handleDragOver} 
                        onDragLeave={handleDragLeave} 
                        sx={{ width: "28rem", p: 2, justifyContent: "center" }} 
                        disabled={disabled} 
                        variant="contained" 
                        component="label" 
                        startIcon={<FileUploadIcon />}>
                            {label}
                        <input 
                            type="file" 
                            hidden 
                            required={required} 
                            multiple={multiple} 
                            onClick={(e) => e.target.value = null} 
                            name={name} 
                            onChange={handleFileUpload}/>
                    </Button>
            }
        </> 
     );
}
 
export default FileInput;