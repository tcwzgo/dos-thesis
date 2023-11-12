import { Stack, TextField, Box, Grid } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import Select from 'react-select';
import { useState, useEffect } from 'react';
import api from "../../../axios_conf.js";
import { transformUserData } from '../../utils.js';

const WorkflowForm = ({ isPending, searchQuery, setSearchQuery, setIsSearchPressed, workflowType, setWorkflowType, workflowStatus, setWorkflowStatus, users, setUsers }) => {

    const { t } = useTranslation()
    const [isUserSearchPending, setIsUserSearchPending] = useState(false);
    const [userNoOptionsMessage, setUserNoOptionsMessage] = useState(
      t("please_type_more_letters")
    );
    const [userQuery, setUserQuery] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);

    const fieldStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: "3.5rem",
            padding: "0",
            margin: "0"
        })
    }

    const workflowTypes = [
        { value: "approval", label: t("approval") },
        { value: "archival", label: t("archival") }
    ];

    const workflowStatuses = [
        { value: "in_approval", label: t("in_approval") },
        { value: "approved", label: t("approved") },
        { value: "rejected", label: t("rejected") },
        { value: "withdrawn", label: t("withdrawn") }];



    const handleSubmit = (e) => {
        e.preventDefault()

        setIsSearchPressed(prev => !prev)
    }

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
              console.error(error)
            });
        }
        return () => controller.abort();
      }, [userQuery]);

    const searchUser = (value) => {
        if (value.length < 3) {
          setUserNoOptionsMessage(t("please_type_more_letters"));
        } else {
          setUserNoOptionsMessage(t("no_result"));
        }
        setUserQuery(value);
      };


    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                boxShadow: 5,
                padding: 2
            }}>
            <h3 style={{ marginTop: "0.3rem", marginBottom: "0.8rem" }}>{t("search_workflow_history")}</h3>
            <Grid container spacing={1}>
                <Grid item xs={12} md={6}>

                    <TextField
                        sx={{
                            width: "100%",
                            margin: "0",
                            padding: "0"
                        }}
                        variant="outlined"
                        name="workflowId"
                        label={t("workflow_history_search_placeholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)} />

                </Grid>
                <Grid item xs={4} md={2}>
                <Select
                    styles={fieldStyles}
                    placeholder={t("workflow_starter")}
                    name="workflow_starter"
                    isMulti
                    options={filteredUsers}
                    value={users}
                    className="basic-single"
                    classNamePrefix="select"
                    onInputChange={searchUser}
                    onChange={(e) => { setUsers(e); }}
                    isLoading={isUserSearchPending}
                    defaultInputValue={""}
                    noOptionsMessage={() => userNoOptionsMessage}
                  />
                </Grid>
                <Grid item xs={4} md={2}>

                    <Select
                        isMulti
                        styles={fieldStyles}
                        options={workflowTypes}
                        value={workflowType}
                        closeMenuOnSelect={true}
                        onChange={(e) => { setWorkflowType(e); }}
                        name="workflow_type"
                        className="basic-multi-select"
                        classNamePrefix="select"
                        placeholder={t("workflow_type")}
                    />
                </Grid>
                <Grid item xs={4} md={2}>

                    <Select
                        isMulti
                        styles={fieldStyles}
                        options={workflowStatuses}
                        value={workflowStatus}
                        closeMenuOnSelect={true}
                        onChange={(e) => { setWorkflowStatus(e); }}
                        name="workflow_type"
                        className="basic-multi-select"
                        classNamePrefix="select"
                        placeholder={t("workflow_status")}
                    />
                </Grid>

            </Grid>
            <Stack justifyContent={"space-between"} flexDirection="row">
                <LoadingButton sx={{ p: 1.5, width: "10em", mt: 2 }} type="submit" loading={isPending} loadingPosition="start" startIcon={<SearchIcon />} variant="contained">
                    {t("search")}
                </LoadingButton>
            </Stack>
        </Box>
    );
}

export default WorkflowForm;