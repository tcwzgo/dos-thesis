import {
  Grid,
  Stack,
  TextField as MuiTextField,
  Typography,
  Switch,
  FormControlLabel
} from "@mui/material";
import Select from "react-select";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import moment from "moment";
import React, { useState, useContext, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DocumentBrowserContext, fieldStyles } from "./DocumentBrowser";
import { UserContext } from "../../App";
import axios from "axios";
import api from "../../axios_conf";
import { hasRole, ROLES } from "../utils";

const DocumentBrowserOptionalFilters = ({
  isArchive,
  addedRelatedDocs,
  setAddedRelatedDocs,
}) => {
  const { storageState, dispatch } = useContext(DocumentBrowserContext);
  const { t, i18n } = useTranslation();
  const isHun = ["hu", "HU", "hu-HU"].includes(i18n.language)
  const { loggedUserId, loggedUserIdmRole, isSuperuser } =
    useContext(UserContext);
  const [docTypes, setDocTypes] = useState([]);
  const [dataSecurityOptions, setDataSecurityOptions] = useState([]);
  const [docTrainingTypes, setDocTrainingTypes] = useState([]);
  const [docTrainingTypesData, setDocTrainingTypesData] = useState([]);

  const [departments, setDepartments] = useState([]);
  const [products, setProducts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [areas, setAreas] = useState([]);
  const [relevantStations, setRelevantStations] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isUserSearchPending, setIsUserSearchPending] = useState(false);
  const [isRelatedDocsPending, setIsRelatedDocsPending] = useState(false);
  const [relatedDocuments, setRelatedDocuments] = useState([]);
  const [userNoOptionsMessage, setUserNoOptionsMessage] = useState(
    t("please_type_more_letters")
  );
  const [userQuery, setUserQuery] = useState("");
  const [relatedDocumentsQuery, setRelatedDocumentsQuery] = useState("");

  const getConfig = () => {
    api()
      .get("/api/admin/config")
      .then((res) => {
        if (isArchive) {
          setDocTypes(
            res.data.document_types.map((docType) => ({
              value: docType.name,
              label: docType.name,
            }))
          );
        } else {
          setDocTypes(
            res.data.document_types
              .filter((docType) => docType.searchable)
              .map((docType) => ({ value: docType.name, label: docType.name }))
          );
        }
        setDocTrainingTypesData(res.data.training_methods);
        setDataSecurityOptions(
          res.data.data_security.map((dataSecurityClass) => ({
            value: dataSecurityClass.name,
            label: dataSecurityClass.name,
          }))
        );
      });
  };

  useEffect(() => {
    if (isHun) {
      setDocTrainingTypes(
        docTrainingTypesData.map((docTrainingType) => ({
          value: docTrainingType.key,
          label: docTrainingType.hu,
        }))
      );
    } else {
      setDocTrainingTypes(
        docTrainingTypesData.map((docTrainingType) => ({
          value: docTrainingType.key,
          label: docTrainingType.en,
        }))
      );
    }
  }, [docTrainingTypesData, i18n.language]);

  useEffect(() => {
    getConfig();
  }, [isArchive]);

  const addOptionalFilter = (values, action) => {
    dispatch({
      type: "ADD_FILTER",
      payload: {
        name: action.name,
        value: values,
      },
    });
  };

  const addOption = (name, value) => {
    dispatch({
      type: "ADD_OPTION",
      payload: {
        name: name,
        value: value,
      },
    });
  };

  const clearDate = () => {
    dispatch({
      type: "ADD_FILTER",
      payload: {
        name: "expiration_start",
        value: null,
      },
    });
    dispatch({
      type: "ADD_FILTER",
      payload: {
        name: "expiration_end",
        value: null,
      },
    });
  };
  const searchUser = (value) => {
    if (value.length < 3) {
      setUserNoOptionsMessage(t("please_type_more_letters"));
    } else {
      setUserNoOptionsMessage(t("no_result"));
    }
    setUserQuery(value);
  };
  const handleRelatedDocsChange = (documents) => {
    setAddedRelatedDocs(documents);
    dispatch({
      type: "ADD_FILTER",
      payload: {
        name: "related_documents",
        value: documents.map((document) => document.value),
      },
    });
  };
  const searchRelatedDocument = (value) => {
    if (value.length < 3) {
      setUserNoOptionsMessage(t("please_type_more_letters"));
      return;
    } else {
      setUserNoOptionsMessage(t("no_result"));
    }
    setRelatedDocumentsQuery(value);
  };
  const transformRelatedDocs = (docs) => {
    const temp = [];
    for (const doc of docs.data) {
      temp.push({
        value: doc.id,
        label: doc.document_id + " - " + doc.document_name,
      });
    }
    return temp;
  };
  const transformUserData = (userData) => {
    const temp = [];
    for (const record of userData) {
      temp.push({
        value: record.userPrincipalName.split("@")[0],
        label: record.displayName,
      });
    }
    return temp;
  };
  function getDepartmentsFromLocationStore() {
    axios
      .get(process.env.REACT_APP_LOS_API_ENDPOINT + `/api/departments`)
      .then((res) => {
        setDepartments(res.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }
  const getRolesFromAssignmentStore = useCallback(() => {
    api().get(`/api/asm/get-roles?department=[${storageState.filter.departments
      .map((d) => d.value)
      .join(",")}]&area=[${storageState.filter.areas
      .map((d) => d.value)
      .join(",")}]`,)
    .then((res) => {
      setRoles(
        res.data.map((item) => {
          return { value: item.id, label: item.name };
        })
      );
    })
    .catch((error) => {
      console.error(error);
    });
  }, [storageState.filter.areas, storageState.filter.departments]);
  useEffect(() => {
    if (roles.length === 0) {
      getRolesFromAssignmentStore();
    }
  }, [
    storageState.filter.departments,
    storageState.filter.areas,
    getRolesFromAssignmentStore,
  ]);
  useEffect(() => {
    if (roles.length === 0) {
      getRolesFromAssignmentStore();
    }
  }, [getRolesFromAssignmentStore, roles]);
  useEffect(() => {
    if (departments.length === 0) {
      getDepartmentsFromLocationStore();
    }
  }, [departments]);
  const getAreasFromLocationStore = useCallback(() => {
    let filter = "";
    if (storageState.filter.departments.length > 0) {
      filter = `?department=${storageState.filter.departments
        .map((d) => d.value)
        .join(",")}`;
    }
    axios
      .get(process.env.REACT_APP_LOS_API_ENDPOINT + `/api/areas/${filter}`)
      .then((res) => {
        let data = res.data.map(({ name, id }) => ({
          label: name,
          value: id,
        }));
        setAreas(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [storageState.filter.departments]);
  const getProductsFromLocationStore = useCallback(() => {
    let filter = "";
    if (storageState.filter.areas.length > 0) {
      filter = `?area_id=${storageState.filter.areas
        .map((d) => d.value)
        .join(",")}`;
    }
    axios
      .get(process.env.REACT_APP_LOS_API_ENDPOINT + `/api/products${filter}`)
      .then((res) => {
        setProducts(res.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [storageState.filter.areas]);
  const getRelevantStationsFromLocationStore = useCallback(() => {
    const mappedAreas =
      storageState.filter.areas.length > 0
        ? `areas=${storageState.filter.areas.map((d) => d.value).join(",")}`
        : "";
    const mappedDepartments =
      storageState.filter.departments.length > 0
        ? `departments=${storageState.filter.departments
            .map((d) => d.value)
            .join(",")}`
        : "";

    axios
      .get(
          process.env.REACT_APP_LOS_API_ENDPOINT + `/api/locations/?${mappedDepartments}&${mappedAreas}`
      )
      .then((res) => {
        setRelevantStations(res.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [
    storageState.filter.product_family,
    storageState.filter.departments,
    storageState.filter.areas,
  ]);
  useEffect(() => {
    getAreasFromLocationStore();
    getProductsFromLocationStore();
    getRelevantStationsFromLocationStore();
  }, [
    storageState,
    getAreasFromLocationStore,
    getProductsFromLocationStore,
    getRelevantStationsFromLocationStore,
  ]);
  useEffect(() => {
    const controller = new AbortController();
    const filter = isArchive ? {} : { document_status: ["active"] };
    if (relatedDocumentsQuery === "") {
      setIsRelatedDocsPending(false);
    } else {
      const body = {
        group_by_version: true,
        search: {
          query: relatedDocumentsQuery,
          find_in_document_body: false,
        },
        filter,
      };

      setIsRelatedDocsPending(true);

      api(isSuperuser, loggedUserIdmRole)
        .post(`/api/documents/search?limit=100&page=1`, body, {
          signal: controller.signal,
        })
        .then((res) => {
          setRelatedDocuments(transformRelatedDocs(res.data));
          setIsRelatedDocsPending(false);
        })
        .catch((err) => {
          setIsRelatedDocsPending(false);
        });
    }
  }, [relatedDocumentsQuery]);

  useEffect(() => {
    setRelatedDocuments([]);
    setAddedRelatedDocs([]);
    dispatch({
      type: "ADD_FILTER",
      payload: {
        name: "related_documents",
        value: [],
      },
    });
  }, [isArchive]);

  useEffect(() => {
    const controller = new AbortController();
    if (userQuery === "") {
      setIsUserSearchPending(false);
      setFilteredUsers([]);
    } else {
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
    }
    return () => controller.abort();
  }, [userQuery]);

  return (
    <Grid container spacing={1} style={{ marginBottom: "2rem" }}>
      <Grid item xs={3}>
        <Select
          options={docTypes}
          styles={fieldStyles}
          isMulti
          value={storageState.filter.document_type}
          closeMenuOnSelect={false}
          onChange={addOptionalFilter}
          name="document_type"
          className="basic-multi-select"
          classNamePrefix="select"
          placeholder={t("document_type")}
        />
      </Grid>
      <Grid item xs={3}>
        <Select
          options={roles}
          styles={fieldStyles}
          isMulti
          closeMenuOnSelect={false}
          value={storageState.filter.affected_roles}
          onChange={addOptionalFilter}
          name="affected_roles"
          className="basic-multi-select"
          classNamePrefix="select"
          placeholder={t("related_roles")}
        />
      </Grid>
      <Grid item xs={3}>
        <Select
          options={docTrainingTypes}
          styles={fieldStyles}
          isMulti
          closeMenuOnSelect={false}
          value={storageState.filter.training_method}
          onChange={addOptionalFilter}
          name="training_method"
          className="basic-multi-select"
          classNamePrefix="select"
          placeholder={t("training_methodology")}
        />
      </Grid>
      <Grid item xs={3}>
        <Select
          styles={fieldStyles}
          placeholder={t("creator")}
          name="creator"
          isDisabled={loggedUserId === "" ? true : false}
          isMulti
          options={filteredUsers}
          value={storageState.filter.creator}
          className="basic-single"
          classNamePrefix="select"
          onInputChange={searchUser}
          onChange={addOptionalFilter}
          isLoading={isUserSearchPending}
          defaultInputValue={""}
          noOptionsMessage={() => userNoOptionsMessage}
        />
      </Grid>
      <Grid item xs={3}>
        <Select
          options={departments}
          styles={fieldStyles}
          isMulti
          value={storageState.filter.publisher_departments}
          closeMenuOnSelect={false}
          onChange={addOptionalFilter}
          name="publisher_department"
          className="basic-multi-select"
          classNamePrefix="select"
          placeholder={t("select_publisher_departments")}
        />
      </Grid>
      <Grid item xs={3}>
        <Select
          options={departments}
          styles={fieldStyles}
          isMulti
          value={storageState.filter.departments}
          closeMenuOnSelect={false}
          onChange={addOptionalFilter}
          name="departments"
          className="basic-multi-select"
          classNamePrefix="select"
          placeholder={t("select_relevant_departments")}
        />
      </Grid>
      <Grid item xs={3}>
        <Select
          options={areas}
          styles={fieldStyles}
          isMulti
          value={storageState.filter.areas}
          closeMenuOnSelect={false}
          onChange={addOptionalFilter}
          name="areas"
          className="basic-multi-select"
          classNamePrefix="select"
          placeholder={t("areas")}
        />
      </Grid>
      <Grid item xs={3}>
        <Select
          options={products}
          styles={fieldStyles}
          isMulti
          closeMenuOnSelect={false}
          value={storageState.filter.product_family}
          onChange={addOptionalFilter}
          name="product_family"
          className="basic-multi-select"
          classNamePrefix="select"
          placeholder={t("products")}
        />
      </Grid>
      <Grid item xs={3}>
        <Select
          options={relevantStations}
          styles={fieldStyles}
          isMulti
          closeMenuOnSelect={false}
          value={storageState.filter.locations}
          onChange={addOptionalFilter}
          name="locations"
          className="basic-multi-select"
          classNamePrefix="select"
          placeholder={t("relevant_stations")}
        />
      </Grid>
      {hasRole(loggedUserIdmRole, [ROLES.SUPERUSER])
        ?
        <>
          <Grid item xs={3}>
            <Select
              options={dataSecurityOptions}
              styles={fieldStyles}
              isMulti
              closeMenuOnSelect={false}
              value={storageState.filter.confidentiality}
              onChange={addOptionalFilter}
              name="confidentiality"
              className="basic-multi-select"
              classNamePrefix="select"
              placeholder={t("confidentiality")}
              />
          </Grid>
          <Grid item xs={3}>
            <Select
              options={dataSecurityOptions}
              styles={fieldStyles}
              isMulti
              closeMenuOnSelect={false}
              value={storageState.filter.integrity}
              onChange={addOptionalFilter}
              name="integrity"
              className="basic-multi-select"
              classNamePrefix="select"
              placeholder={t("integrity")}
            />
          </Grid>
          <Grid item xs={3}>
            <Select
              options={dataSecurityOptions}
              styles={fieldStyles}
              isMulti
              closeMenuOnSelect={false}
              value={storageState.filter.availability}
              onChange={addOptionalFilter}
              name="availability"
              className="basic-multi-select"
              classNamePrefix="select"
              placeholder={t("availability")}
              />
          </Grid>
        </>
        :
        null
      }
      <Grid item xs={4}>
        <Select
          onChange={handleRelatedDocsChange}
          onInputChange={searchRelatedDocument}
          name={"related_documents"}
          label={t("related_documents")}
          isMulti
          closeMenuOnSelect={false}
          isLoading={isRelatedDocsPending}
          placeholder={t("related_documents")}
          className="basic-multi-select"
          classNamePrefix="select"
          options={relatedDocuments}
          value={addedRelatedDocs}
          noOptionsMessage={() => userNoOptionsMessage}
          styles={fieldStyles}
        />
      </Grid>
      {!isArchive ? (
        <>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  {t("expiration_date")}:
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <MobileDatePicker
                  value={
                    storageState.filter.expiration_start
                      ? moment(storageState.filter.expiration_start)
                      : null
                  }
                  label={t("start")}
                  onChange={(e) => {
                    addOptionalFilter(e?.format("YYYY-MM-DD"), {
                      name: "expiration_start",
                    });
                  }}
                  minDate={moment()}
                  renderInput={(params) => (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <MuiTextField
                        {...params}
                        helperText={params?.inputProps?.placeholder}
                        fullWidth
                        InputLabelProps={{
                          style: {
                            zIndex: -1, // set the z-index to 1 or any value that works for your use case
                          },
                        }}
                      />
                    </Stack>
                  )}
                />
              </Grid>
              <Grid item xs={2}>
                <MobileDatePicker
                  value={
                    storageState.filter.expiration_end
                      ? moment(storageState.filter.expiration_end)
                      : null
                  }
                  label={t("end")}
                  onChange={(e) => {
                    addOptionalFilter(e?.format("YYYY-MM-DD"), {
                      name: "expiration_end",
                    });
                  }}
                  minDate={
                    storageState?.filter?.expiration_start
                      ? moment(storageState?.filter?.expiration_start)
                      : moment()
                  }
                  renderInput={(params) => (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <MuiTextField
                        {...params}
                        helperText={params?.inputProps?.placeholder}
                        fullWidth
                        InputLabelProps={{
                          style: {
                            zIndex: -1, // set the z-index to 1 or any value that works for your use case
                          },
                        }}
                      />
                    </Stack>
                  )}
                />
              </Grid>
              <Grid item xs={2}>
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{ paddingY: "1rem" }}
                >
                  <i
                    className="a-icon boschicon-bosch-ic-reset"
                    title={t("reset")}
                    onClick={clearDate}
                  ></i>
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </>
      ) : null}
      <Grid
        item
        xs={5}
        sx={{
          marginY: "1rem",
        }}
      >
        <FormControlLabel
          sx={{ ml: 0 }}
          control={
            <Switch
              checked={storageState?.show_valid_to_all}
              onChange={(e) => addOption("show_valid_to_all", e.target.checked)}
            />
          }
          label={t("show_valid_to_all")}
          labelPlacement="start"
        />
      </Grid>
    </Grid>
  );
};

export default DocumentBrowserOptionalFilters;
