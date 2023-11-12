import { useState, useContext, useEffect, useCallback } from 'react';
import { Divider, Stack, Typography, Checkbox, IconButton, Collapse } from '@mui/material';
import Spinner from '../Molecules/Spinner';
import axios from 'axios';
import { DocumentContext } from './DocumentUploader';
import { useTranslation } from 'react-i18next';
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DependentDataListRow from './DependentDataListRow';
import { Chip } from '@bosch/react-frok';

const DependentDataList = ({ isPending, setIsPending, isOpen, list, setList, upperElement, valuesToBeSelected, setValuesToBeSelected, url, fieldName }) => {
    
    const [error, setError] = useState(null)
    const { documentState } = useContext(DocumentContext)
    const { t } = useTranslation()
    const [isAllSelected, setIsAllSelected] = useState(false)
    const [isAllDisabled, setIsAllDisabled] = useState(true)
    const [isRowOpen, setIsRowOpen] = useState(false)
    const numOfResults = list[upperElement?.label]?.filter((e) => e.visible).length

    const removeArrayElements = (arr1, arr2) => {
        let result = arr1?.filter(function(obj1) {
          return !arr2?.some(function(obj2) {
            return obj1.value === obj2.value && obj1.label === obj2.label;
          });
        });
      
        return result;
    }

    const getUniqueValues = (arr1, arr2) => {
        let combinedArray = arr1.concat(arr2.filter(item => item.checked));
        let uniqueArray = [];
        
        const compareObjects = (obj1, obj2) => {
            return obj1.label === obj2.label && obj1.value === obj2.value;
        }
        
        combinedArray.forEach((obj) => {
            let isDuplicate = uniqueArray?.some((uniqueObj) => {
                return compareObjects(uniqueObj, obj);
            });
        
            if (!isDuplicate) {
                uniqueArray.push(obj);
            }
        });
        
        return uniqueArray;
    }

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setIsAllSelected(true)
            const selected = list[upperElement?.label]?.map(a => {
                if(a.visible) {
                    return {
                        ...a,
                        checked: true
                    }
                }
                return {
                    ...a,
                    checked: false
                }
            })
            
            setValuesToBeSelected(prev => {
                const unique = getUniqueValues(prev, selected)
                return unique?.map(a => ({ label: a.label, value: a.value }))
            })
            setList(prev => {
                return {
                    ...prev,
                    [upperElement.label]: selected
                }
            })
        }

        else {
            setIsAllSelected(false)
            const selected = list[upperElement.label].map(a => {
                return {
                    ...a,
                    checked: false
                }
            })
            const filtered = removeArrayElements(valuesToBeSelected, selected)
            setValuesToBeSelected(filtered)
            setList(prev => {
                return {
                    ...prev,
                    [upperElement.label]: selected
                }
            })
        }
        
    }

    useEffect(() => {
        setIsAllDisabled(() => {
            const hasVisibleElements = list[upperElement.label]?.every(a => !a.visible) // if there is no visible item
            if (hasVisibleElements) {
                return true
            }
            else if (isPending) {
                return true
            }
            return false
        })
    }, [list, isPending, upperElement.label])


    const checkIfEverythingIsSelected = useCallback(() => {
        const temp = list[upperElement.label]
        if (temp?.length === 0) return
        
        const hasNoVisibleItems = temp?.every(item => !item.visible)
        if (hasNoVisibleItems) {
            setIsAllSelected(false)
            return
        }

        const areThereUnselectedItems = temp?.some(item => {
            return !item.checked && item.visible
        })
        if (areThereUnselectedItems) {
            setIsAllSelected(false)
            return
        }
        else {
            setIsAllSelected(true)
            return
        }
    }, [list, upperElement.label])
    
    const handleCheckboxChange = (event, element) => {
        const temp = list[upperElement.label]
        const selectedItem = temp.find(e => e.value === element.value)
        selectedItem.checked = !selectedItem.checked
        setList(prev => {
            return {
                ...prev,
                [upperElement.label]: temp
            }
        })

        if (event.target.checked) {
            setValuesToBeSelected(prev => [...prev, element])
        }
        else {
            setIsAllSelected(false)
            const temp = [...valuesToBeSelected]
            const itemToBeDeleted = temp.findIndex(item => item.value === element.value)
            if (itemToBeDeleted > -1) {
                temp.splice(itemToBeDeleted, 1)
            }
            setValuesToBeSelected(temp)
        }
    }

    useEffect(() => {
        if (!isPending && isOpen) {
            checkIfEverythingIsSelected()
        }
    }, [checkIfEverythingIsSelected, isOpen, isPending])

    useEffect(() => {
        setIsPending(true)
        axios.get(url + upperElement.value)
            .then(res => {
                let temp = []
                if (fieldName === 'areas') {
                    temp = res.data.map(area => {
                        return {
                            label: area.name,
                            value: area.id,
                            checked: documentState[fieldName].findIndex(item => item === area.id) !== -1,
                            visible: true
                        }
                    })
                }
                if (fieldName === "locations") {
                    temp = res.data.map(cplocation => {
                        return {
                            label: cplocation.label,
                            value: cplocation.value,
                            checked: documentState[fieldName].findIndex(item => item === cplocation.value) !== -1,
                            visible: true
                        }
                    })
                }
                setList(prev => {
                    return {
                        ...prev,
                        [upperElement.label]: temp
                    }
                })
                setIsPending(false)
                setError(null)
            })
            .catch(error => {
                setIsPending(false)
                setError(error)
            })
    }, [documentState, fieldName, setList, upperElement.label, upperElement.value, url, setIsPending])

    console.log(numOfResults)
    return (
        <>
            <Divider sx={{borderBottomWidth: 50, mt: 1.1, mb: 1.1 }}>
                <Stack flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"}>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setIsRowOpen(!isRowOpen)}>
                        {isRowOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                    <Typography>
                        {upperElement?.label}
                    </Typography>
                    <Checkbox checked={isAllSelected} disabled={isAllDisabled} onChange={handleSelectAll} size={"small"}/>
                    <Chip label={`${numOfResults} ${t("results")}`} variant="outlined" size="small"/>
                </Stack>
            </Divider>
            <Collapse in={isRowOpen} timeout={"auto"} unmountOnExit>
                <Stack flexDirection={"column"}>
                {isPending ?
                    <Spinner size={'small'}/>
                :
                    <>
                    {list[upperElement.label]?.length === 0 ?
                        <Stack alignItems={"center"} justifyContent={"center"} sx={{ opacity: "0.5", mt: 1, mb: 1, fontSize: '12px' }}>{t("cricket_noise")}</Stack>
                        :
                        <>
                            {list[upperElement.label]?.map(element => {
                                return (
                                    <>  
                                        {element?.visible ?
                                            <>
                                                <DependentDataListRow currentElement={element} handleCheckboxChange={handleCheckboxChange} documentField={documentState[fieldName]}/>
                                                {error &&
                                                    <p style={{ color: 'red' }}>{error.message}</p>
                                                }
                                            </>
                                            :
                                            null
                                        }
                                    </>
                                )
                            })
                        }
                        </>
                    }
                    </>
                }
                </Stack>
            </Collapse>
        </>
               
    )
}

export default DependentDataList