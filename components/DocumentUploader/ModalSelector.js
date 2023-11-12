import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    InputAdornment,
    IconButton
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';
import React, { useState, useEffect } from 'react';
import Select from "react-select";
import DependentDataList from './DependentDataList';

const SelectedElement = ({ data }) => {

    const style = {
        textAlign: 'center',
        background: 'rgb(230, 230, 230)',
        margin: '3px',
        fontFamily: 'sans-serif',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        borderRadius: '2px',
        color: 'rgb(51, 51, 51)',
        fontSize: '85%',
        padding: '3px 3px 3px 6px',
        boxSizing: 'border-box',
    }

    return (
        <div style={style}>{data?.label}</div>
    )
}

const ModalSelector = ({ isOpen, setIsOpen, title, upperList, handleMultiSelectChange, dependentDataList, fieldName, placeholder, url }) => {
    const { t } = useTranslation()
    const [valuesToBeSelected, setValuesToBeSelected] = useState([]) // set the default to already selected items from the documentState
    const [inputQuery, setInputQuery] = useState("")
    const [isPending, setIsPending] = useState(false)
    const [list, setList] = useState({})

    useEffect(() => {
        const temp = {}

        upperList.forEach(item => {
            temp[item.label] = []
        })
        setList(temp)
    }, [upperList])

    useEffect(() => {
        if (isOpen) {
            setInputQuery("")
        }
    }, [isOpen])

    useEffect(() => setValuesToBeSelected(dependentDataList), [dependentDataList])

    const handleConfirm = () => {
        handleMultiSelectChange(valuesToBeSelected, { name: fieldName })
        setIsOpen(false)
    }

    const handleCancel = () => {
        setValuesToBeSelected(dependentDataList)
        setIsOpen(false)
    }

    const filterResults = (value) => {
        setList(prev => {
            const filteredList = {};
            
            Object.keys(prev).forEach(key => {
                const filtered = prev[key].map(element => {
                    if (!(element.label?.toLowerCase().includes(value?.toLowerCase()))) {
                        element.visible = false
                    }
                    else {
                        element.visible = true
                    }
                    return element
                });
                filteredList[key] = filtered;
            });
            return {
                ...prev,
                ...filteredList
            };
        });
    }

    const handleInputChange = (event) => {
        setInputQuery(event.target.value)
        filterResults(event.target.value)
    }

    return (
        <Dialog open={isOpen} fullWidth maxWidth={"md"}>
            <DialogTitle>{title}</DialogTitle>
            <Stack>
                <Select
                    isMulti
                    helper
                    retainInputOnBlur={true}
                    components={{ DropdownIndicator:() => null, IndicatorSeparator:() => null, MultiValue: SelectedElement }}
                    styles={{
                        control: (baseStyles) => ({
                            ...baseStyles,
                            marginLeft: '1rem',
                            marginRight: '1rem',
                            marginBottom: '0.5rem',
                        }),
                        valueContainer: (baseStyles) => ({
                            ...baseStyles,
                            minHeight: '10rem',
                            justifyContent: 'start',
                            maxHeight: '10rem',
                            overflowY: 'auto'
                        })
                    }}
                    isOptionSelected={(option) => {
                        return valuesToBeSelected.find(item => item.label === option.label)
                    }}
                    isClearable={false}
                    menuIsOpen={false}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    value={valuesToBeSelected}
                    placeholder={<p>{placeholder}</p>}
                />
                <TextField
                    label={isPending ? t("loading") : t("modal_selector_filter_placeholder")}
                    variant="outlined"
                    disabled={isPending}
                    margin='dense'
                    size='small'
                    sx={{ ml: "1rem", mr: "1rem", mb: "0.5rem" }}
                    InputProps={{
                        endAdornment: 
                            <InputAdornment position='end'>
                                <IconButton onClick={() => {
                                        setInputQuery("")
                                        filterResults("")
                                    }}>
                                    <CloseIcon />
                                </IconButton>
                            </InputAdornment>
                    }}
                    value={inputQuery}
                    onChange={handleInputChange}
                />
            </Stack>
            <DialogContent>
                {upperList.map(element => {
                    return (
                        <DependentDataList isPending={isPending} setIsPending={setIsPending} isOpen={isOpen} list={list} setList={setList} upperElement={element} setValuesToBeSelected={setValuesToBeSelected} valuesToBeSelected={valuesToBeSelected} url={url} fieldName={fieldName}/>
                        
                    )
                })}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel} variant={"outlined"} color={'error'} startIcon={<ClearIcon />}>{t('cancel')}</Button>
                <Button onClick={handleConfirm} variant={"contained"} color={'primary'}>{t('OK')}</Button>
            </DialogActions>
        </Dialog>
    )
}

export default ModalSelector