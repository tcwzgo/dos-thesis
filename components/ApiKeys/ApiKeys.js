import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Avatar, Box, Button, Card, Chip, Dialog, DialogActions, DialogTitle, Fab, Grid, IconButton, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { DataGrid } from '@mui/x-data-grid';
import api from '../../axios_conf.js';
import { CustomLoadingOverlay } from '../utils.js';
import AvatarComponent from '../Molecules/AvatarComponent';

function ApiKeys() {

    const { t } = useTranslation();

    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [addedApiKeyData, setAddedApiKeyData] = useState({})
    const [apiKeysIsLoading, setApiKeysIsLoading] = useState(false)

    const [apiKeys, setApiKeys] = useState([])
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [apiKeyCount, setApiKeyCount] = useState(0)

    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedApiKey, setSelectedApiKey] = useState(null)

    useEffect(() => {
        fetchApiKeys()
    }, [])

    useEffect(() => {
        if (createModalOpen) {
            api().post(`/api/apikeys/`).then((response) => {
                setAddedApiKeyData(response.data)
                fetchApiKeys()
            }).catch((error) => {
                console.log(error)
            })
        }

    }, [createModalOpen])

    const fetchApiKeys = () => {
        setApiKeysIsLoading(true)
        api().get(`/api/apikeys/?page=${page}&limit=${limit}`).then((response) => {
            setApiKeys(response.data.data)
            setApiKeyCount(response.data.count)
            setApiKeysIsLoading(false)
        }).catch((error) => {
            console.log(error)
            setApiKeysIsLoading(false)
        })
    }

    const deleteApiKey = () => {
        api().delete(`/api/apikeys/${selectedApiKey}`).then((response) => {
            fetchApiKeys()
            setDeleteModalOpen(false)
        }).catch((error) => {
            console.log(error)
        })
    }

    const columns = [{
        field: 'id', headerName: t('id'), flex: 1, sortable: false,
        renderCell: (params) => {

            return (
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <Chip size="small" label={params.value} />
                    </Grid>
                </Grid>
            )
        }
    },{
        field: 'username', headerName: t('username'), flex: 2, sortable: false,
        renderCell: (params) => {

            return (
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                    <Chip 
                avatar={params.row.userid ? (
                    <AvatarComponent
                        userid={params.row.userid}
                        name={params.value}
                        size="small"
                    />
                ) : (
                    <Avatar
                        alt={params.value}
                        sx={{ width: 25, height: 25 , marginLeft: 1}}
                    >
                        <PersonIcon sx={{ width: 25, height: 25 , marginLeft: 1}} />
                    </Avatar>
                )}
                label={params.value}>
                </Chip>
                    </Grid>
                </Grid>
            )
        }
    },{
        field: 'created_at', headerName: t('created_at'), flex: 1, sortable: false,
        renderCell: (params) => {

            return (
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <Chip size="small" label={params.value} />
                    </Grid>
                </Grid>
            )
        }
    },{
        field: 'expiration_date', headerName: t('expiration_date'), flex: 1, sortable: false,
        renderCell: (params) => {

            return (
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <Chip size="small" label={params.value} />
                    </Grid>
                </Grid>
            )
        }
    },{
        field: 'last_used_at', headerName: t('last_used_at'), flex: 1, sortable: false,
        renderCell: (params) => {

            return (
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <Chip size="small" label={params.value ?  params.value : t("never")} />
                    </Grid>
                </Grid>
            )
        }
    },{
        headerName: t('delete'), flex: 1, sortable: false,
        renderCell: (params) => {

            return (
                <Grid container spacing={1}>
                    <IconButton aria-label="delete" color="error" size="small" onClick={() => {
                        setSelectedApiKey(params.row.id)
                        setDeleteModalOpen(true)
                    }}><DeleteIcon /></IconButton>
                </Grid>
            )
        }
    }
    ]

    return (
        <>
            <Dialog fullWidth maxWidth="md" open={createModalOpen} onClose={() => { setCreateModalOpen(false) }} >
                <div>
                    <Typography variant="h5" component="div"
                        sx={{
                            padding: "1rem",
                        }}
                    >{t("api_key_successfully_added")}
                    </Typography>

                    <Alert severity="info" sx={{
                        padding: "1rem",
                        margin: "1rem",
                    }}>{t("api_key_successfully_added_info")}
                    </Alert>

                    <Grid container spacing={2} sx={{
                        padding: "1rem",
                    }}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" component="div"
                                sx={{
                                    paddingBottom: "0.5rem",
                                }}
                            >{t("api_key")}</Typography>
                            <Grid container spacing={2} sx={{
                                paddingBottom: "0.5rem",
                            }}>
                                <Grid item xs={8}>
                                    <Typography variant="body1" component="div"
                                        sx={{
                                            paddingBottom: "0.5rem",
                                        }}
                                    >{addedApiKeyData.apikey}</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <ContentCopyIcon sx={{
                                        cursor: "pointer",
                                    }} onClick={() => {
                                        navigator.clipboard.writeText(addedApiKeyData.apikey)
                                    }} />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" component="div"
                                sx={{
                                    paddingBottom: "0.5rem",
                                }}
                            >{t("creator")}</Typography>
                            <Typography variant="body1" component="div"
                                sx={{
                                    paddingBottom: "0.5rem",
                                }}
                            >{addedApiKeyData.username}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" component="div"
                                sx={{
                                    paddingBottom: "0.5rem",
                                }}
                            >{t("created_at")}</Typography>
                            <Typography variant="body1" component="div"
                                sx={{
                                    paddingBottom: "0.5rem",
                                }}
                            >{addedApiKeyData.created_at}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" component="div"
                                sx={{
                                    paddingBottom: "0.5rem",
                                }}
                            >{t("expiration_date")}</Typography>
                            <Typography variant="body1" component="div"
                                sx={{
                                    paddingBottom: "0.5rem",
                                }}
                            >{addedApiKeyData.expiration_date}</Typography>
                        </Grid>


                    </Grid>



                </div>
                <DialogActions>
                    <Button onClick={() => { setCreateModalOpen(false) }} color="primary">
                        {t("close")}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={deleteModalOpen}
            >
                <DialogTitle id="alert-dialog-title">
                    {t("are_you_sure_delete")}
                </DialogTitle>

                <DialogActions>
                    <Button onClick={
                        () => {
                            setDeleteModalOpen(false)
                            setSelectedApiKey(null)
                        }
                    } >{t("cancel")}</Button>
                    <Button autoFocus color='error' onClick={
                        () => {
                            deleteApiKey(selectedApiKey)

                        }
                    }>
                        {t("delete")}
                    </Button>
                </DialogActions>
            </Dialog>


            <div sx={{ paddingTop: '1rem' }}>
                <Card sx={{ width: '100%', padding: "1rem", marginY: "1rem" }}>
                    <Typography variant="h5" component="div"
                    >{t("api_keys")}
                    </Typography>
                </Card>
            </div>

            <Box sx={{ flexDirection: 1, display: 'flex', height: 'calc(75vh - 54px)' }}>
                <DataGrid
                    rows={apiKeys}
                    columns={columns}
                    getRowId={(row) => row.id}
                    page={page - 1}
                    rowCount={apiKeyCount}
                    pageSize={limit}
                    pagination
                    onPageChange={(newPage) => setPage(newPage + 1)}
                    onPageSizeChange={(newPageSize) => setLimit(newPageSize)}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    disableSelectionOnClick
                    paginationMode={'server'}
                    loading={apiKeysIsLoading}
                    disableColumnMenu={true}
                    components={{
                        LoadingOverlay: CustomLoadingOverlay,
                    }}
                />
            </Box>

            <Fab variant="extended" sx={{
                marginTop: "1rem",
                position: "fixed",
                bottom: "2rem",
                right: "2rem",
            }}
                color="primary"
                onClick={() => { setCreateModalOpen(true) }}>
                <AddIcon sx={{ marginRight: "0.5rem" }} />
                {t("add_api_key")}
            </Fab>
        </>
    )
}

export default ApiKeys