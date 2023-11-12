import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import React from "react";
import Slide from "@mui/material/Slide";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});
const DSDialog = ({ open, setOpen, content = null, title, children = null, type = "info", height = "auto", maxWidth = "sm" }) => {

    const colors = {
        info: "#1565c0",
        success: "#15c04e",
        error: "#c01515",
    }

    return (
        <Dialog
            PaperProps={{ sx: { width: "50%", height: height, padding: "5px", borderTop: `7px solid ${colors[type]}` } }}
            open={open}
            disableEscapeKeyDown
            TransitionComponent={Transition}
            maxWidth={maxWidth}
            keepMounted={false}
            onClose={(event, reason) => {
                if (reason && reason === 'backdropClick')
                    return
                setOpen(false)
            }}
            aria-describedby="alert-dialog-slide-description"
        >
            <DialogTitle>{title}</DialogTitle>
            {content ?
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        {content}
                    </DialogContentText>
                </DialogContent>
            :
                null
            }
            <DialogActions>
                {children}
            </DialogActions>
        </Dialog>
    );
}

export default DSDialog;