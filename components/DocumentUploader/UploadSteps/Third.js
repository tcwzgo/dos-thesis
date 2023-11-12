import React, { useContext, useEffect, useState, useCallback } from "react";
import Select from "react-select";
import { DocumentContext } from "../DocumentUploader";
import { Box, Grid, Typography, Button, Alert } from "@mui/material"
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import axios from "axios";
import { useTranslation } from 'react-i18next';
import ModalSelector from "../ModalSelector";
import api from "../../../axios_conf";

const Third = ({ setSelectedLocationTags, selectedLocationTags, documentToBeEdited, changeType, stepForward, selectedDepartments, selectedPublisherDepartment, selectedAreas, selectedRoles, setSelectedRoles, selectedRelevantStations, setSelectedRelevantStations }) => {
  const { t } = useTranslation();
  const [roles, setRoles] = useState([]);
  const [relevantStations, setRelevantStations] = useState([]);
  const [isRelevantStationsModalSelectorOpen, setIsRelevantStationsModalSelectorOpen] = useState(false)
  const { documentState, dispatch } = useContext(DocumentContext);
  const [rolesQuery, setRolesQuery] = useState("")
  const [locationTagsQuery, setLocationTagsQuery] = useState("")
  const [isLocationTagsLoading, setIsLocationTagsLoading] = useState(true)
  const [locationTags, setLocationTags] = useState([])
  const [isRolesLoading, setIsRolesLoading] = useState(false)
  const [allSelectedDepartments, setAllSelectedDepartments] = useState([...[selectedPublisherDepartment], ...selectedDepartments])

  useEffect(() => {
    if (changeType === "formal") {
      axios
        .get(process.env.REACT_APP_LOS_API_ENDPOINT + `/api/locations/?ids=${documentToBeEdited?.locations.join(',')}`)
        .then((res) => {
          setSelectedRelevantStations(res.data)
        })
    }
  }, [changeType])

  function getRolesFromAssignmentStore() {
    api().get(`/api/asm/get-roles?department=[${allSelectedDepartments.map(d => d.value).join(',')}]&area=[${selectedAreas.map(d => d.value).join(',')}]`,
    )
      .then(res => {
        const data = res.data.map((item) => { return { 'value': item.id, 'label': item.name } })
        setRoles(data)
      })
      .catch(error => {
        console.error(error)
      })
  }

  const getRoleNames = () => {
    setIsRolesLoading(true)
    api().get(`/api/asm/role-name?ids=[${documentState?.affected_roles?.join(',')}]`,
    )
    .then((res) => {
      console.log(res)
      setSelectedRoles(res.data)
      setIsRolesLoading(false)
    })
    .catch((error) => {
      console.error(error)
      setIsRolesLoading(false)
      })
  }

  const getStationsFromLocationStore = useCallback(() => {
    axios.get(process.env.REACT_APP_LOS_API_ENDPOINT + `/api/locations/?areas=${documentState.areas.join(',')}`)
      .then(res => {
        setRelevantStations([...res.data]);
        const temp = documentState.locations.map((item) => {
          return { value: item, label: res.data.filter((element) => element.value === item)[0].label };
        });
        setSelectedRelevantStations(temp)
        return res.data
      })
      .catch(error => {
        console.error(error)
      })
  }, [documentState.areas])

  const handleMultiSelectChange = (values, action) => {
    if (action.name === "locations") {
      const all = values.find(element => element.value === "all")
      if (all) {
        setSelectedRelevantStations([...relevantStations])
        dispatch({
          type: 'CHANGE_INPUT', payload: {
            name: 'locations',
            value: relevantStations.map(element => element.value)
          }
        })
      }
      else {
        setSelectedRelevantStations(values)
        dispatch({
          type: 'CHANGE_INPUT', payload: {
            name: 'locations',
            value: values.map(element => element.value)
          }
        })
      }
    }
    if (action.name === "affected_roles") {
      const all = values.find(element => element.value === "all")
      if (all) {
        setSelectedRoles([...roles])
        dispatch({
          type: "CHANGE_INPUT", payload: {
            name: action.name,
            value: roles.map((element) => element.value)
          }
        })
      }
      else {
        setSelectedRoles(values)
        dispatch({
          type: "CHANGE_INPUT", payload: {
            name: action.name,
            value: values.map((element) => element.value)
          }
        })
      }
    }
  }

  const fetchAllLocationTags = useCallback(() => {
    setIsLocationTagsLoading(true)
    if(locationTags.length !== 0) return
    axios
        .get(process.env.REACT_APP_LOS_API_ENDPOINT + `/api/tags/location?departments=${allSelectedDepartments.map(d => d.value).join(',')}&areas=${documentState.areas.join(',')}`)
        .then((res) => {
          setLocationTags([...res.data])
          setIsLocationTagsLoading(false)
        })
  }, [allSelectedDepartments, documentState.areas])

  useEffect(() => {
    if (documentState.locations.length !== 0 && changeType !== "formal") {
      axios
        .get(process.env.REACT_APP_LOS_API_ENDPOINT + `/api/locations/?ids=${documentState?.locations.join(',')}`)
        .then((res) => {
          setSelectedRelevantStations(res.data)
        })
    }
  }, [changeType])

  

  useEffect(() => {
    if (relevantStations) {
      fetchAllLocationTags()
    }
  }, [relevantStations])

  useEffect(() => {
    if (roles.length === 0) {
      getRolesFromAssignmentStore()
    }
  }, [roles.length])

  useEffect(() => {
    if (relevantStations.length === 0) {
      getStationsFromLocationStore()
    }
  }, []) 

  useEffect(() => {
    if (selectedRoles) {
      getRoleNames()
    }
  }, [])

  const submitForm = (e) => {
    e.preventDefault();
    stepForward();
  };

  const handleLocationTagsChange = (values, action) => {
    if (action.action === 'select-option') {

      axios.get(process.env.REACT_APP_LOS_API_ENDPOINT + `/api/tags/get-location-to-tag/${action.option.value}`)
        .then(res => {
          setSelectedRelevantStations(prev => {
            for (let location of res.data) {
              const isAlreadySelected = prev.find(s => s.label === location.label) !== undefined
              if (isAlreadySelected) {
                continue
              }
              const locationInOptions = relevantStations.find(s => s.label === location.label && s.value === location.value)
              if (locationInOptions) prev.push(locationInOptions)
            }
            dispatch({type: 'CHANGE_INPUT', payload: {
                name: 'locations',
                value: prev.map(s => s.value)
              }})
            return prev
          })
          setIsLocationTagsLoading(false)
        })
    }
    setSelectedLocationTags(values)
  }

  console.log(documentState?.affected_roles)
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
          <Grid item xs={6}>
            <Typography sx={{ mt: 1, mb: 2 }} variant="h5" component="div">
              {t("validity_and_related_roles")}
            </Typography>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={6}>
              <p style={{ marginBottom: "8px" }}>{t("relevant_stations")}:</p>
              <Select
                options={[{ value: 'all', label: t("select_all") }, ...relevantStations]}
                isMulti
                helper
                styles={{
                  option: (styles, { data }) => {
                    return {
                      ...styles,
                      fontWeight: data.value === 'all' ? "bold" : "none"
                    }
                  }
                }}
                onMenuOpen={() => setIsRelevantStationsModalSelectorOpen(true)}
                closeMenuOnSelect={false}
                className="basic-multi-select"
                classNamePrefix="select"
                name="locations"
                value={selectedRelevantStations}
                onChange={handleMultiSelectChange}
                placeholder={t("relevant_stations")}
              />
              <Alert severity="info" sx={{ mt: 1, mb: 1 }}>
                {t("nothing_selected_valid_to_all")}
              </Alert>
            </Grid>

            <Grid item xs={6}>
              <p style={{ marginBottom: "8px" }}>{t("related_roles")}:</p>
              <Select
                options={[{ value: 'all', label: t("select_all") }, ...roles]}
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
                className="basic-multi-select"
                classNamePrefix="select"
                inputValue={rolesQuery}
                blurInputOnSelect={false}
                onInputChange={(value, action) => {
                  if (action?.action !== 'set-value') {
                    setRolesQuery(value)
                  }
                }}
                name="affected_roles"
                onChange={handleMultiSelectChange}
                value={selectedRoles}
                isLoading={isRolesLoading}
                placeholder={t("related_roles")}
              />
              <Alert severity="info" sx={{ mt: 1, mb: 1 }}>
                {t("nothing_selected_valid_to_all")}
              </Alert>
            </Grid>
            <Grid item xs={6}>
              <p style={{ marginBottom: "8px" }}>{t("location_tags")}:</p>

              <Select
                  options={locationTags}
                  isMulti
                  isLoading={isLocationTagsLoading}
                  closeMenuOnSelect={false}
                  blurInputOnSelect={false}
                  inputValue={locationTagsQuery}
                  onInputChange={(value, action) => {
                    if (action?.action !== 'set-value') {
                      setLocationTagsQuery(value)
                    }
                  }}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  value={selectedLocationTags}
                  onChange={handleLocationTagsChange}
                  placeholder={t("location_tags")}
              />
            </Grid>
          </Grid>
        </Box>
        <Button
          type="submit"
          variant="contained"
          sx={{ float: "right", width: "12rem" }}
          startIcon={<ArrowForwardIosIcon />}
        >
          {t("next_step")}
        </Button>
      </form>
      <ModalSelector
        handleMultiSelectChange={handleMultiSelectChange}
        isOpen={isRelevantStationsModalSelectorOpen}
        setIsOpen={setIsRelevantStationsModalSelectorOpen}
        title={t("relevant_stations")}
        placeholder={t("relevant_stations")}
        fieldName={"locations"}
        url={process.env.REACT_APP_LOS_API_ENDPOINT + '/api/locations/?areas='}
        upperList={selectedAreas}
        dependentDataList={selectedRelevantStations}>
      </ModalSelector>
    </React.Fragment>
  );
};

export default Third;
