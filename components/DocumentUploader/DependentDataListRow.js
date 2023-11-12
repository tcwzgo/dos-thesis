import { Checkbox, FormControlLabel } from "@mui/material";
import { useState } from "react";

const DependentDataListRow = ({currentElement, handleCheckboxChange, documentField}) => {
    const [isRowHovered, setIsRowHovered] = useState(false)

    return ( 
        <FormControlLabel onMouseEnter={() => setIsRowHovered(true)} onMouseLeave={() => setIsRowHovered(false)} sx={{ display: "flex", borderRadius: "5px", p: 0.2, ml: 0, justifyContent: "start", alignItems: "center", backgroundColor: isRowHovered ? "#8080801f": "white" }} control={
            <Checkbox checked={currentElement?.checked} defaultChecked={documentField?.findIndex(item => item === currentElement?.value) !== -1} onChange={(e) => {
                handleCheckboxChange(e, currentElement)
            }}/>
        } label={<p style={{ fontSize: '15px', marginTop: "0", marginBottom: "0" }}>{currentElement?.label}</p>} labelPlacement={"end"} />
     );
}
 
export default DependentDataListRow;