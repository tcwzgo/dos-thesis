import Iframe from "react-iframe";
import { Alert } from "@mui/material";
import { useFetchFileFromFileshare } from "../useFetchFileFromFileshare";

const UserManual = () => {

    const { iFrameUrl, error } = useFetchFileFromFileshare("user_manual")

    return (
        <>
            {error ? 
                <Alert severity="error">{error}</Alert>
                :
                <Iframe
                    url={iFrameUrl}
                    width="100%"
                    height="1000rem"
                    display="block"
                    position="relative"
                    flexDirection="column"
                />
            }
        </>
    );
}

export default UserManual;