import { useCallback, useState, useEffect } from 'react'
import { Alert, Chip, Typography, Paper } from '@mui/material'
import { useTranslation } from 'react-i18next'
import api from '../../../axios_conf';
import Spinner from '../../Molecules/Spinner';

const RelatedDocumentsList = ({ document }) => {
    const [relatedDocuments, setRelatedDocuments] = useState([])
    const [error, setError] = useState(null)
    const [isPending, setIsPending] = useState(false)
    const { t } = useTranslation()

    const fetchRelatedDocuments = useCallback(() => {
        const documentUniqueId = document?.value
        setIsPending(true)
        api().post("/api/documents/get-where-document-is-related", {
            "document_unique_id": documentUniqueId
        })
        .then(res => {
            setRelatedDocuments(res.data)
            setError(null)
            setIsPending(false)
        })
        .catch(error => {
            setIsPending(false)
            setError(error.message)
        })
    }, [])

    useEffect(() => {
        fetchRelatedDocuments()
    }, [fetchRelatedDocuments])

    return ( 
        <>
            {error ? 
                <Alert severity='error'>An error has occured - <strong>{error}</strong></Alert>
                :
                null
            }
            {isPending  ? 
                <Spinner size={"small"}/>
                :
                <>
                    {relatedDocuments.length === 0 ?
                        null                        
                        :
                        <Paper sx={{ mb: 2, p: 2 }}>
                            <Typography><strong>{document?.label}</strong> {t("documents_related_to")}</Typography>
                            {relatedDocuments.map(relatedDocument => {
                                return (
                                        <Chip key={relatedDocument?.id} size='medium' sx={{ m: 0.2 }} label={relatedDocument?.document_name} title={relatedDocument?.document_name}/>
                                    )
                                })}
                        </Paper>
                    }
                </>
            }
        </>
     );
}
 
export default RelatedDocumentsList;