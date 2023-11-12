import React, { useState } from "react";
import Initial from "./CreationSteps/Initial";
import Second from "./CreationSteps/Second";
import Stepper from "./CreationSteps/Stepper";
import { Button } from '@mui/material'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useTranslation } from "react-i18next";
import { useLocation } from 'react-router-dom'
import useApprovers from "./useApprovers";

const WorkflowCreate = () => {
  const { t } = useTranslation();
  const routeParams = useLocation()
  // fetch the data in the states below
  const [currentStep, setCurrentStep] = useState(routeParams?.state?.step || 1);

  const [selectedDocument, setSelectedDocument] = useState(routeParams?.state?.document || {});
  const [isArchival, setIsArchival] = useState(false)
  const approverRoles = useApprovers(selectedDocument?.document_type, selectedDocument?.publisher_department, selectedDocument?.related_departments, isArchival)
  /* props for stepper component */
  const stepData = [
    {
      label: t("select_document"),
    },
    {
      label: t("manage_users"),
    },
  ];
  const stepForward = () => {
    if (currentStep >= 2) {
      setCurrentStep(2);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };
  const stepBackward = () => {
    if (currentStep <= 1) {
      setCurrentStep(1);
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };


  return (
    <React.Fragment>
        <Stepper counter={currentStep} stepData={stepData} />
        {currentStep === 1 && (
          <Initial
            stepForward={stepForward}
            setIsArchival={setIsArchival}
            setSelectedDocument={setSelectedDocument}
            selectedDocument={selectedDocument}
          />
        )}

        {(currentStep === 2 && approverRoles) && (
          <Second
            stepForward={stepForward}
            isArchival={isArchival}
            approverRoles={approverRoles}
            selectedDocument={selectedDocument}
          />
        )}

        {currentStep === 2 && (
          <Button onClick={stepBackward} variant="contained" sx={{ float: "left" }} startIcon={<ArrowBackIosNewIcon/>}>
          {t("previous_step")}
      </Button>
        )}
    </React.Fragment>
  );
};

export default WorkflowCreate;
