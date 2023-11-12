import React, { useContext, useState, useEffect, useCallback } from "react";
import Select from "react-select";
import { Grid, Box, Button, Typography, Alert } from "@mui/material"
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import axios from "axios";
import { DocumentContext } from '../DocumentUploader';
import { useTranslation } from 'react-i18next';
import ModalSelector from "../ModalSelector";

const Second = ({ setSelectedAreaTags, selectedAreaTags, documentToBeEdited, changeType, setSelectedRelevantStations, stepForward, selectedDepartments, selectedPublisherDepartment, selectedProducts, setSelectedProducts, selectedAreas, setSelectedAreas, isEditing }) => {
  const { t } = useTranslation();
  const { documentState, dispatch } = useContext(DocumentContext)
  const [products, setProducts] = useState([]);
  const [areas, setAreas] = useState([]);
  const [isAreaModalSelectorOpen, setIsAreaModalSelectorOpen] = useState(false)
  const [isAreasLoading, setIsAreasLoading] = useState(false)
  const [isTagsLoading, setIsTagsLoading] = useState(false)
  const [productsQuery, setProductsQuery] = useState("")
  const [areaTags, setAreaTags] = useState([])
  const [areaTagsQuery, setAreaTagsQuery] = useState("")
  const [allSelectedDepartments, setAllSelectedDepartments] = useState([...[selectedPublisherDepartment], ...selectedDepartments])

  const fieldStyles = {
    option: (styles, { data }) => {
      return {
        ...styles,
        fontWeight: data.value === 'all' ? "bold" : "none"
      }
    }
  }

  useEffect(() => {
    if (changeType === "formal") {
      axios
        .get(process.env.REACT_APP_LOS_API_ENDPOINT + `/api/areas/?area_id=${documentToBeEdited?.areas.join(',')}`)
        .then((res) => {
          const temp = res.data.map(({ name, id }) => (
            {
              label: name,
              value: id
            }
          ))
          setSelectedAreas(temp)
        })
      axios
        .get(process.env.REACT_APP_LOS_API_ENDPOINT + `/api/products?product_id=${documentToBeEdited?.product_family.join(',')}`)
        .then((res) => {
          setSelectedProducts(res.data)
        })
    }
  }, [changeType, documentToBeEdited?.areas, documentToBeEdited?.product_family, setSelectedAreas, setSelectedProducts])

  const getAreasFromLocationStore = useCallback(() => {
    axios.get(process.env.REACT_APP_LOS_API_ENDPOINT + `/api/areas/?department=${allSelectedDepartments.map(d => d.value).join(',')}`)
      .then(res => {
        const data = res.data.map(({ name, id }) => ({
          label: name,
          value: id
        }))
        setAreas([...data]);
        const temp = documentState.areas.map((item) => {
          return { value: item, label: data.filter((element) => element.value === item)[0].label };
        });
        setSelectedAreas(temp)
        return data
      })
      .catch(error => {
        console.error(error)
      })
  }, [documentState.areas, allSelectedDepartments, setSelectedAreas])

  function getProductsFromLocationStore(areas, departments) {
    axios.get(process.env.REACT_APP_LOS_API_ENDPOINT + `/api/products?area_id=${areas.map(d => d.value).join(',')}&deparment_id=${departments.map(d => d.value).join(',')}`)
      .then(res => {
        setProducts([...res.data]);
      })
      .catch(error => {
        console.error(error)
      })
  }


  const handleMultiSelectChange = (values, action) => {
    if (action.name === "areas") {
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
      const all = values.find(element => element.value === "all")
      if (all) {
        setSelectedAreas([...areas])
        getProductsFromLocationStore([...areas], [...allSelectedDepartments])
        dispatch({
          type: "CHANGE_INPUT", payload: {
            name: action.name,
            value: areas.map((element) => element.value)
          }
        })
      }
      else {
        setSelectedAreas(values)
        getProductsFromLocationStore([...values], [...allSelectedDepartments])
        dispatch({
          type: "CHANGE_INPUT", payload: {
            name: action.name,
            value: values.map((element) => element.value)
          }
        })
      }
    }
    if (action.name === "product_family") {
      setSelectedRelevantStations([])
      dispatch({
        type: 'CHANGE_INPUT', payload: {
          name: 'locations',
          value: []
        }
      })

      const all = values.find(element => element.value === "all")
      if (all) {
        setSelectedProducts([...products])
        dispatch({
          type: "CHANGE_INPUT", payload: {
            name: action.name,
            value: products.map((element) => element.value)
          }
        })
      }
      else {
        setSelectedProducts(values)
        dispatch({
          type: "CHANGE_INPUT", payload: {
            name: action.name,
            value: values.map((element) => element.value)
          }
        })
      }
    }
  }

  /* #endregion event handlers */
  useEffect(() => {
    if (areas && changeType !== "formal") {
      axios
        .get(process.env.REACT_APP_LOS_API_ENDPOINT + `/api/areas/?area_id=${documentState?.areas.join(',')}`)
        .then((res) => {
          const temp = res.data.map(({ name, id }) => (
            {
              label: name,
              value: id
            }
          ))
          setSelectedAreas(temp)
        })
    }
    if (products && changeType !== "formal") {
      if (documentState?.product_family.length > 0) {
        axios
          .get(process.env.REACT_APP_LOS_API_ENDPOINT + `/api/products?product_id=${documentState?.product_family.join(',')}`)
          .then((res) => {
            setSelectedProducts(res.data)
          })
      } else {
        setSelectedProducts([])
      }
    }
  }, [areas, changeType])

  useEffect(() => {
    getProductsFromLocationStore(selectedAreas, allSelectedDepartments)
    if (areas.length === 0) {
      getAreasFromLocationStore()
    }
  }, [areas.length, selectedAreas, allSelectedDepartments, getAreasFromLocationStore])

  const submitForm = (e) => {
    e.preventDefault();
    stepForward();
  };

  const fetchAllAreaTags = useCallback(() => {
    setIsTagsLoading(true)
    axios
      .get(process.env.REACT_APP_LOS_API_ENDPOINT + `/api/tags/area?departments=${allSelectedDepartments.map(d => d.value).join(',')}`)
      .then((res) => {
        setAreaTags([...res.data])
        setIsTagsLoading(false)
      })
  }, [allSelectedDepartments])

  useEffect(() => {
    if (areas) {
      fetchAllAreaTags()
    }
  }, [fetchAllAreaTags, areas])

  // write api to get tags based on area ids 
  const handleAreaTagsChange = (values, action) => {
    if (action.action === 'select-option') {

      setIsAreasLoading(true)
      axios.get(process.env.REACT_APP_LOS_API_ENDPOINT + `/api/tags/get-areas-to-tag/${action.option.value}`)
        .then(res => {
          setSelectedAreas(prev => {
            for (let area of res.data) {
              const isAlreadySelected = prev.find(a => a.label === area.label) !== undefined
              if (isAlreadySelected) {
                continue
              }
              const areaInOptions = areas.find(a => a.label === area.label && a.value === area.value)
              if (areaInOptions) prev.push(areaInOptions)
            }
            dispatch({
              type: 'CHANGE_INPUT', payload: {
                name: 'areas',
                value: prev.map(a => a.value)
              }
            })
            return prev
          })
          setIsAreasLoading(false)
        })
    }
    setSelectedAreaTags(values)
  }


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
              {t("area_and_product")}
            </Typography>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={6}>
              <p style={{ marginBottom: "8px" }}>{t("areas")}:</p>
              <Select
                noOptionsMessage={t("no_result")}
                options={[{ value: 'all', label: t("select_all") }, ...areas]}
                isMulti
                isLoading={isAreasLoading}
                isOptionSelected={(option) => {
                  return selectedAreaTags.find(item => item.label === option.label)
                }}
                styles={fieldStyles}
                onMenuOpen={() => setIsAreaModalSelectorOpen(true)}
                name="areas"
                className="basic-multi-select"
                classNamePrefix="select"
                value={selectedAreas}
                onChange={handleMultiSelectChange}
                placeholder={t("areas")}
              />
              <Alert severity="info" sx={{ mt: 1, mb: 1 }}>
                {t("nothing_selected_valid_to_all")}
              </Alert>
            </Grid>
            <Grid item xs={6}>
              <p style={{ marginBottom: "8px" }}>{t("products")}:</p>
              <Select
                options={[{ value: 'all', label: t("select_all") }, ...products]}
                isMulti
                styles={fieldStyles}
                closeMenuOnSelect={false}
                blurInputOnSelect={false}
                inputValue={productsQuery}
                onInputChange={(value, action) => {
                  if (action?.action !== 'set-value') {
                    setProductsQuery(value)
                  }
                }}
                name="product_family"
                className="basic-multi-select"
                classNamePrefix="select"
                value={selectedProducts}
                onChange={handleMultiSelectChange}
                placeholder={t("products")}
              />
              <Alert severity="info" sx={{ mt: 1, mb: 1 }}>
                {t("nothing_selected_valid_to_all")}
              </Alert>
            </Grid>
            <Grid item xs={6}>
              <p style={{ marginBottom: "8px" }}>{t("area_tags")}:</p>

              <Select
                options={areaTags}
                isMulti
                isLoading={isTagsLoading}
                styles={fieldStyles}
                closeMenuOnSelect={false}
                blurInputOnSelect={false}
                inputValue={areaTagsQuery}
                onInputChange={(value, action) => {
                  if (action?.action !== 'set-value') {
                    setAreaTagsQuery(value)
                  }
                }}
                className="basic-multi-select"
                classNamePrefix="select"
                value={selectedAreaTags}
                onChange={handleAreaTagsChange}
                placeholder={t("area_tags")}
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
        isOpen={isAreaModalSelectorOpen}
        setIsOpen={setIsAreaModalSelectorOpen}
        title={t("areas")}
        placeholder={t("areas")}
        fieldName={"areas"}
        url={process.env.REACT_APP_LOS_API_ENDPOINT + '/api/areas/?department='}
        upperList={allSelectedDepartments}
        dependentDataList={selectedAreas}>
      </ModalSelector>
    </React.Fragment>
  );
};

export default Second;
