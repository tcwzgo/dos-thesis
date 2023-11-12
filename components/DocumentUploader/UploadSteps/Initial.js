import React, { useState, useContext, useEffect } from "react";
import api from "../../../axios_conf.js";
import Select from "react-select";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Box, Switch, InputAdornment, Button, Stack, Grid, Typography, TextField as MuiTextField, Alert, Chip } from "@mui/material";
import { transformData, hasRole, ROLES } from "../../utils.js";
import { default as DSTooltip } from "../../Molecules/Tooltip";
import moment from "moment";
import { DocumentContext } from "../DocumentUploader";
import { useTranslation } from "react-i18next";
import { transformUserData } from "../../utils.js";
import { UserContext } from "../../../App";

const Initial = ({ allDepartments, isDocumentResponsible, setIsDocumentResponsible, documentToBeEdited, setSelectedProducts, setSelectedRelevantStations, setSelectedRoles, setSelectedAreas, selectedDepartments, setSelectedDepartments, stepForward, isEditing, isMigrating, isActive, changeType, documentVersion, setDocumentVersion, expirationDate, setExpirationDate, selectedPublisherDepartment, setSelectedPublisherDepartment }) => {

  const separateId = (string) => {
    if (!string) { return "" }
    const components = string.split("-");
    const sliced = components.splice(2)
    return sliced.join('-')
  }

  const { t, i18n } = useTranslation();
  const isHun = ["hu", "HU", "hu-HU"].includes(i18n.language)
  const [docTypes, setDocTypes] = useState([]);
  const { loggedUserIdmRole, isSuperuser, loggedUserId, loggedUserName } = useContext(UserContext)
  const isUserDocumentResponsible = hasRole(loggedUserIdmRole, [ROLES.DOCUMENT_RESPONSIBLE])
  console.log(isUserDocumentResponsible)
  const [dataSecurityOptions, setDataSecurityOptions] = useState([]);
  const [docTrainingTypes, setDocTrainingTypes] = useState([]);
  const [docTrainingTypesData, setDocTrainingTypesData] = useState([]);
  const { documentState, dispatch } = useContext(DocumentContext)
  const [documentType, setDocumentType] = useState("");
  const [departmentsQuery, setDepartmentsQuery] = useState("")
  const [publisherDepartmentsQuery, setPublisherDepartmentsQuery] = useState("")
  const [documentId, setDocumentId] = useState(
    separateId(documentState?.document_id) ||
    separateId(documentToBeEdited?.document_id));
  const [documentIdCharLimitError, setDocumentIdCharLimitError] = useState(false);
  const [documentIdAlreadyExistsError, setDocumentIdAlreadyExistsError] = useState(false);
  const documentIdCharLimit = 20;
  const [isCreatorDisabled, setIsCreatorDisabled] = useState(true)
  const getConfig = () => {
    api().get("/api/admin/config").then((res) => {
      setDocTypes(res.data.document_types.filter((docType) => docType.active).map((docType) => ({ value: docType.name, label: docType.name })));
      setDocTrainingTypesData(res.data.training_methods);
      setDataSecurityOptions(res.data.data_security.filter((sc) => sc.active).map((dataSecurityClass) => ({ value: dataSecurityClass.name, label: dataSecurityClass.name })));
    });
  };


  useEffect(() => {
    if (isHun) {
      setDocTrainingTypes(docTrainingTypesData.filter((trainingType) => trainingType.active && trainingType.relevant_document_types.includes(documentType)).map((docTrainingType) => ({ value: docTrainingType.key, label: docTrainingType.hu })));
    } else {
      setDocTrainingTypes(docTrainingTypesData.filter((trainingType) => trainingType.active && trainingType.relevant_document_types.includes(documentType)).map((docTrainingType) => ({ value: docTrainingType.key, label: docTrainingType.en })));
    }
  }, [docTrainingTypesData, i18n.language, documentType]);

  useEffect(() => {
    if (docTypes.length === 0) {
      getConfig();
    }
  }, [docTypes]);

  const [dateMissing, setDateMissing] = useState(false);
  const [userQuery, setUserQuery] = useState("")
  const [editorQuery, setEditorQuery] = useState("")
  const [relatedDocumentsQuery, setRelatedDocumentsQuery] = useState("")
  const [isUserSearchPending, setIsUserSearchPending] = useState(false)
  const [isEditorSearchPending, setIsEditorSearchPending] = useState(false)
  const [filteredUsers, setFilteredUsers] = useState([])
  const [filteredEditors, setFilteredEditors] = useState([])
  const [isRelatedDocsPending, setIsRelatedDocsPending] = useState(false)
  const [missingChangeType, setMissingChangeType] = useState(false)
  const [relatedDocuments, setRelatedDocuments] = useState([])
  const isDateDisabled = isActive && changeType === 'formal'
  const [userNoOptionsMessage, setUserNoOptionsMessage] = useState(t("please_type_more_letters"))

  useEffect(() => {
    setDocumentType(documentState["document_type"] || documentToBeEdited?.document_type);
  }, [documentState, documentToBeEdited]);

  useEffect(() => {
    const docId = getDocumentIdAdornment() + documentId
    const controller = new AbortController();
    api()
      .get(`/api/documents/document-id-exists/${docId}`, {
        signal: controller.signal,
      })
      .then((res) => {
        setDocumentIdAlreadyExistsError(res.data.exists && res.data.document_unique_id !== documentState?.id)
      })
      .catch((error) => {
        console.error(error);
      });
    return () => controller.abort()
  }, [documentId, documentType])

  const submitForm = (e) => {
    e.preventDefault();
    if (expirationDate === null && isMigrating) {
      setDateMissing(true);
    } else if (changeType === "" && isActive) {
      setMissingChangeType(true);
    } else {
      setMissingChangeType(false);
      setDateMissing(false);
      stepForward();
    }
  };

  const getDocumentIdAdornment = () => {
    return `HtvP-${documentState["document_type"]}-`
  }

  const handleMultiSelectChange = (values, action) => {
    setSelectedAreas([])
    dispatch({
      type: 'CHANGE_INPUT', payload: {
        name: 'areas',
        value: []
      }
    })
    setSelectedProducts([])
    dispatch({
      type: 'CHANGE_INPUT', payload: {
        name: 'product_family',
        value: []
      }
    })
    setSelectedRelevantStations([])
    dispatch({
      type: 'CHANGE_INPUT', payload: {
        name: 'locations',
        value: []
      }
    })
    setSelectedRoles([])
    dispatch({
      type: 'CHANGE_INPUT', payload: {
        name: 'affected_roles',
        value: []
      }
    })

    const all = values.find(element => element.value === "all")
    if (all) {
      setSelectedDepartments([...allDepartments.filter((item) => item.value !== selectedPublisherDepartment?.value)])
      dispatch({
        type: "CHANGE_INPUT", payload: {
          name: action.name,
          value: allDepartments.map(element => element.value)
        }
      })

    }
    else {
      setSelectedDepartments(values)
      dispatch({
        type: "CHANGE_INPUT", payload: {
          name: action.name,
          value: values.map(element => element.value)
        }
      })
    }
  }

  const handleMetadataChange = (value, action) => {
    if (action.name === "training_method") {
      dispatch({
        type: "CHANGE_INPUT",
        payload: {
          name: action.name,
          value: value.value,
        },
      });
    }
    else if (action.name === "publisher_department") {
      setSelectedPublisherDepartment(value)
      dispatch({
        type: "CHANGE_INPUT",
        payload: {
          name: action.name,
          value: value.value,
        },
      });
    }
    else if (action.name === "document_type") {
      documentState["training_method"] = null;
      dispatch({
        type: "CHANGE_INPUT",
        payload: {
          name: action.name,
          value: value.label,
        },
      });
    }
    else {
      dispatch({
        type: "CHANGE_INPUT",
        payload: {
          name: action.name,
          value: value.label,
        },
      });
    }
  };
  const handleDocumentStateChange = (e) => {
    dispatch({
      type: "CHANGE_INPUT",
      payload: {
        name: e.target.name,
        value: e.target.value,
      },
    });
  };
  const handleDocSecurityChange = (value, action) => {
    dispatch({
      type: "CHANGE_DOC_SECURITY",
      payload: {
        name: action.name,
        value: value.label,
      },
    });
  };
  const handleDateChange = (newDate) => {
    setExpirationDate(newDate)
    setDateMissing(false);
    dispatch({
      type: "CHANGE_INPUT",
      payload: {
        name: "expiration_date",
        value: newDate.format("YYYY-MM-DD"),
      },
    });
  };
  const handleMultiSelectLiveSearch = (documents, target) => {

    if (target.name === "allowed_editors") {
      documents = documents.map((item) => {
        return { userid: item.value, name: item.label };
      });
    }
    if (target.name === "related_documents") {
      documents = documents.map((item) => {
        return { document_name: item.label, document_id: item.value, document_version: item.document_version };
      });
    }

    dispatch({
      type: "CHANGE_INPUT",
      payload: {
        name: target.name,
        value: [...documents],
      },
    });
  };
  const handleUserSelect = (e) => {
    dispatch({
      type: "CHANGE_INPUT",
      payload: {
        name: "creator",
        value: e.value,
      },
    });
    dispatch({
      type: "CHANGE_INPUT",
      payload: {
        name: "creator_name",
        value: e.label,
      },
    });
  };

  const handleLiveSearchInputChange = (value, setQuery) => {
    if (value.length < 3) {
      setUserNoOptionsMessage(t("please_type_more_letters"));
    } else {
      setUserNoOptionsMessage(t("no_result"));
    }
    setQuery(value)

  }

  const transformRelatedDocs = (docs) => {
    const temp = [];
    for (const doc of docs.data) {
      temp.push({
        value: doc.id,
        label: doc.document_id + " - " + doc.document_name,
        document_version: doc.document_version,
        document_status: doc.document_status,
      });
    }
    return temp;
  };

  useEffect(() => {
    const controller = new AbortController()
    setIsUserSearchPending(true);

    api()
      .get(`/api/users/search?query=${userQuery}`, {
        signal: controller.signal,
      })

      .then((res) => {
        const result = res.data;
        setFilteredUsers(transformUserData(result));
        setIsUserSearchPending(false);
      })
      .catch((error) => {
        console.error(error);
      });
    return () => controller.abort()
  }, [userQuery])
  useEffect(() => {
    const controller = new AbortController()
    setIsEditorSearchPending(true);

    api()
      .get(`/api/users/search?query=${editorQuery}`, {
        signal: controller.signal,
      })

      .then((res) => {
        const result = res.data;
        setFilteredEditors(transformUserData(result));
        setIsEditorSearchPending(false);
      })
      .catch((error) => {
        if (error?.message !== 'canceled') {
          setIsEditorSearchPending(false)
        }
        console.error(error);
      });
    return () => controller.abort()
  }, [editorQuery])

  useEffect(() => {
    dispatch({
      type: "CHANGE_INPUT",
      payload: {
        name: "document_version",
        value: documentVersion
      },
    });
  }, [documentVersion])

  useEffect(() => {
    if (relatedDocumentsQuery === '') {
      setIsRelatedDocsPending(false)
      return
    }
    const controller = new AbortController();
    setIsRelatedDocsPending(true);

    const body = {
      search: {
        query: relatedDocumentsQuery,
        find_in_document_body: false

      },
      filter: {
        document_status: documentType === "TWI" ? ["active", "draft"] : ["active"],
      },
      group_by_version: documentType === "TWI" ? false : true,
      type: documentType === "TWI" ? "twi_related_documents" : null
    };

    api(isSuperuser, loggedUserIdmRole)
      .post(`/api/documents/search?limit=100&page=1`, body, {
        signal: controller.signal,
      })
      .then((res) => {
        setRelatedDocuments(transformRelatedDocs(res.data));
        setIsRelatedDocsPending(false);
      })
      .catch((error) => {
        if (error?.message !== 'canceled') {
          setIsRelatedDocsPending(false)
        }
        console.error(error)
      });
    return () => controller.abort()
  }, [relatedDocumentsQuery])

  useEffect(() => {
    dispatch({
      type: "CHANGE_INPUT",
      payload: {
        name: "document_id",
        value: getDocumentIdAdornment() + documentId,
      }
    });
  }, [documentId, documentType])

  useEffect(() => {
    setRelatedDocuments([])
    setRelatedDocumentsQuery("")
    dispatch({
      type: "CHANGE_INPUT",
      payload: {
        name: "related_documents",
        value: []
      }
    })
  }, [documentType])


  const handleResponsibleChange = (event) => {
    setIsDocumentResponsible(prev => !prev)
    if (event.target.checked) {
      dispatch({
        type: "CHANGE_INPUT", payload: {
          name: "creator",
          value: ""
        }
      })
      dispatch({
        type: "CHANGE_INPUT", payload: {
          name: "creator_name",
          value: ""
        }
      })
    }
    else {
      dispatch({
        type: "CHANGE_INPUT", payload: {
          name: "creator",
          value: loggedUserId
        }
      })
      dispatch({
        type: "CHANGE_INPUT", payload: {
          name: "creator_name",
          value: loggedUserName
        }
      })
    }
  }

  useEffect(() => {
    if (isMigrating || isDocumentResponsible) {
      setIsCreatorDisabled(false)
      return
    }
  }, [isMigrating, isDocumentResponsible])

  return (
    <React.Fragment>
      <form onSubmit={submitForm}>
        <Box
          sx={{
            boxShadow: 5,
            marginTop: 5,
            marginBottom: 5,
            padding: 4,
          }}
        >

          <Stack flexDirection={"row"} justifyContent={"space-between"}>
            <Typography sx={{ mt: 1, mb: 2 }} variant="h5" component="div">
              {t("basic_data_input")}
            </Typography>
            {hasRole(loggedUserIdmRole, [ROLES.DOCUMENT_RESPONSIBLE, ROLES.SUPERUSER, ROLES.PLANT_DOCUMENT_RESPONSIBLE]) ?
              <Stack flexDirection={"row"} alignItems={"center"} justifyContent={"center"}>
                <Typography variant={"body2"}>{isEditing ? t("edit_as_responsible") : t("create_as_responsible")}</Typography>
                <Switch 
                  checked={isDocumentResponsible} 
                  onChange={handleResponsibleChange}/>
              </Stack>
              :
              null
            }
          </Stack>

          <Grid
            container
            xs="12"
            rowSpacing={2}
            columnSpacing={{ xs: 1, sm: 2, md: 3 }}
            direction="row"
          >
            <Grid item xs="6">
              <p>{t("document_type")}: </p>
              <Select
                onChange={(value, action) => {
                  setDocumentType(value.label)
                  handleMetadataChange(value, action)
                }
                }
                name={"document_type"}
                label={t("document_type")}
                required
                placeholder={t("document_type")}
                className="basic-single-select"
                classNamePrefix="select"
                options={docTypes}
                value={transformData(documentState["document_type"])}
                menuPortalTarget={document.body}
                isDisabled={isEditing}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              />
            </Grid>
            <Grid item xs="12"></Grid>
            <Grid item xs="6">
              <p>{t("document_name")}: </p>
              <MuiTextField
                onChange={handleDocumentStateChange}
                name={"document_name"}
                variant="outlined"
                required
                value={documentState["document_name"]}
                fullWidth
                inputProps={{ maxLength: 200 }}
                disabled={isEditing && changeType !== 'content' && documentState.document_version?.split('.')[1] !== '0'}
                edit
              />
              {documentState["document_name"].length === 200 ?
                <Alert severity="warning" fontSize={14} sx={{ marginY: 1 }}>
                  {t("document_name_character_limit_notification")}
                </Alert>
                :
                null
              }
            </Grid>
            <Grid item xs="6">
              <p>{t("document_id")}: </p>
              <MuiTextField
                onChange={(e) => {
                  if (e.target.value.length > documentIdCharLimit) {
                    setDocumentIdCharLimitError(true)
                  } else {
                    setDocumentIdCharLimitError(false)
                    setDocumentId(e.target.value)
                  }

                }}
                name={"document_id"}
                error={documentIdCharLimitError || documentIdAlreadyExistsError}
                helperText={documentIdCharLimitError ? t("document_id_character_limit").replace("{{charlimit}}", `${documentIdCharLimit}`) 
                : documentIdAlreadyExistsError? t("document_id_already_exists") : ""}
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment

                    position="start"
                    sx={{ marginRight: 0.2 }}>
                    {getDocumentIdAdornment()}
                  </InputAdornment>,
                  sx: {
                    fontSize: "1rem;",
                    margin: 0,

                  }

                }}
                required
                value={documentId}
                fullWidth
                disabled={isEditing}
              />




            </Grid>
            <Grid item xs="6">
              <p>{t("expiration_date")}: </p>
              <MobileDatePicker
                value={expirationDate}
                onChange={(newDate) => handleDateChange(newDate)}
                maxDate={moment().add(3, "years")}
                minDate={moment()}
                disabled={isDateDisabled}
                renderInput={(params) => (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <MuiTextField
                      {...params}
                      required={documentState?.migrated}
                      helperText={
                        dateMissing ? t("please_fill_out_this_field") : ""
                      }
                      error={dateMissing}
                      fullWidth
                    />
                    {!isDateDisabled &&
                      <i className="a-icon boschicon-bosch-ic-reset" onClick={() => setExpirationDate(null)}>
                      </i>
                    }
                  </Stack>
                )}
              />
              {(!isMigrating || changeType === 'content') &&
                <Alert severity="info" fontSize={14} sx={{ marginY: 1 }}>
                  {t("expiration_date_alert")}
                </Alert>
              }
            </Grid>

            <Grid item xs="6">
              <p>{t("document_version")}: </p>
              <MuiTextField
                onChange={(e) => {
                  setDocumentVersion(e.target.value);
                }}
                name={"document_version"}
                inputProps={{ pattern: "^[1-9][0-9]{0,2}\\.[0-9]{1,3}$" }}
                required
                value={documentVersion}
                variant="outlined"
                fullWidth
                disabled={!isMigrating || isEditing}
              />
              {(isMigrating && !isEditing) &&
                <Alert severity="info" fontSize={14} sx={{ marginY: 1 }}>
                  {t("document_version_infobox")}
                </Alert>
              }
            </Grid>

            <Grid item xs="12">
              <Grid container columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                <Grid item xs="4">
                  <p>{t("document_security")} - {t("confidentiality")}: </p>
                  <Select
                    onChange={handleDocSecurityChange}
                    name={"confidentiality"}
                    label={t("confidentiality")}
                    required
                    placeholder={t("confidentiality")}
                    className="basic-single-select"
                    classNamePrefix="select"
                    options={dataSecurityOptions}
                    value={transformData(
                      documentState.data_security["confidentiality"]
                    )}
                  />
                </Grid>
                <Grid item xs="4">
                  <p>{t("document_security")} - {t("integrity")}: </p>
                  <Select
                    onChange={handleDocSecurityChange}
                    name={"integrity"}
                    label={t("integrity")}
                    required
                    placeholder={t("integrity")}
                    className="basic-single-select"
                    classNamePrefix="select"
                    options={dataSecurityOptions}
                    value={transformData(
                      documentState.data_security["integrity"]
                    )}
                  />
                </Grid>
                <Grid item xs="4">
                  <p>{t("document_security")} - {t("availability")}: </p>
                  <Select
                    onChange={handleDocSecurityChange}
                    name={"availability"}
                    label={t("availability")}
                    required
                    placeholder={t("availability")}
                    className="basic-single-select"
                    classNamePrefix="select"
                    options={dataSecurityOptions}
                    value={transformData(
                      documentState.data_security["availability"]
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs="4">
              <p>{t("publisher_department")}: </p>
              <Select
                options={allDepartments.filter((item) => !selectedDepartments.includes(item))}
                onChange={handleMetadataChange}
                styles={{
                  option: (styles, { data }) => {
                    return {
                      ...styles,
                      fontWeight: data.value === 'all' ? "bold" : "none"
                    }
                  }
                }}
                isDisabled={isEditing && changeType === 'formal'}
                closeMenuOnSelect={true}
                blurInputOnSelect={false}
                inputValue={publisherDepartmentsQuery}
                onInputChange={(value, action) => {
                  if (action?.action !== 'set-value') {
                    setPublisherDepartmentsQuery(value)
                  }
                }}
                displayEmpty
                required={true}
                notched={true}
                name="publisher_department"
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder={t("publisher_department")}
                value={selectedPublisherDepartment}
              />
            </Grid>
            <Grid item xs="4">
              <p>{t("related_departments")}: </p>
              <Select
                options={[{ value: 'all', label: t("select_all") }, ...allDepartments.filter((item) => item.value !== selectedPublisherDepartment?.value)]}
                onChange={handleMultiSelectChange}
                isMulti
                styles={{
                  option: (styles, { data }) => {
                    return {
                      ...styles,
                      fontWeight: data.value === 'all' ? "bold" : "none"
                    }
                  }
                }}
                closeMenuOnSelect={false}
                blurInputOnSelect={false}
                inputValue={departmentsQuery}
                onInputChange={(value, action) => {
                  if (action?.action !== 'set-value') {
                    setDepartmentsQuery(value)
                  }
                }}
                displayEmpty
                notched={true}
                name="related_departments"
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder={t("related_departments")}
                value={selectedDepartments}
              />
            </Grid>
            <Grid item xs="4">
              <p>{t("related_documents")}: </p>
              <Select
                onChange={handleMultiSelectLiveSearch}
                onInputChange={(value) => handleLiveSearchInputChange(value, setRelatedDocumentsQuery)}
                name={"related_documents"}
                label={t("related_documents")}
                isMulti
                required={documentState.document_type === "TWI"}
                isLoading={isRelatedDocsPending}
                placeholder={t("related_documents")}
                className="basic-multi-select"
                classNamePrefix="select"
                options={relatedDocuments}
                value={documentState.related_documents.map((item) => {
                  return { value: item.document_id, label: item.document_name, document_version: item.document_version};
                })}
                noOptionsMessage={() => userNoOptionsMessage}
                formatOptionLabel={({ label, document_version, document_status }) => {
                  return (
                    <div>
                      {label}
                      {documentType === "TWI" ? <Chip size="small" label={document_version} sx={{ marginLeft: 1 }} /> : null}
                      {documentType === "TWI" && document_status ? <Chip size="small" sx={{ marginLeft: 1 }} label={t(document_status).toUpperCase()} title={t(document_status).toUpperCase()} color={document_status?.toLowerCase() === 'active' ? 'success' : 'info'} /> : null}
                    </div>
                  )
                }}
              />
              {documentState.document_type === "TWI" && (

                <Alert severity="info" fontSize={14} sx={{ marginY: 1 }}>
                  {t("related_documents_twi_alert")}
                </Alert>
              )}
            </Grid>
            <Grid item xs="4">
              <p>{t("training_methodology")}: </p>
              <Select
                onChange={handleMetadataChange}
                name={"training_method"}
                required
                isDisabled={isEditing && changeType !== 'content'}
                label={"Training methodology"}
                placeholder={t("training_methodology")}
                className="basic-single-select"
                classNamePrefix="select"
                options={docTrainingTypes}
                value={
                  docTrainingTypesData?.filter((item) => item.key === documentState["training_method"]).length > 0 ?
                    {
                      "value": documentState["training_method"],
                      "label": docTrainingTypesData?.filter((item) => item.key === documentState["training_method"])[0][isHun ? "hu" : "en"]
                    } :
                    null
                }
              />
            </Grid>
            {/*  <p>{JSON.stringify(trainingRef.current, null, 2)}</p> */}
            <Grid item xs="4">
              <p>{t("training_deadline")}: </p>
              <MuiTextField
                className="training-deadline-textfield"
                sx={{ width: "100%" }}
                label=""
                disabled={isEditing && changeType !== 'content'}
                value={documentState.training_deadline}
                onChange={(e) => {
                  dispatch({
                    type: "CHANGE_INPUT",
                    payload: {
                      name: "training_deadline",
                      value: parseInt(e.target.value)
                    },
                  })
                }}
                name="numberformat"
                id="formatted-numberformat-input"
                variant="outlined"
                type="number"
                InputProps={{
                  inputProps: { min: 0, max: 365 },
                  endAdornment: <InputAdornment
                    position="start"
                    sx={{ margin: "1rem" }}>
                    {t("days")}
                  </InputAdornment>
                }}

              />
            </Grid>

            {(isMigrating || isDocumentResponsible) && (
              <Grid item xs="4">
                <div className="initial-form-creator">
                  <p>{t("creator")}: </p>
                  <Select
                    placeholder={t("creator")}
                    name="creator"
                    options={filteredUsers}
                    required
                    // szerkesztés -> isEditing = true, isDocumentResponsible = false --> true
                    // feltöltés -> isEditing = false, isDocumentResponsible = false --> false
                    // feltöltés felelősként -> isEditing = false, isDocumentResponsible = true --> true
                    // szerkesztés felelősként -> isEditing = true, isDocumentResponsible = true --> false itt kellene false
                    isDisabled={isCreatorDisabled}
                    className="basic-single"
                    classNamePrefix="select"
                    onInputChange={(value) => handleLiveSearchInputChange(value, setUserQuery)}
                    onChange={handleUserSelect}
                    isLoading={isUserSearchPending}
                    value={transformData(documentState.creator_name)}
                    noOptionsMessage={() => userNoOptionsMessage}
                  />
                </div>
              </Grid>
            )}

            <Grid item xs="4">
              <div className="initial-form-editor">
                <p>{t("allowed_editors")}: </p>
                <Select
                  placeholder={t("allowed_editors")}
                  isMulti
                  closeMenuOnSelect={false}
                  name={"allowed_editors"}
                  options={filteredEditors}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  onInputChange={(value) => handleLiveSearchInputChange(value, setEditorQuery)}
                  onChange={handleMultiSelectLiveSearch}
                  isLoading={isEditorSearchPending}
                  value={documentState["allowed_editors"].map((item) => {
                    return { value: item.userid, label: item.name };
                  })}
                  noOptionsMessage={() => userNoOptionsMessage}
                />
              </div>
            </Grid>
          </Grid>
        </Box>
        <Button
          type="submit"
          variant="contained"
          disabled={documentIdAlreadyExistsError}
          sx={{ float: "right", width: "12rem" }}
          startIcon={<ArrowForwardIosIcon />}
        >
          {t("next_step")}
        </Button>
      </form>
      {missingChangeType && (
        <DSTooltip
          message="Please select a change type!"
          type="alert-warning"
        />
      )}
    </React.Fragment>
  );
};

export default Initial;
