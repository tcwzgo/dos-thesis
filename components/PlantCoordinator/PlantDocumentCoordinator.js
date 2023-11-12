import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Typography,
  TextField,
  Box,
  IconButton,
  Switch,
  Grid,
  Table,
  TableCell,
  TableRow,
  TableBody,
  TableHead,
  Paper,
  TableContainer,
  Alert,
  Fab,
  Dialog,
  DialogContent,
  DialogTitle,
  Chip,
  Container,
  DialogActions,
} from "@mui/material";
import Select from "react-select";
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Save } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import api from "../../axios_conf.js";
import { roles } from "../utils.js";

const PlantDocumentCoordinator = () => {

  const fieldStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "3.5rem",

    })
  }


  const { t } = useTranslation();

  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const [documentTypes, setDocumentTypes] = useState([]);
  const [trainingMethodologies, setTrainingMetholologies] = useState([]);
  const [selectedDocumentTypes, setSelectedDocumentTypes] = useState([]);

  const [dataSecurityClasses, setDataSecurityClasses] = useState([]);

  const [roleSettingModalShown, setRoleSettingModalShown] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);
  const [roleOptions, setRoleOptions] = useState([]);

  const newDocumentTypeRef = useRef()
  const newTrainingMethodsHuRef = useRef()
  const newTrainingMethodsEnRef = useRef()
  const newDataSecurityClassRef = useRef()

  const [directiveName, setDirectiveName] = useState("");

  const [coverSheetContent, setCoverSheetContent] = useState({
    directiveName: "",
    versionField: "",
  });

  useEffect(() => {
    const tempRoles = Object.keys(roles).map((key) => {
      return {
        value: roles[key].idmDisplayName,
        label: roles[key].name,
      };
    }).sort((a, b) => a.label.localeCompare(b.label));
    setRoleOptions(tempRoles);
  }, [])


  const getConfig = () => {
    api().get("/api/admin/config").then((res) => {
      setDocumentTypes(res.data.document_types.map((docType) => ({ isPersisted: true, isChanged: false, ...docType })));
      setTrainingMetholologies(res.data.training_methods.map((trainingMethodology) => ({ isPersisted: true, isChanged: false, ...trainingMethodology })));
      setDataSecurityClasses(res.data.data_security.map((dataSecurityClass) => ({ isPersisted: true, isChanged: false, ...dataSecurityClass })));
      setDirectiveName(res.data.directive);
    });
  }

  const saveChanges = () => {
    let docTypes = documentTypes.map((docType) => {
      docType.approver_roles = docType.approver_roles.map((level) => {
        level.roles = level.roles?.filter((role) => role !== null)
        return level
      })
      docType.approver_roles = docType.approver_roles.filter((level) => level.roles?.length > 0)
      return docType
    }).filter((docType) => docType.isChanged)

    docTypes=docTypes.map((docType) => {
      let index=0;
      docType.approver_roles = docType.approver_roles.map((level) => {
        level.level = index + 1;
        index++;
        return level
      })
      return docType
    })

    const data = {
      document_types: docTypes,
      training_methods: trainingMethodologies.filter((trainingMethodology) => trainingMethodology.isChanged),
      data_security: dataSecurityClasses.filter((dataSecurityClass) => dataSecurityClass.isChanged),
      directive: directiveName,
    }
    setUnsavedChanges(false);
    api().post("/api/admin/config", data).then((res) => {
      getConfig()
    });
  }

  useEffect(() => {
    if (documentTypes.length === 0) {
      getConfig()
    }
  }, []);

  const handleToggleDocumentType = (docType) => {
    const newDocumentTypes = [...documentTypes];
    const index = newDocumentTypes.indexOf(docType);
    newDocumentTypes[index].active = !newDocumentTypes[index].active;
    newDocumentTypes[index].isChanged = true;
    setDocumentTypes(newDocumentTypes);
    setUnsavedChanges(true);
  };

  const handleToggleDepartmentLevel = (docType) => {
    const newDocumentTypes = [...documentTypes];
    const index = newDocumentTypes.indexOf(docType);
    newDocumentTypes[index].department_level = !newDocumentTypes[index].department_level;
    newDocumentTypes[index].isChanged = true;
    setDocumentTypes(newDocumentTypes);
    setUnsavedChanges(true);
  };

  const handleToggleSearchability = (docType) => {
    const newDocumentTypes = [...documentTypes];
    const index = newDocumentTypes.indexOf(docType);
    newDocumentTypes[index].searchable = !newDocumentTypes[index].searchable;
    newDocumentTypes[index].isChanged = true;
    setDocumentTypes(newDocumentTypes);
    setUnsavedChanges(true);
  };

  const handleToggleTrainingMethodActive = (trainingMethod) => {
    const newTrainingMethods = [...trainingMethodologies];
    const index = newTrainingMethods.indexOf(trainingMethod);
    newTrainingMethods[index].active = !newTrainingMethods[index].active;
    newTrainingMethods[index].isChanged = true;
    setTrainingMetholologies(newTrainingMethods);
    setUnsavedChanges(true);
  };

  const handleToggleTrainingMethodMaterial = (trainingMethod) => {
    const newTrainingMethods = [...trainingMethodologies];
    const index = newTrainingMethods.indexOf(trainingMethod);
    newTrainingMethods[index].training_questionnaire_mandatory = !newTrainingMethods[index].training_questionnaire_mandatory;
    newTrainingMethods[index].isChanged = true;
    setTrainingMetholologies(newTrainingMethods);
    setUnsavedChanges(true);
  };

  const handleDocumentTypesChanged = (selectedOptions, trainingMethod) => {
    const newTrainingMethods = [...trainingMethodologies];
    const index = newTrainingMethods.indexOf(trainingMethod);
    newTrainingMethods[index].relevant_document_types = selectedOptions.map((dt) => dt.value);
    newTrainingMethods[index].isChanged = true;
    setTrainingMetholologies(newTrainingMethods);
    setUnsavedChanges(true);
  }


  const handleToggleDataSecurity = (dataSecurityClass) => {
    const newDataSecurityClasses = [...dataSecurityClasses];
    const index = newDataSecurityClasses.indexOf(dataSecurityClass);
    newDataSecurityClasses[index].active = !newDataSecurityClasses[index].active;
    newDataSecurityClasses[index].isChanged = true;
    setDataSecurityClasses(newDataSecurityClasses);
    setUnsavedChanges(true);
  };

  const handleAddDocumentType = () => {
    const newDocumentTypes = [...documentTypes];
    const newDocumentType = newDocumentTypeRef.current.value.trim();
    if (newDocumentType !== "") {
      newDocumentTypes.push({
        name: newDocumentType,
        active: true,
        isChanged: true,
        isPersisted: false
      });
      setDocumentTypes(newDocumentTypes);
      newDocumentTypeRef.current.value = null
      setUnsavedChanges(true);
    }
  };

  const handleAddTrainingMethod = () => {
    const newTrainingMethods = [...trainingMethodologies];
    const newTrainingMethodHu = newTrainingMethodsHuRef.current.value.trim();
    const newTrainingMethodEn = newTrainingMethodsEnRef.current.value.trim();

    if (newTrainingMethodHu !== "" && newTrainingMethodEn !== "") {
      newTrainingMethods.push({
        key: newTrainingMethodEn.replace(" ", "_").replace("-", "").toLowerCase(),
        hu: newTrainingMethodHu,
        en: newTrainingMethodEn,
        relevant_document_types: selectedDocumentTypes.map((dt) => dt.value),
        active: true,
        isPersisted: false,
        isChanged: true
      });
      setTrainingMetholologies(newTrainingMethods);
      newTrainingMethodsHuRef.current.value = null
      newTrainingMethodsEnRef.current.value = null
      setSelectedDocumentTypes([])
      setUnsavedChanges(true);
    }
  };

  const handleAddDataSecurityClass = () => {
    const newDataSecurityClasses = [...dataSecurityClasses];
    const newDataSecurityClass = newDataSecurityClassRef.current.value.trim();
    if (newDataSecurityClass !== "") {
      newDataSecurityClasses.push({
        name: newDataSecurityClass,
        active: true,
        isPersisted: false,
        isChanged: true
      });
      setDataSecurityClasses(newDataSecurityClasses);
      newDataSecurityClassRef.current.value = null
      setUnsavedChanges(true);
    }

  };

  return (
    <>

      <Dialog open={roleSettingModalShown} onClose={() => {
        setRoleSettingModalShown(false)
        setSelectedDocumentType(null)
      }}
        fullWidth={true}
        maxWidth="sm"

      >
        <DialogTitle><Chip label={selectedDocumentType?.name} sx={{ marginX: "1rem" }}></Chip>{t("approver_roles")}</DialogTitle>
        <DialogContent>
          {selectedDocumentType?.approver_roles?.map((level) => (
            <Grid container sx={{
              border: "1px solid grey",
              borderRadius: "10px",
              marginY: "1rem",
              padding: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",

            }}>
              <Grid item xs={12}>
                <Typography variant="body1" align="center">
                  {t("level")} {level.level}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Grid container >
                  {level?.roles?.map((role) => (
                    <Grid item xs={12} sx={{
                      "&:hover": {
                        backgroundColor: "grey.200",
                        borderRadius: "20px",
                      }
                    }}>
                      <Grid container>
                        <Grid item xs={11} sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "start",
                          padding: "1rem",

                        }}>
                          {role ?
                            (<Typography variant="body1" align="center">
                              {Object.keys(roles).map((key) => {
                                return roles[key]
                              }).find((r) => r.idmDisplayName === role).name}
                            </Typography>)
                            :
                            (
                              <Select
                                menuPlacement="auto"
                                menuPosition="fixed"
                                styles={{
                                  menuPortal: base => ({ ...base, zIndex: 9999 }),
                                  control: (base, state) => ({
                                    ...base,
                                    marginRight: "5px",
                                    marginBottom: "5px",
                                    width: "100%",
                                  }),
                                  container: (base, state) => ({
                                    ...base,
                                    width: "100%",
                                  }),
                                }}
                                menuPortalTarget={document.body}
                                sx={{
                                  zIndex: 999
                                }}
                                value={null}
                                onChange={(e) => {
                                  const newDocumentTypes = [...documentTypes];
                                  const index = newDocumentTypes.indexOf(selectedDocumentType);
                                  newDocumentTypes[index].approver_roles[level.level - 1].roles[newDocumentTypes[index].approver_roles[level.level - 1].roles.indexOf(role)] = e.value;
                                  newDocumentTypes[index].isChanged = true;
                                  setDocumentTypes(newDocumentTypes);
                                  setUnsavedChanges(true);
                                  setSelectedDocumentType(documentTypes.find((docType) => docType.name === selectedDocumentType.name));
                                }}

                                options={roleOptions.filter((option) => !level.roles.includes(option.value))}

                              />

                            )}
                        </Grid>
                        <Grid item xs={1} sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          <IconButton
                            aria-label="delete"
                            sx={{
                              color: "error.main"
                            }}
                            onClick={() => {
                              const newDocumentTypes = [...documentTypes];
                              const index = newDocumentTypes.indexOf(selectedDocumentType);
                              newDocumentTypes[index].approver_roles[level.level - 1].roles.splice(newDocumentTypes[index].approver_roles[level.level - 1].roles.indexOf(role), 1);
                              newDocumentTypes[index].isChanged = true;
                              setDocumentTypes(newDocumentTypes);
                              setUnsavedChanges(true);
                              setSelectedDocumentType(documentTypes.find((docType) => docType.name === selectedDocumentType.name));

                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Grid>))}
                  <Grid item xs={12}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "1rem",
                    }}>
                    <Button startIcon={<AddIcon />} variant="outlined"
                      sx={{
                        borderRadius: "20px",
                      }}
                      disabled={selectedDocumentType === null || documentTypes.find((docType) => docType.name === selectedDocumentType.name).approver_roles?.find((l) => l.level === level.level).roles?.filter((val) => val === null)?.length !== 0}

                      onClick={() => {
                        documentTypes.find((docType) => docType.name === selectedDocumentType.name).approver_roles.find((l) => l.level === level.level).roles.push(null);
                        const newDocumentTypes = [...documentTypes];
                        setDocumentTypes(newDocumentTypes);
                        setUnsavedChanges(true);
                      }
                      }
                    >{t("add_role_to_level")}</Button>
                  </Grid>
                </Grid>
              </Grid>

            </Grid>
          ))}
          <Container sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Button startIcon={<AddIcon />} variant="outlined"
              sx={{
                borderRadius: "20px",
              }}
              disabled={selectedDocumentType === null || documentTypes.find((docType) => docType.name === selectedDocumentType.name)
                .approver_roles[documentTypes.find((docType) => docType.name === selectedDocumentType.name).approver_roles.length - 1]?.roles?.filter((val) => val !== null).length === 0}
              onClick={() => {
                documentTypes.find((docType) => docType.name === selectedDocumentType.name).approver_roles.push({
                  "level": documentTypes.find((docType) => docType.name === selectedDocumentType.name).approver_roles.length + 1,
                  "roles": []
                });
                const newDocumentTypes = [...documentTypes];
                setDocumentTypes(newDocumentTypes);
                setUnsavedChanges(true);
              }
              }
            >{t("add_level")}</Button>
          </Container>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setRoleSettingModalShown(false)
            setSelectedDocumentType(null)
          }} color="primary">
            {t("done")}
          </Button>
        </DialogActions>
      </Dialog>

      <Typography variant="h4" align="center">
        {t("plant_document_coordinator_page")}
      </Typography>

      <Box
        sx={{
          justifyContent: "center",
        }}
      >
        <Grid container xs={12}>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                boxShadow: 5,
                margin: 5,
                padding: 2,
              }}
            >
              <Grid
                container
                xs={12}
              >
                <Grid item xs={12}>
                  <Typography variant="body1" align="center">
                    {t("document_type")}
                  </Typography>
                </Grid>
                <Grid item xs={12}>

                  <TableContainer component={Paper} sx={{ height: "350px", marginY: "1rem" }} >
                    <Table stickyHeader aria-label="caption table">
                      <TableHead>
                        <TableRow>
                          <TableCell
                            variant="head"
                            style={{ width: 100 }}
                          >{t("name")}</TableCell>
                          <TableCell style={{ width: 100 }} align="right">{t("department_level")}</TableCell>
                          <TableCell style={{ width: 100 }} align="right">{t("searchable")}</TableCell>
                          <TableCell style={{ width: 100 }} align="right">{t("active")}</TableCell>
                          <TableCell style={{ width: 100 }} align="right">{t("approver_roles")}</TableCell>
                          <TableCell style={{ width: 100 }} align="right">{t("delete")}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody sx={{}}>
                        {documentTypes.map((docType) => (
                          <TableRow key={docType.name} >
                            <TableCell component="th" scope="row">
                              {docType.name}
                            </TableCell>
                            <TableCell align="right">
                              <Switch checked={docType.department_level} onChange={() => handleToggleDepartmentLevel(docType)} />
                            </TableCell>
                            <TableCell align="right">
                              <Switch checked={docType.searchable} onChange={() => handleToggleSearchability(docType)} />
                            </TableCell>
                            <TableCell align="right">
                              <Switch checked={docType.active} onChange={() => handleToggleDocumentType(docType)} />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={() => {
                                  setRoleSettingModalShown(true);
                                  setSelectedDocumentType(docType);
                                }}
                              >
                                <EditIcon />
                              </IconButton>

                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                edge="end"
                                aria-label="delete"
                                disabled={docType.isPersisted}
                                onClick={() => {
                                  const newDocumentTypes = [...documentTypes];
                                  const index = newDocumentTypes.indexOf(docType);
                                  newDocumentTypes.splice(index, 1);
                                  setDocumentTypes(newDocumentTypes);

                                }}
                              >
                                <DeleteIcon />
                              </IconButton>

                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "1rem",
                  }}
                >
                  <TextField
                    inputRef={newDocumentTypeRef}
                    label={t("new_document_type")}
                    variant="outlined"
                  />
                  <Button variant="contained" onClick={handleAddDocumentType} sx={{ marginLeft: "1rem" }}>
                    <AddIcon />
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Alert severity="info">{t("document_type_info")}</Alert>
                </Grid>
              </Grid>
            </Box>

          </Grid>



          <Grid item xs={12} md={6}>
            <Box
              sx={{
                boxShadow: 5,
                margin: 5,
                padding: 2,
              }}
            >
              <Grid
                container
                xs={12}
              >
                <Grid item xs={12}>
                  <Typography variant="body1" align="center">
                    {t("document_security")}
                  </Typography>
                </Grid>
                <Grid item xs={12}>

                  <TableContainer component={Paper} sx={{ height: "350px", marginY: "1rem" }} >
                    <Table stickyHeader aria-label="caption table">
                      <TableHead>
                        <TableRow>
                          <TableCell
                            variant="head"
                            style={{ width: 100 }}
                          >{t("name")}</TableCell>
                          <TableCell style={{ width: 100 }} align="right">{t("active")}</TableCell>
                          <TableCell style={{ width: 100 }} align="right">{t("delete")}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody sx={{}}>
                        {dataSecurityClasses.map((dsc) => (
                          <TableRow key={dsc.name} >
                            <TableCell component="th" scope="row">
                              {dsc.name}
                            </TableCell>
                            <TableCell align="right">
                              <Switch checked={dsc.active} onChange={() => handleToggleDataSecurity(dsc)} />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                edge="end"
                                aria-label="delete"
                                disabled={dsc.isPersisted}
                                onClick={() => {
                                  const newDsc = [...dataSecurityClasses];
                                  const index = newDsc.indexOf(dsc);
                                  newDsc.splice(index, 1);
                                  setDataSecurityClasses(newDsc);
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>

                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "1rem",
                  }}
                >
                  <TextField
                    inputRef={newDataSecurityClassRef}
                    label={t("new_data_security_class")}
                    variant="outlined"
                  />
                  <Button variant="contained" onClick={handleAddDataSecurityClass} sx={{ marginLeft: "1rem" }}>
                    <AddIcon />
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Alert severity="info">{t("data_security_info")}</Alert>
                </Grid>
              </Grid>
            </Box>

          </Grid>
          <Grid item xs={12}>
            <Box
              sx={{
                boxShadow: 5,
                margin: 5,
                padding: 2,
              }}
            >
              <Grid
                container
                xs={12}
              >
                <Grid item xs={12}>
                  <Typography variant="body1" align="center">
                    {t("training_methodology")}
                  </Typography>
                </Grid>
                <Grid item xs={12}>

                  <TableContainer component={Paper} sx={{ height: "350px", marginY: "1rem" }} >
                    <Table stickyHeader aria-label="caption table">
                      <TableHead>
                        <TableRow>
                          <TableCell
                            variant="head"
                          >{t("hungarian_name")}</TableCell>
                          <TableCell
                            variant="head"
                          >{t("english_name")}</TableCell>
                          <TableCell
                            variant="head"
                          >{t("document_types")}</TableCell>
                          <TableCell align="right">{t("training_questionnaire_mandatory")}</TableCell>
                          <TableCell align="right">{t("active")}</TableCell>
                          <TableCell align="right">{t("delete")}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody sx={{}}>
                        {trainingMethodologies.map((trainingMethod) => (
                          <TableRow key={trainingMethod.key} >
                            <TableCell component="th" scope="row">
                              {trainingMethod.hu}
                            </TableCell>
                            <TableCell component="th" scope="row">
                              {trainingMethod.en}
                            </TableCell>
                            <TableCell component="th" scope="row">
                              <Select
                                options={documentTypes.map((dt) => ({ value: dt.name, label: dt.name }))}
                                isMulti
                                value={trainingMethod.relevant_document_types.map((dt) => ({ value: dt, label: dt }))}
                                closeMenuOnSelect={false}
                                onChange={(e) => handleDocumentTypesChanged(e, trainingMethod)}
                                name="document_types"
                                className="basic-multi-select"
                                classNamePrefix="select"
                                placeholder={t("document_types")}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Switch checked={trainingMethod.training_questionnaire_mandatory} onChange={() => handleToggleTrainingMethodMaterial(trainingMethod)} />
                            </TableCell>
                            <TableCell align="right">
                              <Switch checked={trainingMethod.active} onChange={() => handleToggleTrainingMethodActive(trainingMethod)} />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                edge="end"
                                aria-label="delete"
                                disabled={trainingMethod.isPersisted}
                                onClick={() => {
                                  const newTrainingMethods = [...trainingMethodologies];
                                  const index = newTrainingMethods.indexOf(trainingMethod);
                                  newTrainingMethods.splice(index, 1);
                                  setTrainingMetholologies(newTrainingMethods);
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>

                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12}

                >
                  <Grid container spacing={2} sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "1rem",
                  }}>
                    <Grid item xs={6} md={3}>
                      <TextField
                        inputRef={newTrainingMethodsHuRef}
                        label={t("hungarian_name")}
                        variant="outlined"
                        sx={{ width: "100%" }}
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>

                      <TextField
                        inputRef={newTrainingMethodsEnRef}
                        label={t("english_name")}
                        variant="outlined"
                        sx={{ width: "100%" }}

                      />
                    </Grid>
                    <Grid item xs={6} md={4}>
                      <Select
                        options={documentTypes.map((dt) => ({ value: dt.name, label: dt.name }))}
                        isMulti
                        styles={fieldStyles}
                        value={selectedDocumentTypes}
                        closeMenuOnSelect={false}
                        onChange={(e) => setSelectedDocumentTypes(e)}
                        name="document_types"
                        className="basic-multi-select"
                        classNamePrefix="select"
                        placeholder={t("document_types")}
                      />
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <Button variant="contained" onClick={handleAddTrainingMethod} sx={{ marginLeft: "1rem" }}>
                        <AddIcon />
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Alert severity="info">{t("training_method_info")}</Alert>
                </Grid>
              </Grid>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                boxShadow: 5,
                margin: 5,
                padding: 2,
              }}
            >
              <Grid
                container
                xs={12}
              >
                <Grid item xs={12}>
                  <Typography variant="body1" align="center">
                    {t("cover_sheet_info")}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={2} sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginY: "1rem",
                  }}>
                    <Grid item xs={12}>
                      <TextField
                        value={directiveName}
                        helperText={t("cover_sheet_info_helper")}
                        onChange={(e) => {
                          setDirectiveName(e.target.value)
                          setUnsavedChanges(true);
                        }
                        }
                        label={t("directive_name")}
                        variant="outlined"
                        sx={{ width: "100%" }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>

          </Grid>


        </Grid>
      </Box>
      <Box sx={{
        position: 'fixed',
        bottom: '20px',
        zIndex: '1000',
        right: '20px',
        '& > :not(style)': {
          m: 1
        }
      }}>
        <Fab variant="extended" size="large" color="success" disabled={!unsavedChanges} onClick={saveChanges}>
          <Save sx={{ mr: 1 }} />
          {t("save")}
        </Fab>
      </Box>
    </>
  );
};

export default PlantDocumentCoordinator;
