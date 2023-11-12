import React, { useState } from "react";
import {
  List,
  Divider,
  Box,
  ListItem,
  Button,
  ListItemText,
  ListItemIcon,
  Avatar,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import DoneIcon from "@mui/icons-material/Done";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import PersonIcon from "@mui/icons-material/Person";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import AvatarComponent from "../../Molecules/AvatarComponent";
import CommentIcon from '@mui/icons-material/Comment';
import { roles } from "../../utils";

/**
 *
 * @param {*} responses the list of decesions made by the approvers
 * if theres a row and status field is true -> approved
 * if theres a row and status field is false -> rejected
 * if theres no row at all -> in approval
 * @returns
 */

const WFApproverTable = ({ approvers, responses, asmRoleIdNames, documentNames, allDepartments }) => {
  const [open, setOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const isEn = ["en", "EN", "en-US"].includes(i18n.language)
  const [selectedComment, setSelectedComment] = useState("");


  const findResponseForApprover = (approver) => {
    const response = responses.find((response) => {
      return response.uuid === approver.uuid;
    });
    return response;
  }

  const handleOpenDialog = (comment) => {
    setOpen((prev) => !prev);
    setSelectedComment(comment);
  };

  const handleClose = () => {
    setOpen((prev) => !prev);
  };
  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <h4 style={{ margin: "0", marginBottom: "1rem" }}>
        {t("approver_levels")}
      </h4>
      <List sx={{ width: "100%" }} dense={true}>
        {approvers.map((level, i) => (
          <>
            <Grid
              container
              p={2}
              spacing={1}
              alignItems="stretch"
              justifyContent="center"
              key={i}
            >
              <Grid item xs={12}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div className="thisisthediv" style={{
                  border: "1px solid #1976d2",
                  borderRadius: "5px",
                  paddingLeft: "15px",
                  paddingRight: "15px",
                  paddingTop: "5px",
                  paddingBottom: "5px",
                  color: "#1976d2",
                  marginBottom: "1rem"
                }}>
                  <Typography variant="caption" component="div" sx={{ flexGrow: 1, fontSize: "16px" }}>
                    {isEn
                      ? "Level " + (i + 1)
                      : i + 1 + ". szint"}
                  </Typography>
                </div>
              </Grid>
            </Grid>
            {level.approverRoles.map((approver, i) => {
              const response = findResponseForApprover(approver);
              return <>
                <React.Fragment key={i}>
                  <Grid item xs={12}>
                    <Grid container sx={{
                      backgroundColor: "rgba(0, 0, 0, 0.03)", padding: "0.5rem", marginY: "0.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <Grid item xs={3}>
                        <Chip sx={{ height: "41px" }}
                          avatar={approver.user.name ? (
                            <AvatarComponent userid={approver.user.userid} name={approver.user.name} />
                          ) : (
                            <Avatar
                              alt={approver.user.name}
                              sx={{ width: 24, height: 24 }}
                            >
                              <PersonIcon />
                            </Avatar>
                          )}
                          label={approver.user.name}>
                        </Chip>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography>

                          {approver?.role.startsWith("idm") ? roles[Object.keys(roles).filter((role) => roles[role].idmDisplayName === approver?.role)].name :
                            approver?.role.startsWith("asm") ? asmRoleIdNames[approver?.role] :
                              approver?.role.startsWith("creator") ? documentNames[approver?.role] : null}
                          {approver?.role.startsWith("idm") && <Chip sx={{ marginX: "0.5rem" }} label={allDepartments.find((department) => department.value === approver?.department)?.label} />}
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Grid
                          container
                          direction="column"
                          alignItems="center"
                          justifyContent="center"
                        >
                          {response?.approved === true && (
                            <Grid item xs>
                              <ListItem>
                                <ListItemIcon>
                                  <DoneIcon color="success" />
                                </ListItemIcon>
                                <ListItemText style={{ color: "green" }}>
                                  {t("approved")}
                                </ListItemText>
                              </ListItem>
                            </Grid>
                          )}
                          {response?.approved === false && (
                            <Grid item xs>
                              <ListItem>
                                <ListItemIcon>
                                  <ErrorIcon color="error" />
                                </ListItemIcon>
                                <ListItemText style={{ color: "red" }}>
                                  {t("rejected")}
                                </ListItemText>
                              </ListItem>
                            </Grid>
                          )}
                          <Grid item xs={4}>
                            <ListItemText>{response?.date}</ListItemText>
                          </Grid>

                        </Grid>
                      </Grid>

                      <Grid item xs={3}>
                        {response?.userid &&
                          <Grid container>
                            <Grid item xs={12} sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}>
                              <Typography variant="caption">
                                {response?.approved ? t("approved_by") : t("rejected_by")}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}>
                              <Chip
                                avatar={response.name ? (
                                  <AvatarComponent userid={response.userid} name={response.name} size="small" />
                                ) : (
                                  <Avatar
                                    alt={response.name}
                                    sx={{ width: 24, height: 24 }}
                                  >
                                    <PersonIcon />
                                  </Avatar>
                                )}
                                label={response.name}>
                              </Chip>

                            </Grid>
                          </Grid>}
                      </Grid>
                      <Grid item xs={2} sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",

                      }}>
                        {response?.userid &&
                          <ListItemText sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",

                          }} >
                            <Tooltip title={t("show_comment")}>
                              <Button
                                disabled={response?.comment === ""}
                                onClick={() => handleOpenDialog(response?.comment)}
                              >
                                <IconButton color={"primary"}>
                                  <CommentIcon sx={{ color: response?.comment === "" ? "rgba(0, 0, 0, 0.54)" : "primary" }} />
                                </IconButton>
                              </Button>
                            </Tooltip>
                            <Dialog open={open} onClose={handleClose}>
                              <DialogTitle>{t("comment")}</DialogTitle>
                              <DialogContent
                                sx={{
                                  minWidth: 600,
                                  minHeight: 300,
                                }}
                              >
                                <DialogContentText>
                                  {selectedComment}
                                </DialogContentText>
                              </DialogContent>
                              <DialogActions>
                                <Button onClick={handleClose}>
                                  {t("close")}
                                </Button>
                              </DialogActions>
                            </Dialog>
                          </ListItemText>}
                      </Grid>
                    </Grid>
                  </Grid>
                </React.Fragment>
              </>
            }
            )}
            <Grid item xs={2} />
            <Grid item xs={12}>
              <Divider
                sx={{
                  border: "1px solid",
                  borderColor: "rgba(0, 0, 0, 0.15)",
                }}
              />
            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="space-between"
              alignItems="flex-end"
            >
              <Grid item xs={0.5}></Grid>
              <Grid item xs></Grid>
              <Grid item xs={7.5}></Grid>
              <Grid item xs></Grid>
            </Grid>
          </>

        ))}

      </List>
    </Box >
  );
};

export default WFApproverTable;
