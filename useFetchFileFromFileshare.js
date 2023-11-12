import { useEffect, useState } from "react";
import api from "./axios_conf";

const URLS = {
    training_test: "/api/training-test",
    user_manual: "/api/usermanual"
}

const RESPONSE_TYPES = {
    training_tests: "application/xlsx",
    user_manual: "application/pdf"
}

const allowedFileTypes = ["user_manual", "training_test"]

export const useFetchFileFromFileshare = (fileType) => {
   
    const [iFrameUrl, setIframeUrl] = useState("");
    const [error, setError] = useState(null)
    
    useEffect(() => {
        if (!allowedFileTypes.includes(fileType)) { 
            setError(`Invalid filetype "${fileType}", it should be one of ${JSON.stringify(allowedFileTypes)}`)
            return
        }
        api().get(URLS[fileType], {
            responseType: 'blob',
        })
        .then(response => {
            if (response.status === 200) {
                const blob = new Blob([response.data], { type: RESPONSE_TYPES[fileType] });
                const url = URL.createObjectURL(blob);
                setIframeUrl(url);
            }
            else {
                setError(`Error in api call while fetching ${fileType} from fileshare: `, JSON.stringify(response))
            }
        })
        .catch(error => 
            setError(`Error occured while fetching ${fileType} from fileshare: `, JSON.stringify(error))
        )
        
    }, [fileType]);

    return { iFrameUrl, error }
}