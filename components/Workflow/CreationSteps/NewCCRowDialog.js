import React, { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Select from "react-select";
import { useEffect } from "react";
import api from "../../../axios_conf.js";
import { useTranslation } from "react-i18next";
import { transformUserData } from "../../utils.js";

const NewCCRowDialog = ({ handleClose, open, handleAddUser, CCusers }) => {
  const { t } = useTranslation();
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userQuery, setUserQuery] = useState("");
  const [isUserSearchPending, setIsUserSearchPending] = useState(false);
  const [userNoOptionsMessage, setUserNoOptionsMessage] = useState(
    t("please_type_more_letters")
  );
  const [nameOfCC, setNameOfCC] = useState("");

  const [newRecord, setNewRecord] = useState({
    name: null,
    userid: null,
  });

  const searchUser = (value) => {
    if (value.length < 3) {
      setUserNoOptionsMessage(t("please_type_more_letters"));
    } else {
      setUserNoOptionsMessage(t("no_result"));
    }
    setUserQuery(value);
  };
  const handleUserSelect = (element) => {
    setNameOfCC(element.label);
    setNewRecord({
      name: element.label,
      userid: element.value,
    });
  };

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
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{t("add_cc_user")}</DialogTitle>
      <DialogContent
        sx={{
          minWidth: 400,
          minHeight: 200,
        }}
      >
        <DialogContentText>{t("name")}:</DialogContentText>
        <Select
          placeholder={t("search_user")}
          id="name"
          label={t("name")}
          fullWidth
          autoFocus
          value={nameOfCC.label}
          margin="dense"
          variant="standard"
          options={filteredUsers}
          className="basic-single"
          classNamePrefix="select"
          onInputChange={searchUser}
          onChange={handleUserSelect}
          isLoading={isUserSearchPending}
          defaultInputValue={nameOfCC.label}
          noOptionsMessage={() => userNoOptionsMessage}
        />
        <br></br>
        {CCusers.map((CCusers) => (
          <div>{CCusers.name}</div>
        ))}
      </DialogContent>
      <DialogActions>
          <Button
              disabled={!newRecord.name}
            onClick={() => {
              handleAddUser(newRecord);
              setNameOfCC({
                label: null,
                value: null,
              });
              setNewRecord({
                  name: null,
                  userid: null
              })
            }}
          >
            {t("add_user")}
          </Button>
        <Button onClick={handleClose}>{t("close")}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewCCRowDialog;
