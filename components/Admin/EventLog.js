import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { Button, Grid, Typography } from '@mui/material';
import api from '../../axios_conf.js';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

function EventLog() {
    const { t } = useTranslation();

    const [eventList, setEventList] = useState([])
    const [limit] = useState(10)
    const [page, setPage] = useState(1)
    const [count, setCount] = useState(0)
    const [modalOpen, setModalOpen] = useState(false)
    const [modalData, setModalData] = useState({})
    useEffect(() => {
        const eventLogUrl = `/api/admin/eventlog?limit=${limit}&page=${page}`;
        api()
            .get(eventLogUrl, {})
            .then(function (response) {
                const data = response.data.data;
                setEventList(data);
                setCount(response.data.total);
            });
    }, [page, limit])

    return (
        <>
            {modalOpen && <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: "80vw", bgcolor: 'background.paper',
                    height: '80vh', overflow: 'auto',
                    border: '2px solid #000', boxShadow: 24,
                    p: 4,

                }}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        {t('data')}
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        <pre>{JSON.stringify(modalData, null, 2)}</pre>
                    </Typography>
                </Box>
            </Modal>

            }


            <Grid container xs="12">
                <Grid item xs="12">
                    <Typography variant="h5" gutterBottom component="div">
                        {t('eventlog')}
                    </Typography>
                </Grid>
                <Grid item xs="12">

                    {eventList.map((item, index) => {
                        return (
                            <Box key={index} sx={{
                                width: '100%', bgcolor: 'background.paper',
                                borderRadius: '5px', border: '1px solid #e0e0e0', p: 2, mb: 2
                            }}>
                                <Grid container xs="12" key={index}>
                                    <Grid item xs="6">
                                        <Typography variant="p" gutterBottom component="div">
                                            {t("timestamp")}: {item.timestamp}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs="6">
                                        <Typography variant="p" gutterBottom component="div">
                                            {t("username")}: {item.username}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs="6">
                                        <Typography variant="p" gutterBottom component="div">
                                            {t("method")}: {item.method}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs="6">
                                        <Typography variant="p" gutterBottom component="div">
                                            {t("roles")}: {item.roles}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs="6">
                                        <Typography variant="p" gutterBottom component="div">
                                            {t("document_name")}: {item.document_name}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs="6">
                                        <Typography variant="p" gutterBottom component="div">
                                            {t("document_id")}: {item.document_id}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs="6">
                                        <Typography variant="p" gutterBottom component="div">
                                            {t("internal_id")}: {item.id}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs="6">
                                        <Button variant="contained" color="primary"
                                            disabled={item.data === null}
                                            onClick={() => {
                                                setModalOpen(true)
                                                setModalData(item.data)
                                            }}>
                                            {t("view_json")}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        )
                    })
                    }

                </Grid>

            </Grid>

            <Grid container xs="12">
                <Grid item xs="4">
                    <Button variant="contained" color="primary"
                    disabled={page === 1}
                    onClick={() => {
                        if (page > 1) {
                            setPage(page - 1)
                        }
                    }}>
                        {t("previous")}
                    </Button>
                </Grid>
                <Grid item xs="4">
                    <Typography variant="p" gutterBottom component="div"
                    sx={{
                        textAlign: "center"

                    }}
                    >
                        {t("page")} {page} / {Math.ceil(count / limit)}
                    </Typography>
                </Grid>
                <Grid item xs="4">
                    <Button variant="contained" color="primary"
                    sx={{
                        float: "right"
                    }}
                    disabled={page === Math.ceil(count / limit)}
                    onClick={() => {
                        if (page < Math.ceil(count / limit)) {
                            setPage(page + 1)
                        }
                    }}>
                        {t("next")}
                    </Button>
                </Grid>
            </Grid>


        </>
    )
}

export default EventLog