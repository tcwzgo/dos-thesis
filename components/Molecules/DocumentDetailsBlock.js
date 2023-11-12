import { Accordion, AccordionSummary, Grid, Typography, Chip, AccordionDetails, Link, Card } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React, { useEffect, useState, useCallback, useContext } from 'react'
import { useTranslation } from 'react-i18next';
import DownloadFile from './DownloadFile';
import AvatarChip from './AvatarChip';
import api from "../../axios_conf.js";
import { UserContext } from '../../App';
import axios from 'axios';


function DocumentDetailsBlock({ documentData }) {
    const { i18n, t } = useTranslation();
    const isHun = ["hu", "HU", "hu-HU"].includes(i18n.language)
    const { loggedUserIdmRole, isSuperuser } = useContext(UserContext);
    const [canSeeTrainingTests, setCanSeeTrainingTests] = useState(false)
    const [publisherDepartment, setPublisherDepartment] = useState(null);
    const [relatedDepartments, setRelatedDepartments] = useState([]);
    const [locations, setLocations] = useState([]);
    const [areas, setAreas] = useState([]);
    const [products, setProducts] = useState([]);
    const [roles, setRoles] = useState([]);
    const [trainingMethods, setTrainingMethods] = useState({});

    const canAccessTrainingTests = useCallback(() => {
        if (documentData?.id && documentData?.document_version && !!documentData?.issue_date) {
            api(isSuperuser, loggedUserIdmRole).get(`/api/documents/can-see-training-tests/${documentData?.id}/${documentData?.document_version}`)
                .then(response => {
                    if (response?.status === 200) {
                        setCanSeeTrainingTests(true)
                    } else {
                        setCanSeeTrainingTests(false)
                    }
                })
                .catch(error => console.error(error))
        }
    }, [documentData?.id, documentData?.document_version])


    useEffect(() => canAccessTrainingTests(), [canAccessTrainingTests])

    useEffect(() => {
        if (documentData?.related_departments) {
            axios
                .get(
                    `https://locationstore-htvp.emea.bosch.com/api/departments?id=${documentData?.related_departments.join(
                        ","
                    )}`
                )
                .then((res) => {
                    setRelatedDepartments(res.data.map((item) => item.label));
                });
        }
        if (documentData?.publisher_department) {
            axios
                .get(
                    `https://locationstore-htvp.emea.bosch.com/api/departments?id=${documentData?.publisher_department}`
                )
                .then((res) => {
                    setPublisherDepartment(res.data.map((item) => item.label));
                });
        }
        if (documentData?.locations?.length > 0) {
            axios
                .get(
                    `https://locationstore-htvp.emea.bosch.com/api/locations/?ids=${documentData?.locations.join(
                        ","
                    )}`
                )
                .then((res) => {
                    setLocations(res.data.map((item) => item.label));
                });
        } else {
            setLocations([t("valid_to_all")]);
        }
        if (documentData?.areas?.length > 0) {
            axios
                .get(
                    `https://locationstore-htvp.emea.bosch.com/api/areas/?area_id=${documentData?.areas.join(
                        ","
                    )}`
                )
                .then((res) => {
                    setAreas(res.data.map((item) => item.name));
                });
        } else {
            setAreas([t("valid_to_all")]);
        }
        if (documentData?.product_family?.length > 0) {
            axios
                .get(
                    `https://locationstore-htvp.emea.bosch.com/api/products?product_id=${documentData?.product_family.join(
                        ","
                    )}`
                )
                .then((res) => {
                    setProducts(res.data.map((item) => item.label));
                });
        } else {
            setProducts([t("valid_to_all")]);
        }
        if (documentData?.affected_roles?.length > 0) {
            api()
                .get(
                    `/api/asm/role-name?ids=[${documentData?.affected_roles.join(
                        ","
                    )}]`
                )
                .then((res) => {
                    setRoles(res.data.map((item) => item.label));
                });
        } else {
            setRoles([t("valid_to_all")]);
        }
        api().get("/api/admin/config").then((res) => {
            if (isHun) {
                setTrainingMethods(res.data.training_methods.reduce((acc, obj) => {
                    acc[obj.key] = obj.hu;
                    return acc;
                }, {}));
            } else {
                setTrainingMethods(res.data.training_methods.reduce((acc, obj) => {
                    acc[obj.key] = obj.en;
                    return acc;
                }, {}));
            }
        });
    }, [documentData, i18n.language, t]);

    return (

        <>
            {!!documentData.issue_date &&
                <Accordion sx={{ margin: "1rem !important" }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content">
                        <Typography variant="caption" fontWeight={"bold"}>{t("related_files")}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container sx={{ paddingX: "0.5rem" }}>

                            <Grid item xs={12} spacing={2} paddingRight={4} sx={{ mb: 1 }}>
                                <Typography variant="caption">{t("attachments")}<br /></Typography>
                                <Grid container>
                                    {documentData?.attachments?.length === 0 ? t("no_items") : documentData?.attachments?.map((attachment) => {
                                        return (<Grid item>
                                            <DownloadFile
                                                key={attachment}
                                                filename={attachment}
                                                data={documentData}
                                                fileType={"attachments"}
                                            />
                                        </Grid>
                                        );
                                    })}
                                </Grid>
                            </Grid>
                            <Grid item xs={12} spacing={2} paddingRight={4} sx={{ mb: 1 }}>
                                <Typography variant="caption">
                                    {t("training_materials")}<br />
                                </Typography>
                                <Grid container>
                                    {documentData?.training_material?.length === 0 ? t("no_items") : documentData?.training_material?.map((trainingMaterial) => {
                                        return (
                                            <Grid item>
                                                <DownloadFile
                                                    key={trainingMaterial}
                                                    filename={trainingMaterial}
                                                    data={documentData}
                                                    fileType={"training_material"}
                                                />
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </Grid>
                            {canSeeTrainingTests ?
                                <>
                                    <Grid item xs={12} spacing={2} paddingRight={4} sx={{ mb: 1 }}>
                                        <Typography variant="caption">
                                            {t("training_tests")}<br />
                                        </Typography>
                                        <Grid container>
                                            {documentData?.training_tests?.length === 0 ? t("no_items") : documentData?.training_tests?.map((trainingTest) => {
                                                return (
                                                    <Grid item>
                                                        <DownloadFile
                                                            key={trainingTest}
                                                            filename={trainingTest}
                                                            data={documentData}
                                                            fileType={"training_tests"}
                                                        />
                                                    </Grid>
                                                );
                                            })}
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12} spacing={2} paddingRight={4} sx={{ mb: 1 }}>
                                        <Typography variant="caption">
                                            {t("supporting_documents")}<br />
                                        </Typography>
                                        <Grid container>
                                            {documentData?.supporting_documents?.length === 0 ? t("no_items") : documentData?.supporting_documents?.map((supportingDocument) => {
                                                return (
                                                    <Grid item>
                                                        <DownloadFile
                                                            key={supportingDocument}
                                                            filename={supportingDocument}
                                                            data={documentData}
                                                            fileType={"supporting_documents"}
                                                        />
                                                    </Grid>
                                                );
                                            })}
                                        </Grid>
                                    </Grid>
                                </>
                                :
                                null
                            }
                        </Grid>
                    </AccordionDetails>
                </Accordion>
            }
            <Card sx={{
                padding: "1rem",
                margin: "1rem",
                border: "1px solid #EFF1F2"
            }}>
                <Grid container>
                    <Grid item xs={12} sx={{ mb: 1 }}>
                        <Typography variant="caption" fontWeight={"bold"}>{t("document_details")}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                        <Typography variant="caption">{t("creator")}:</Typography>
                    </Grid>
                    <Grid item xs={3} sx={{ mb: 1 }}>

                        <AvatarChip userid={documentData?.creator} name={documentData?.creator_name} size="small" />
                    </Grid>
                    <Grid item xs={3}>
                        <Typography variant="caption">{t("allowed_editors")}:</Typography>
                    </Grid>
                    <Grid item xs={3} sx={{ mb: 1 }}>
                        {documentData?.allowed_editors?.filter((editor) => editor.userid !== documentData?.creator).map((editor) => {
                            return <div style={{marginTop: "5px"}}>
                                <AvatarChip userid={editor.userid} name={editor?.name} size="small" />
                            </div>
                        })}
                    </Grid>
                    <Grid item xs={3} sx={{ mb: 1 }}>
                        <Typography variant="caption">{t("document_type")}:</Typography>
                    </Grid>
                    <Grid item xs={3} sx={{ mb: 1 }}>
                        <Chip sx={{}} label={documentData?.document_type} />
                    </Grid>
                    <Grid item xs={3} sx={{ mb: 1 }}>
                        <Typography variant="caption">{t("issue_date")}:</Typography>
                    </Grid>
                    <Grid item xs={3} sx={{ mb: 1 }}>

                        {!!documentData.issue_date ? <Chip sx={{}} label={documentData?.issue_date} /> :
                            <Chip sx={{}} label={t("not_created_yet")} />}
                    </Grid>
                    <Grid item xs={3} sx={{ mb: 1 }}>
                        <Typography variant="caption">{t("valid_from")}:</Typography>
                    </Grid>
                    <Grid item xs={3} sx={{ mb: 1 }}>
                        {documentData?.valid_from_date ? <Chip sx={{}} label={documentData?.valid_from_date} /> :
                            <Chip sx={{}} label={t("not_active_yet")} />}
                    </Grid>
                    <Grid item xs={3} sx={{ mb: 1 }}>
                        <Typography variant="caption">{t("expiration_date")}:</Typography>
                    </Grid>
                    <Grid item xs={3} sx={{ mb: 1 }}>
                        {documentData?.expiration_date === null
                            ? <Chip
                                label={<Typography variant="caption"
                                    style={{ whiteSpace: 'normal' }}>{t("3years_from_approval")}</Typography>} />
                            : <Chip label={documentData?.expiration_date} />
                        }
                    </Grid>
                </Grid>
            </Card>
            <Card sx={{
                padding: "1rem",
                margin: "1rem",
                border: "1px solid #EFF1F2"
            }}>
                <Grid container>
                    <Grid item xs={12} sx={{ mb: 1 }}>
                        <Typography variant="caption" fontWeight={"bold"}>{t("validity")}</Typography>
                    </Grid>
                    <Grid item xs={4} sx={{ mb: 1 }}>
                        <Typography variant="caption">{t("publisher_department")}:</Typography>
                    </Grid>
                    <Grid item xs={8} sx={{ mb: 1 }}>
                        <Chip sx={{}} label={publisherDepartment} />
                    </Grid>
                    <Grid item xs={4} sx={{ mb: 1 }}>
                        <Typography variant="caption">{t("related_departments")}:</Typography>
                    </Grid>
                    <Grid item xs={8} sx={{ mb: 1 }}>
                        {relatedDepartments.length == 0 && <Chip sx={{}} label={t("no_related_department")} />}
                        {relatedDepartments.map((department) => {
                            return <Chip sx={{}} label={department} />
                        })}
                    </Grid>
                    <Grid item xs={4} sx={{ mb: 1 }}>
                        <Typography variant="caption">{t("areas")}:</Typography>
                    </Grid>
                    <Grid item xs={8} sx={{ mb: 1 }}>
                        {areas.map((area) => {
                            return <Chip sx={{ margin: "1px" }} label={area} />
                        })}
                    </Grid>
                    <Grid item xs={4} sx={{ mb: 1 }}>
                        <Typography variant="caption">{t("products")}:</Typography>
                    </Grid>
                    <Grid item xs={8} sx={{ mb: 1 }}>
                        {products.map((product) => {
                            return <Chip sx={{ margin: "1px" }} label={product} />
                        })}
                    </Grid>
                    <Grid item xs={4} sx={{ mb: 1 }}>
                        <Typography variant="caption">{t("relevant_stations")}:</Typography>
                    </Grid>
                    <Grid item xs={8} sx={{ mb: 1 }}>
                        {locations.map((location) => {
                            return <Chip sx={{ margin: "1px" }} label={location} />
                        })}
                    </Grid>
                    <Grid item xs={4} sx={{ mb: 1 }}>
                        <Typography variant="caption">{t("related_roles")}:</Typography>
                    </Grid>
                    <Grid item xs={8} sx={{ mb: 1 }}>
                        {roles.map((role) => {
                            return <Chip sx={{ margin: "1px" }} label={role} />
                        })}
                    </Grid>
                </Grid>
            </Card>
            <Card sx={{
                padding: "1rem",
                margin: "1rem",
                border: "1px solid #EFF1F2"
            }}>
                <Grid container>
                    <Grid item xs={12} sx={{ mb: 1 }}>
                        <Typography variant="caption" fontWeight={"bold"}>{t("training_information")}</Typography>
                    </Grid>
                    <Grid item xs={3} sx={{ mb: 1 }}>
                        <Typography variant="caption">{t("training_methodology")}:</Typography>
                    </Grid>
                    <Grid item xs={3} sx={{ mb: 1 }}>
                        <Chip label={trainingMethods[documentData?.training_method]} />
                    </Grid>
                    <Grid item xs={3} sx={{ mb: 1 }}>
                        <Typography variant="caption">{t("training_deadline")}:</Typography>
                    </Grid>
                    <Grid item xs={3} sx={{ mb: 1 }}>
                        <Chip label={documentData?.training_deadline + " " + t("days")} />
                    </Grid>
                </Grid>
            </Card>
            <Card sx={{
                padding: "1rem",
                margin: "1rem",
                border: "1px solid #EFF1F2"
            }}>
                <Grid container>
                    <Grid item xs={12} sx={{ mb: 1 }}>
                        <Grid container>
                            <Grid item xs={12} sx={{ mb: 1 }}>
                                <Typography variant="caption" fontWeight={"bold"}>{t("document_security")}</Typography>
                            </Grid>
                            <Grid item xs={4} sx={{ mb: 1 }}>
                                <Typography variant="caption">{t("confidentiality")}:<br /></Typography>
                                <Chip label={documentData?.data_security?.confidentiality} />
                            </Grid>
                            <Grid item xs={4} sx={{ mb: 1 }}>
                                <Typography variant="caption">{t("integrity")}:<br /></Typography>
                                <Chip label={documentData?.data_security?.integrity} />
                            </Grid>
                            <Grid item xs={4} sx={{ mb: 1 }}>
                                <Typography variant="caption">{t("availability")}:<br /></Typography>
                                <Chip label={documentData?.data_security?.availability} />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Card>
            <Card sx={{
                padding: "1rem",
                margin: "1rem",
                border: "1px solid #EFF1F2"
            }}>
                <Grid container>
                    <Grid item xs={12} sx={{ mb: 1 }}>
                        <Typography variant="caption" fontWeight={"bold"}>{t("related_documents")}</Typography>
                    </Grid>
                    {documentData?.related_documents?.length > 0 ? (
                        documentData?.related_documents?.map((d) => {
                            return (
                                <Chip
                                    clickable={true}
                                    component={Link}
                                    to={`/document-view-details/${d?.document_id}/${d?.document_version ? d?.document_version : ""}`}
                                    label={d?.document_name}
                                    sx={{ m: "2px" }}
                                />
                            );
                        })
                    ) : (
                        <Typography variant="caption" sx={{ marginLeft: "1rem" }}>
                            {t("no_related_documents")}
                        </Typography>
                    )}


                </Grid>
            </Card>

        </>

    )
}

export default DocumentDetailsBlock