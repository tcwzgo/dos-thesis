import React, {
  useState,
  useReducer,
  createContext,
  useEffect,
  useContext,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Initial from "./UploadSteps/Initial";
import Second from "./UploadSteps/Second";
import Third from "./UploadSteps/Third";
import Fourth from "./UploadSteps/Fourth";
import Stepper from "./UploadSteps/Stepper";
import { documentFormReducer, INITAL_STATE } from "./documentFormReducer";
import { Button, Stack } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { UserContext } from "../../App";
import moment from 'moment';
import DSDialog from '../Molecules/DSDialog'
import ClearIcon from '@mui/icons-material/Clear';
import { hasRole, ROLES } from "../utils";

import { useTranslation } from 'react-i18next';
import axios from "axios";

export const TARGET_EXTENSION = ".pdf";
export const QUESTIONNARE_TARGET_EXTENSION = ".xlsx";
export const MAX_FILE_SIZE = 500000 // kilobytes
export const DocumentContext = createContext();
export const getNewVersion = (changeTypeInput, document = null) => {
  let current = document?.document_version
  let floating = parseInt(current.split(".")[1]);
  let decimal = parseInt(current.split(".")[0]);
  let final = "";
  if (changeTypeInput === "content") {
    // 4.4 -> 5.0 -> 6.0, 6.2 -> 7.0, 11.343 -> 12.000
    decimal += 1;
    floating = 0;
  } else if (changeTypeInput === "formal") {
    // 4.9 -> 4.10 -> 4.11 -> 4.12, 4.3 -> 4.4 -> 4.5...
    if (floating === 9) {
      floating = 10;
    } else {
      floating += 1;
    }
  }
  final = decimal.toString() + "." + floating.toString();
  return final;
};


const DocumentUploader = () => {
  const routeParameters = useLocation()
  const documentToBeEdited = routeParameters?.state?.document
  const [documentState, dispatch] = useReducer(documentFormReducer, INITAL_STATE)
  const { loggedUserIdmRole } = useContext(UserContext)
  const [currentStep, setCurrentStep] = useState(1)
  const [allDepartments, setAllDepartments] = useState([])
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedPublisherDepartment, setSelectedPublisherDepartment] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [document, setDocument] = useState(null)
  const [isDiscarded, setIsDiscarded] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState([])
  const [attachmentFiles, setAttachmentFiles] = useState([])
  const [supportingDocumentFiles, setSupportingDocumentFiles] = useState([])
  const [trainingMaterialFiles, setTrainingMaterialFiles] = useState([])
  const [trainingTestFiles, setTrainingTestFiles] = useState([])
  const [selectedAreaTags, setSelectedAreaTags] = useState([])
  const [selectedLocationTags, setSelectedLocationTags] = useState([])
  const [selectedRelevantStations, setSelectedRelevantStations] = useState([]);
  const [expirationDate, setExpirationDate] = useState(null)
  const [documentVersion, setDocumentVersion] = useState(documentState.document_version)
  const [isDocumentResponsible, setIsDocumentResponsible] = useState(false)
  const { loggedUserId, loggedUserName } = useContext(UserContext)
  const isEditing = !!routeParameters?.state?.isEditing
  const browserMigrate = routeParameters?.state?.isMigrating
  const isActive = !!routeParameters?.state?.isActive
  const changeType = routeParameters?.state?.changeType
  const hasDocResp = hasRole(loggedUserIdmRole, [ROLES.DOCUMENT_RESPONSIBLE])
  /* props for stepper component */
  const { t } = useTranslation();
  const navigate = useNavigate();
  const stepData = [
    {
      label: t("basic_data_input"),
    },
    {
      label: t("area_and_product"),
    },
    {
      label: t("validity_and_related_roles"),
    },
    {
      label: t("document_uploading_and_verification"),
    },
  ];

  const setLoggedUserAsCreator = () => {
    dispatch({
      type: "CHANGE_INPUT", payload: {
        name: "creator_name",
        value: loggedUserName
      }
    })
    dispatch({
      type: "CHANGE_INPUT", payload: {
        name: "creator",
        value: loggedUserId
      }
    })
  }

  const getDepartmentsFromLocationStore = async () => {
    await axios
      .get(process.env.REACT_APP_LOS_API_ENDPOINT + `/api/departments`)
      .then((res) => {
        setAllDepartments([...res.data]);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  useEffect(() => {
    getDepartmentsFromLocationStore()
  }, [])

  const stepBackward = () => {
    if (currentStep <= 1) {
      setCurrentStep(1);
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };
  const stepForward = () => {
    if (currentStep >= stepData.length) {
      setCurrentStep(stepData.length);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  useEffect(() => {

    setExpirationDate(null)
    if (isEditing) {
      const clone = JSON.parse(JSON.stringify(documentToBeEdited))
      const temp = {
        ...clone,
        documents: []
      }
      setSelectedPublisherDepartment(allDepartments.find((department) => department.value === clone.publisher_department))
      setSelectedDepartments(clone.related_departments.map((department) => {
        return allDepartments.find((d) => d.value === department)
      }))

      dispatch({
        type: 'LOAD_EXISTING_DOCUMENT', payload: {
          name: null,
          value: temp
        }
      })

      if (isActive) {
        setAttachmentFiles([])
        setTrainingTestFiles([])
        setTrainingMaterialFiles([])
        setSupportingDocumentFiles([])
        dispatch({
          type: 'CHANGE_INPUT', payload: {
            name: "training_material",
            value: []
          }
        })
        dispatch({
          type: 'CHANGE_INPUT', payload: {
            name: "training_tests",
            value: []
          }
        })
        dispatch({
          type: 'CHANGE_INPUT', payload: {
            name: "attachments",
            value: []
          }
        })
        dispatch({
          type: 'CHANGE_INPUT', payload: {
            name: "supportig_documents",
            value: []
          }
        })
        setDocumentVersion(getNewVersion(changeType, documentToBeEdited))
      }
      else {
        setDocumentVersion(documentToBeEdited.document_version)
      }

      if (!browserMigrate) {
        setLoggedUserAsCreator()
      }

      if (changeType === "formal") {
        setExpirationDate(
          moment(documentToBeEdited.expiration_date).isValid() ?
            moment(documentToBeEdited.expiration_date) : null)
      }
      else if (changeType === "content") {
        setExpirationDate(null)
      }
    }
    else if (!browserMigrate) {
      dispatch({
        type: 'CHANGE_INPUT', payload: {
          name: 'document_version',
          value: "1.0"
        }
      })
      setDocumentVersion("1.0")
      if (!hasDocResp) {
        setLoggedUserAsCreator()
      }
    }
  }, [allDepartments])

  const contextValue = {
    documentState,
    dispatch,
  };
  /* reducer functions and reducer definition */

  useEffect(() => {
    if (hasDocResp) {
      setIsDocumentResponsible(true)
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
    else if (!hasRole(loggedUserIdmRole, [ROLES.DOCUMENT_RESPONSIBLE, ROLES.PLANT_DOCUMENT_RESPONSIBLE, ROLES.SUPERUSER])) {
      setIsDocumentResponsible(false)
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
  }, [loggedUserIdmRole])


  return (
    <React.Fragment>
      <DocumentContext.Provider value={contextValue}>
        <DSDialog
          open={isDiscarded}
          setOpen={setIsDiscarded}
          type={"info"}
          title={t("are_you_sure")}
          content={isEditing ? t("discard_modified_document") : t("cancel_upload")}
        >
          <Button
            sx={{ m: 1 }}
            variant="contained"
            onClick={() => navigate(-1)}
          >
            {t("yes")}
          </Button>
          <Button variant="outlined" onClick={() => setIsDiscarded(false)}>{t("cancel")}</Button>
        </DSDialog>
        <Stepper counter={currentStep} stepData={stepData} />
        {currentStep === 1 && <Initial
          allDepartments={allDepartments}
          setSelectedDepartments={setSelectedDepartments}
          setSelectedPublisherDepartment={setSelectedPublisherDepartment}
          setSelectedAreas={setSelectedAreas}
          setSelectedProducts={setSelectedProducts}
          setSelectedRelevantStations={setSelectedRelevantStations}
          setSelectedRoles={setSelectedRoles}
          selectedDepartments={selectedDepartments}
          selectedPublisherDepartment={selectedPublisherDepartment}
          stepForward={stepForward}
          isMigrating={browserMigrate}
          isEditing={isEditing}
          isDocumentResponsible={isDocumentResponsible}
          setIsDocumentResponsible={setIsDocumentResponsible}
          documentToBeEdited={documentToBeEdited}
          expirationDate={expirationDate}
          isActive={isActive}
          changeType={changeType}
          setExpirationDate={setExpirationDate}
          documentVersion={documentVersion}
          setDocumentVersion={setDocumentVersion}
        />}

        {currentStep === 2 && (
          <Second
            documentToBeEdited={documentToBeEdited}
            setSelectedRelevantStations={setSelectedRelevantStations}
            stepForward={stepForward}
            selectedDepartments={selectedDepartments}
            selectedPublisherDepartment={selectedPublisherDepartment}
            selectedProducts={selectedProducts}
            changeType={changeType}
            setSelectedAreaTags={setSelectedAreaTags}
            selectedAreaTags={selectedAreaTags}
            setSelectedProducts={setSelectedProducts}
            selectedAreas={selectedAreas}
            isEditing={isEditing}
            setSelectedAreas={setSelectedAreas}
          />
        )}

        {currentStep === 3 && <Third
          selectedRelevantStations={selectedRelevantStations}
          documentToBeEdited={documentToBeEdited}
          selectedLocationTags={selectedLocationTags}
          setSelectedLocationTags={setSelectedLocationTags}
          stepForward={stepForward}
          selectedDepartments={selectedDepartments}
          selectedPublisherDepartment={selectedPublisherDepartment}
          selectedProducts={selectedProducts}
          selectedRoles={selectedRoles}
          setSelectedRoles={setSelectedRoles}
          selectedAreas={selectedAreas}
          isEditing={isEditing}
          changeType={changeType}
          setSelectedRelevantStations={setSelectedRelevantStations} />}

        {currentStep === stepData.length && <Fourth
          isEditing={isEditing}
          document={document}
          setDocument={setDocument}
          attachmentFiles={attachmentFiles}
          setAttachmentFiles={setAttachmentFiles}
          trainingMaterialFiles={trainingMaterialFiles}
          supportingDocumentFiles={supportingDocumentFiles}
          setSupportingDocumentFiles={setSupportingDocumentFiles}
          setTrainingMaterialFiles={setTrainingMaterialFiles}
          trainingTestFiles={trainingTestFiles}
          setTrainingTestFiles={setTrainingTestFiles}
          expirationDate={expirationDate}
          isMigrating={browserMigrate}
          documentVersion={documentVersion}
          isActive={isActive} />}

        <Stack flexDirection={"column"}>
          {currentStep >= 2 && (
            <Button
              onClick={stepBackward}
              variant="contained"
              sx={{ float: "left", width: "12rem", mb: 1 }}
              startIcon={<ArrowBackIosNewIcon />}
            >
              {t("previous_step")}
            </Button>
          )}
          <Button
            onClick={() => setIsDiscarded(true)}
            variant="outlined"
            color={"error"}
            sx={{ float: "left", width: "12rem", mb: 3 }}
            startIcon={<ClearIcon />}
          >
            {isEditing ? t("discard") : t("cancel")}
          </Button>
        </Stack>
      </DocumentContext.Provider>
    </React.Fragment>
  );
};

export default DocumentUploader;
