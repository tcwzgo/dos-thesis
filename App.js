import Home from "./components/Home";
import Footer from "./components/Footer";
import Login from "./components/Login";
import ReportIcon from '@mui/icons-material/Report';
import ProtectedRoute from "./ProtectedRoute";
import DocumentBrowser from "./components/DocumentBrowser/DocumentBrowser";
import DocumentUploader from "./components/DocumentUploader/DocumentUploader";
import DocumentIframe from "./components/DocumentViewer/DocumentIframe";
import WorkflowCreate from "./components/Workflow/WorkflowCreate";
import WorkflowLanding from "./components/Workflow/WorkflowLanding";
import WorkflowHistory from "./components/Workflow/WorkflowHistory/WorkflowHistory";
import DataProtectionNotice from "./components/DataProtectionNotice/DataProtectionNotice";
import NoRoleMessage from "./components/NoRoleMessage";
import NotFound from "./components/NotFound";
import {
  Badge,
  Button,
  IconButton,
  List,
  ListItem,
  Popover,
  Tooltip,
  Typography,
} from "@mui/material";
import React, {
  createContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Grid from "@mui/material/Grid";
import { Avatar } from "@mui/material";
import { MinimalHeader } from "@bosch/react-frok";
import Spinner from "./components/Molecules/Spinner";
import { Routes, Route, useNavigate } from "react-router-dom";
import Axios from "axios";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers";
import WorkflowView from "./components/Workflow/WorkflowView/WorkflowView";
import DocumentViewer2 from "./components/DocumentViewer/DocumentViewer2";
import DocumentUploaderLanding from "./components/DocumentUploader/DocumentUploaderLanding";
import PersonIcon from "@mui/icons-material/Person";
import { useTranslation } from "react-i18next";
import { hasRole, ROLES } from "./components/utils";
import EventLog from "./components/Admin/EventLog";
import { Logout } from "@mui/icons-material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import api from "./axios_conf.js";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CancelIcon from "@mui/icons-material/Cancel";
import StartIcon from "@mui/icons-material/Start";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ArchiveIcon from "@mui/icons-material/Archive";
import moment from "moment";
import "moment/locale/hu";
import "moment-timezone";
import PlantDocumentCoordinator from "./components/PlantCoordinator/PlantDocumentCoordinator";
import socketIOClient from "socket.io-client";
import DesktopNotification from "./components/Molecules/DesktopNotification";
import ApiKeys from "./components/ApiKeys/ApiKeys";
import RoleSelector from "./RoleSelector";
import UserManual from "./components/UserManual";
import * as msal from "@azure/msal-browser";

export const UserContext = createContext();

function App() {
  const [openDataPrt, setOpenDataPrt] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navRef = useRef();
  const navigate = useNavigate();
  const [account, setAccount] = useState({});
  const [accountIdmRoles, setAccountIdmRoles] = useState([]);
  const [accountRoles, setAccountRoles] = useState({});
  const [accountName, setAccountName] = useState();
  const [imageUrl, setImageUrl] = useState(null);
  const [expiresOn, setExpiresOn] = useState();
  const [isAuthenticated, setIsAuthenticated] = useState();
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);

  const { t, i18n } = useTranslation();
  const isHun = ["hu", "HU", "hu-HU"].includes(i18n.language)
  const toggleSidebar = () => {
    setIsSidebarOpen((value) => !value);
  };

  const getLanguage = useCallback(() => {
    if (isHun) {
      return "HU";
    } else {
      return "EN";
    }
  }, [i18n.language]);
  const languageButtonLabel = () => {
    if (isHun) {
      return "EN";
    } else {
      return "HU";
    }
  };

  useEffect(() => {
    if (isAuthenticated && notifications && notifications.length > 0) {
      setNotificationCount(notifications.filter((e) => !e.seen).length);
    }
  }, [notifications, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      Notification.requestPermission();
      const socket = socketIOClient(`${process.env.REACT_APP_HOST_NAME}`);
      socket.on("connect", () => {
        socket.emit("subscribe", {
          token: localStorage.getItem("DOSaccessToken"),
        });
      });

      socket.on("notification", (data) => {
        setNotifications([data, ...notifications]);
        const notif = new DesktopNotification();
        if (isHun) {
          notif.showNotification(
            data["hungarian_subject"],
            data["hungarian_text"],
            data["url"]
          );
        } else {
          notif.showNotification(
            data["english_subject"],
            data["english_text"],
            data["url"]
          );
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [notifications, i18n.language, isAuthenticated]);

  useEffect(() => {
    const newLanguage = getLanguage() === "EN" ? "en" : "hu";
    moment.locale(newLanguage);
  }, [i18n.language, notificationsOpen, getLanguage]);

  const toggleLanguage = () => {
    const newLanguage = getLanguage() === "EN" ? "hu" : "en";
    i18n.changeLanguage(newLanguage);
  };

  const getTimeRemaining = useCallback(async () => {
    if (expiresOn) {
      const now = new Date().getTime();
      const targetDate = new Date(expiresOn * 1000);

      const distance = targetDate.getTime() - now;
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (minutes <= 10 && seconds <= 0) {
        await renewToken();
      }
    }
  }, [expiresOn]);

  const [setTimeRemaining] = useState(getTimeRemaining());

  useEffect(() => {
    getTimeRemaining();
    const interval = setInterval(getTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [getTimeRemaining]);

  const handleNotificationClick = (e) => {
    setNotificationsOpen(true);
    setNotificationAnchorEl(e.currentTarget);
  };

  const getNotifications = () => {
    api()
      .get("/api/notifications")
      .then((res) => {
        setNotifications(res.data);
      });
  };

  useEffect(() => {
    getNotifications();
  }, []);

  async function renewToken() {
    const msalConfig = {
      auth: {
        clientId: "5885eb12-3ff6-4d21-8a7e-c11dc8cf44a5",
        redirectUri: `${window.location.origin}`,
        authority:
          "https://login.microsoftonline.com/0ae51e19-07c8-4e4b-bb6d-648ee58410f4",
      },
    };
    const msalInstance = new msal.PublicClientApplication(msalConfig);

    const token = JSON.parse(
      atob(localStorage.getItem("DOSaccessTokenForUsers").split(".")[1])
    );

    const silentRequest = {
      scopes: ["user.readbasic.all", "GroupMember.Read.All"],
      loginHint: `${token.upn}`,
    };
    try {
      const response = await msalInstance.ssoSilent(silentRequest);
      // Store the new token in local storage
      localStorage.setItem("DOSaccessTokenForUsers", response.accessToken);
      localStorage.setItem("DOSaccessToken", response.idToken);
      setExpiresOn(JSON.parse(atob(response.accessToken.split(".")[1])).exp);
    } catch (err) {
      if (err instanceof msal.InteractionRequiredAuthError) {
        await msalInstance.loginPopup(silentRequest).catch((error) => {
          console.log(error);
        });
      } else {
        console.log("Failed to renew token:", err);
      }
    }
  }

  const checkTokenData = useCallback(async () => {
    const token1 = localStorage.getItem("DOSaccessToken");
    const token2 = localStorage.getItem("DOSaccessTokenForUsers");
    if (
      token1 &&
      token2 &&
      token2 !== "undefined" &&
      token1 !== "undefined" &&
      token1 !== token2
    ) {
      const newDate = new Date().toLocaleString("en-US", {
        timeZone: "Europe/Budapest",
      });

      const accessToken1 = JSON.parse(atob(token1.split(".")[1]));
      const accessToken2 = JSON.parse(atob(token2.split(".")[1]));
      const accessToken1DateTime = accessToken1.exp;
      setExpiresOn(accessToken1DateTime);
      Axios.get("https://graph.microsoft.com/v1.0/me/photo/$value", {
        headers: { Authorization: `Bearer ${token2}` },
        responseType: "blob",
      })
        .then((o) => {
          const url = window.URL || window.webkitURL;
          const blobUrl = url.createObjectURL(o.data);
          setImageUrl(blobUrl);
        })
        .catch((error) => {
          setImageUrl(null); // set the state value here
        });
      const idTokenRoles = accessToken1.roles ? accessToken1.roles : [];
      const temp = [];
      if (
        idTokenRoles.indexOf(
          "de.bosch.com\\idm2bcd_HtvP_Document-Store_Superuser"
        ) > -1
      ) {
        temp.push(ROLES.SUPERUSER);
        setIsSuperuser(true);
      }
      if (
        idTokenRoles.indexOf(
          "de.bosch.com\\idm2bcd_HtvP_Document-Store_Editor"
        ) > -1
      ) {
        temp.push(ROLES.EDITOR);
      }
      if (
        idTokenRoles.indexOf(
          "de.bosch.com\\idm2bcd_HtvP_Document-Store_Viewer"
        ) > -1
      ) {
        temp.push(ROLES.VIEWER);
      }
      if (
        idTokenRoles.indexOf(
          "de.bosch.com\\idm2bcd_HtvP_Document-Store_Archive"
        ) > -1
      ) {
        temp.push(ROLES.ARCHIVE);
      }
      if (
        idTokenRoles.indexOf(
          "de.bosch.com\\idm2bcd_HtvP_Document-Store_Plant_Document_Responsible"
        ) > -1
      ) {
        temp.push(ROLES.PLANT_DOCUMENT_RESPONSIBLE);
      }
      if (
        idTokenRoles.indexOf(
          "de.bosch.com\\idm2bcd_HtvP_Document-Store_Document_Responsible"
        ) > -1
      ) {
        temp.push(ROLES.DOCUMENT_RESPONSIBLE);
      }
      if (
        idTokenRoles.indexOf(
          "de.bosch.com\\idm2bcd_HtvP_Document-Store_Product_Planner"
        ) > -1
      ) {
        temp.push(ROLES.PRODUCT_PLANNER);
      }
      if (
        idTokenRoles.indexOf(
          "de.bosch.com\\idm2bcd_HtvP_Document-Store_Group_leader"
        ) > -1
      ) {
        temp.push(ROLES.GROUP_LEADER);
      }
      if (
        idTokenRoles.indexOf("de.bosch.com\\idm2bcd_HtvP_Document-Store_HSE") >
        -1
      ) {
        temp.push(ROLES.HSE);
      }
      if (
        idTokenRoles.indexOf("de.bosch.com\\idm2bcd_HtvP_Document-Store_TEF6") >
        -1
      ) {
        temp.push(ROLES.TEF6);
      }
      if (
        idTokenRoles.indexOf(
          "de.bosch.com\\idm2bcd_HtvP_Document-Store_VSDepartment_Leader"
        ) > -1
      ) {
        temp.push(ROLES.DEPARTMENT_LEADER);
      }
      if (
        idTokenRoles.indexOf(
          "de.bosch.com\\idm2bcd_HtvP_Document-Store_TWI_coordinator"
        ) > -1
      ) {
        temp.push(ROLES.TWI_COORDINATOR);
      }
      if (
        idTokenRoles.indexOf(
          "de.bosch.com\\idm2bcd_HtvP_Document-Store_QTeamer"
        ) > -1
      ) {
        temp.push(ROLES.QTEAMER);
      }
      setAccountIdmRoles(temp);

      if (Date.parse(newDate) / 1000 < accessToken1DateTime) {
        setAccount(accessToken2.upn);
        setAccountName(accessToken1.name);
        setAccountRoles(accessToken1?.roles);
        setIsAuthenticated(true);
      } else {
        localStorage.clear();
        sessionStorage.clear();
        setIsAuthenticated(false);

        Refresh();
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []);
  const basicMenuItems = useMemo(
    () => [
      {
        label: t("home"),
        value: "home-link",
        icon: "home",
        link: {
          onClick: function onClick() {
            navigate("/");
          },
        },
      },
      {
        label: t("document_browser"),
        value: "document-browser",
        icon: "document-search",
        link: {
          onClick: function onClick() {
            navigate("/document-browser");
          },
        },
      },
    ],
    [navigate, t]
  );
  const [menuItems, setMenuItems] = useState([basicMenuItems]);

  useEffect(() => {
    let temp = [...basicMenuItems];
    if (
      hasRole(accountIdmRoles, [
        ROLES.EDITOR,
        ROLES.SUPERUSER,
        ROLES.PLANT_DOCUMENT_RESPONSIBLE,
        ROLES.DEPARTMENT_LEADER,
        ROLES.QTEAMER,
        ROLES.HSE,
        ROLES.ARCHIVE,
        ROLES.TWI_COORDINATOR,
        ROLES.DOCUMENT_RESPONSIBLE,
        ROLES.TEF6,
        ROLES.GROUP_LEADER,
        ROLES.PRODUCT_PLANNER,
      ])
    ) {
      temp.push({
        label: t("document_uploader"),
        value: "document-uploader",
        icon: "document-add",
        link: {
          onClick: function onClick() {
            navigate("/document-uploader-landing");
          },
        },
      });
    }

    if (
      hasRole(accountIdmRoles, [
        ROLES.EDITOR,
        ROLES.SUPERUSER,
        ROLES.PLANT_DOCUMENT_RESPONSIBLE,
        ROLES.DEPARTMENT_LEADER,
        ROLES.QTEAMER,
        ROLES.ARCHIVE,
        ROLES.HSE,
        ROLES.TWI_COORDINATOR,
        ROLES.DOCUMENT_RESPONSIBLE,
        ROLES.TEF6,
        ROLES.GROUP_LEADER,
        ROLES.PRODUCT_PLANNER,
      ])
    ) {
      temp.push({
        label: t("workflow_management"),
        value: "workflows",
        icon: "clipboard-list",
        link: {
          onClick: function onClick() {
            navigate("/workflow-management");
          },
        },
      });
    }

    if (
      hasRole(accountIdmRoles, [
        ROLES.SUPERUSER,
        ROLES.ARCHIVE,
        ROLES.DOCUMENT_RESPONSIBLE,
        ROLES.PLANT_DOCUMENT_RESPONSIBLE,
        ROLES.TWI_COORDINATOR,
      ])
    ) {
      temp.push({
        label: t("archive_browser"),
        value: "archive",
        icon: "box-arrow-down",
        link: {
          onClick: function onClick() {
            navigate("/archive-browser");
          },
        },
      });
    }
    if (hasRole(accountIdmRoles, [ROLES.SUPERUSER])) {
      temp.push({
        label: t("eventlog"),
        value: "eventlog",
        icon: "user-masking",
        link: {
          onClick: function onClick() {
            navigate("/eventlog");
          },
        },
      });
      temp.push({
        key: "apikeys",
        label: t("api_keys"),
        value: "apikeys-link",
        icon: "keys",
        link: {
          onClick: function onClick() {
            navigate("/apikeys");
          },
        },
      });
    }
    if (
      hasRole(accountIdmRoles, [
        ROLES.SUPERUSER,
        ROLES.PLANT_DOCUMENT_RESPONSIBLE,
      ])
    ) {
      temp.push({
        key: "plant_document_coordinator_page",
        label: t("plant_document_coordinator_page"),
        value: "plant_document_coordinator_page",
        icon: "settings",
        link: {
          onClick: function onClick() {
            navigate("/plant-coordinator-management");
          },
        },
      });
    }
    temp.push({
      label: t("data_protection_notice"),
      value: "data_protection_notice",
      icon: "alert-info",
      link: {
        onClick: function onClick() {
          setOpenDataPrt(true);
        },
      },
    });
    temp.push({
      label: t("user_manual"),
      value: "user_manual",
      icon: "document-ppt",
      link: {
        onClick: function onClick() {
          navigate("/user-manual");
        },
      },
    });
    setMenuItems(temp);
  }, [account, accountIdmRoles, t, basicMenuItems, navigate]);

  useEffect(() => {
    const renewAndCheckToken = async () => {
      if (
        localStorage.getItem("DOSaccessTokenForUsers") &&
        localStorage.getItem("DOSaccessToken")
      ) {
        await checkTokenData();
        setTimeRemaining(getTimeRemaining());
      } else {
        checkTokenData();
      }
    };

    renewAndCheckToken();
  }, [checkTokenData, getTimeRemaining]);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (
        event.target.classList.contains("ui-ic-menu") ||
        event.target.classList.contains("boschicon-bosch-ic-close")
      ) {
        toggleSidebar();
      }
    };

    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  function Refresh() {
    window.location.reload(false);
  }

  return (
    <div>
      {isAuthenticated !== undefined ? (
        <>
          {isAuthenticated ? (
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <UserContext.Provider
                value={{
                  loggedUserId: account.split("@")[0],
                  loggedUserRole: accountRoles,
                  loggedUserName: accountName,
                  loggedUserIdmRole: accountIdmRoles,
                  isSuperuser: isSuperuser,
                }}
              >
                <RoleSelector
                  open={isRoleDialogOpen}
                  setOpen={setIsRoleDialogOpen}
                  setRoles={setAccountIdmRoles}
                  isSuperuser={isSuperuser}
                />
                {isAuthenticated && (
                  <MinimalHeader
                    ref={navRef}
                    actions={[
                      {
                        label: (
                          <div className="App">
                            <Tooltip
                              title={
                                accountIdmRoles.length === 0
                                  ? null
                                  : accountIdmRoles.map((role) => {
                                      return (
                                        <>
                                          {t(role)}
                                          <br />
                                        </>
                                      );
                                    })
                              }
                            >
                              <Button
                                sx={{ fontSize: "16px", textTransform: "none" }}
                                style={{
                                  backgroundColor: "transparent",
                                  color: "black",
                                }}
                                onClick={() => setIsRoleDialogOpen(true)}
                              >
                                {imageUrl ? (
                                  <>
                                    <Avatar
                                      alt={accountName}
                                      src={imageUrl}
                                      sx={{
                                        width: 24,
                                        height: 24,
                                        marginX: "1rem",
                                      }}
                                    />
                                  </>
                                ) : (
                                  <>
                                    <Avatar
                                      alt={accountName}
                                      sx={{
                                        width: 24,
                                        height: 24,
                                        marginX: "1rem",
                                      }}
                                    >
                                      <PersonIcon />
                                    </Avatar>
                                  </>
                                )}
                                {accountName}
                              </Button>
                            </Tooltip>
                          </div>
                        ),
                        showLabel: true,
                      },
                      {
                        label: (
                          <Button
                            onClick={() => toggleLanguage()}
                            variant="outlined"
                            styles={{ float: "right" }}
                          >
                            {languageButtonLabel()}
                          </Button>
                        ),
                        showLabel: true,
                      },
                      {
                        label: (
                          <Button
                            onClick={() => {
                              sessionStorage.clear();
                              localStorage.clear();
                              setIsAuthenticated(false);
                              navigate("/");
                            }}
                            variant="contained"
                            styles={{ float: "right" }}
                            sx={{ width: "11rem" }}
                          >
                            <Logout sx={{ paddingRight: 1 }} />
                            <span>{t("logout")}</span>
                          </Button>
                        ),
                        showLabel: true,
                      },
                      {
                        label: (
                          <div className="App">
                            <Grid container paddingTop={0.7}>
                              <Badge
                                badgeContent={notificationCount}
                                color="primary"
                                onClick={handleNotificationClick}
                              >
                                <NotificationsIcon />
                              </Badge>

                              <Popover
                                open={notificationsOpen}
                                anchorEl={notificationAnchorEl}
                                onClose={() => setNotificationsOpen(false)}
                                anchorOrigin={{
                                  vertical: "bottom",
                                  horizontal: "center",
                                }}
                                transformOrigin={{
                                  vertical: "top",
                                  horizontal: "center",
                                }}
                              >
                                <Grid
                                  container
                                  sx={{
                                    maxHeight: 800,
                                    maxWidth: 800,
                                  }}
                                >
                                  <Grid item xs={12}>
                                    <List
                                      sx={{
                                        overflow: "auto",
                                        overflowX: "hidden",
                                      }}
                                    >
                                      {notifications.map(
                                        (notification, index) => (
                                          <ListItem
                                            key={index}
                                            sx={{
                                              backgroundColor: notification.seen
                                                ? "white"
                                                : "#D1E4FF",
                                              cursor: "pointer",
                                              padding: "0.5rem",
                                              "&:hover": {
                                                backgroundColor:
                                                  notification.seen
                                                    ? "#C1C7CC"
                                                    : "#D0D4D8",
                                              },
                                            }}
                                            onClick={() => {
                                              setNotificationsOpen(false);
                                              navigate(notification.url);
                                              let notificationCountTmp =
                                                notificationCount;
                                              setNotifications(
                                                notifications.map(
                                                  (notification, i) => {
                                                    if (!notification.seen) {
                                                      if (i === index) {
                                                        notification.seen = true;
                                                        notificationCountTmp--;
                                                      } else if (
                                                        notification.workflow_id &&
                                                        notification.workflow_id ===
                                                          notifications[index]
                                                            .workflow_id
                                                      ) {
                                                        notification.seen = true;
                                                        notificationCountTmp--;
                                                      } else if (
                                                        notification.document_unique_id &&
                                                        notification.document_unique_id ===
                                                          notifications[index]
                                                            .document_unique_id
                                                      ) {
                                                        notification.seen = true;
                                                        notificationCountTmp--;
                                                      }
                                                    }
                                                    return notification;
                                                  }
                                                )
                                              );
                                              setNotificationCount(
                                                notificationCountTmp
                                              );
                                            }}
                                          >
                                            <Grid
                                              container
                                              sx={{
                                                marginRight: "0.5rem",
                                                paddingRight: "0.5rem",
                                              }}
                                            >
                                              <Grid
                                                item
                                                xs={1}
                                                sx={{
                                                  display: "flex",
                                                  justifyContent: "center",
                                                  alignItems: "center",
                                                  margin: 0,
                                                }}
                                              >
                                                <Grid
                                                  container
                                                  sx={{ margin: 0 }}
                                                >
                                                  <Grid
                                                    item
                                                    xs={12}
                                                    sx={{
                                                      display: "flex",
                                                      justifyContent: "center",
                                                      alignItems: "center",
                                                    }}
                                                  >
                                                    {notification.type ===
                                                    "workflow-approved" ? (
                                                      <CheckCircleOutlineIcon
                                                        sx={{ color: "green" }}
                                                      />
                                                    ) : null}
                                                    {notification.type ===
                                                    "workflow-approval-needed" ? (
                                                      <HourglassEmptyIcon
                                                        sx={{ color: "orange" }}
                                                      />
                                                    ) : null}
                                                    {notification.type ===
                                                    "workflow-pending-state" ? (
                                                      <HourglassEmptyIcon
                                                        sx={{ color: "orange" }}
                                                      />
                                                    ) : null}

                                                    {notification.type ===
                                                    "workflow-rejected" ? (
                                                      <CancelIcon
                                                        sx={{ color: "red" }}
                                                      />
                                                    ) : null}
                                                    {notification.type ===
                                                    "workflow-started" ? (
                                                      <StartIcon
                                                        sx={{ color: "green" }}
                                                      />
                                                    ) : null}
                                                    {notification.type ===
                                                    "workflow-everyone-approved" ? (
                                                      <DoneAllIcon
                                                        sx={{ color: "green" }}
                                                      />
                                                    ) : null}
                                                    {notification.type ===
                                                    "document-expiration-reminder" ? (
                                                      <ArchiveIcon
                                                        sx={{ color: "orange" }}
                                                      />
                                                    ) : null}
                                                    {notification.type ===
                                                    "document-archived" ? (
                                                      <ArchiveIcon
                                                        sx={{ color: "orange" }}
                                                      />
                                                    ) : null}
                                                    {notification.type ===
                                                    "document-automatically-archived" ? (
                                                      <ArchiveIcon
                                                        sx={{ color: "orange" }}
                                                      />
                                                    ) : null}
                                                  </Grid>
                                                  <Grid
                                                    item
                                                    xs={12}
                                                    sx={{
                                                      display: "flex",
                                                      justifyContent: "center",
                                                      alignItems: "center",
                                                    }}
                                                  >
                                                    <Tooltip
                                                      title={moment(
                                                        notification.timestamp
                                                      ).format(
                                                        "YYYY-MM-DD HH:mm:ss"
                                                      )}
                                                    >
                                                      <Typography
                                                        variant="caption"
                                                        sx={{
                                                          fontSize: "0.6rem",
                                                          paddingTop: "0.5rem",
                                                          display: "flex",
                                                          justifyContent:
                                                            "center",
                                                          alignItems: "center",
                                                          textAlign: "center",
                                                        }}
                                                      >
                                                        {moment(
                                                          notification.timestamp
                                                        ).fromNow()}
                                                      </Typography>
                                                    </Tooltip>
                                                  </Grid>
                                                </Grid>
                                              </Grid>
                                              <Grid
                                                item
                                                xs={11}
                                                sx={{ paddingLeft: "1rem" }}
                                              >
                                                <Grid container>
                                                  <Grid item xs={12}>
                                                    <Typography
                                                      variant="body2"
                                                      sx={{
                                                        fontWeight: "bold",
                                                      }}
                                                    >
                                                      {isHun
                                                        ? notification.hungarian_subject
                                                        : notification.english_subject}
                                                    </Typography>
                                                  </Grid>
                                                  <Grid item xs={12}>
                                                    <Typography
                                                      variant="body2"
                                                      sx={{
                                                        paddingTop: "0.5rem",
                                                      }}
                                                    >
                                                      {isHun
                                                        ? notification.hungarian_text.replace(
                                                            "<br>",
                                                            "\n"
                                                          )
                                                        : notification.english_text.replace(
                                                            "<br>",
                                                            "\n"
                                                          )}
                                                    </Typography>
                                                  </Grid>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </ListItem>
                                        )
                                      )}
                                    </List>
                                  </Grid>
                                  {notificationCount > 0 && (
                                    <Grid item xs={12}>
                                      <Button
                                        variant="outlined"
                                        color="primary"
                                        sx={{
                                          float: "right",
                                          margin: "0.5rem",
                                        }}
                                        onClick={() => {
                                          api()
                                            .post("/api/notifications/seenAll")
                                            .then((response) => {
                                              setNotifications(false);
                                              setNotifications(
                                                notifications.map(
                                                  (notification) => {
                                                    notification.seen = true;
                                                    return notification;
                                                  }
                                                )
                                              );
                                              setNotificationCount(0);
                                            });
                                        }}
                                      >
                                        {t("mark-all-as-seen")}
                                      </Button>
                                    </Grid>
                                  )}
                                  {notifications.length === 0 && (
                                    <>
                                      <Grid
                                        item
                                        xs={12}
                                        sx={{
                                          display: "flex",
                                          justifyContent: "center",
                                          alignItems: "center",
                                          paddingTop: "5rem",
                                          paddingBottom: "1rem",
                                        }}
                                      >
                                        <CheckCircleOutlineIcon
                                          sx={{ color: "green" }}
                                          fontSize="large"
                                        />
                                      </Grid>
                                      <Grid item xs={12}>
                                        <Typography
                                          sx={{
                                            paddingBottom: "5rem",
                                            paddingX: "5rem",
                                            textAlign: "center",
                                            fontSize: "1rem",
                                            color: "grey",
                                          }}
                                        >
                                          {t("no_notifications")}
                                        </Typography>
                                      </Grid>
                                    </>
                                  )}
                                </Grid>
                              </Popover>
                            </Grid>
                          </div>
                        ),
                        showLabel: true,
                      },
                    ]}
                    logo={{
                      href: "https://bosch.com",
                      target: "_blank",
                      "aria-label": "My Logo",
                      title: "My Logo",
                    }}
                    children="Document Store"
                    sideNavigation={{
                      contrast: true,
                      header: {},
                      body: {
                        menuItems: menuItems,
                      },
                    }}
                  />
                )}
                <div
                  className={`e-container -full-width ${
                    isSidebarOpen ? "-sidebar-opened" : "-sidebar-closed"
                  }`}
                >
                  <Routes>
                    <Route path="/user-manual" element={<UserManual />} />
                    <Route
                      path="/archive-browser"
                      element={
                        <ProtectedRoute
                          isAllowed={hasRole(accountIdmRoles, [
                            ROLES.SUPERUSER,
                            ROLES.ARCHIVE,
                            ROLES.PLANT_DOCUMENT_RESPONSIBLE,
                            ROLES.DOCUMENT_RESPONSIBLE,
                            ROLES.TWI_COORDINATOR,
                          ])}
                        >
                          <DocumentBrowser isArchive={true} />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/" element={<Home />} />
                    <Route
                      path="/workflow-view/:id"
                      element={<WorkflowView />
                      }
                    />
                    <Route
                      path="/document-browser"
                      element={<DocumentBrowser />}
                    />
                    <Route
                      path="/document-view/:id/:version"
                      element={<DocumentIframe />}
                    />

                    <Route
                      path="/document-view-details/:id/:version"
                      element={<DocumentViewer2 />}
                    />

                    <Route
                      path="/document-view-details/:id/"
                      element={<DocumentViewer2 />}
                    />

                    <Route path="/login" element={<Login />} />

                    <Route
                      path="/eventlog"
                      element={
                        <ProtectedRoute
                          isAllowed={hasRole(accountIdmRoles, [
                            ROLES.SUPERUSER,
                          ])}
                        >
                          <EventLog />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/apikeys"
                      element={
                        <ProtectedRoute
                          isAllowed={hasRole(accountIdmRoles, [
                            ROLES.SUPERUSER,
                          ])}
                        >
                          <ApiKeys />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/document-uploader"
                      element={
                        <ProtectedRoute
                          isAllowed={hasRole(accountIdmRoles, [
                            ROLES.SUPERUSER,
                            ROLES.EDITOR,
                            ROLES.PLANT_DOCUMENT_RESPONSIBLE,
                            ROLES.DEPARTMENT_LEADER,
                            ROLES.QTEAMER,
                            ROLES.HSE,
                            ROLES.ARCHIVE,
                            ROLES.TWI_COORDINATOR,
                            ROLES.DOCUMENT_RESPONSIBLE,
                            ROLES.TEF6,
                            ROLES.GROUP_LEADER,
                            ROLES.PRODUCT_PLANNER,
                          ])}
                        >
                          <DocumentUploader />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/document-uploader-landing"
                      element={
                        <ProtectedRoute
                          isAllowed={hasRole(accountIdmRoles, [
                            ROLES.EDITOR,
                            ROLES.SUPERUSER,
                            ROLES.PLANT_DOCUMENT_RESPONSIBLE,
                            ROLES.DEPARTMENT_LEADER,
                            ROLES.QTEAMER,
                            ROLES.HSE,
                            ROLES.TWI_COORDINATOR,
                            ROLES.DOCUMENT_RESPONSIBLE,
                            ROLES.TEF6,
                            ROLES.GROUP_LEADER,
                            ROLES.PRODUCT_PLANNER,
                          ])}
                        >
                          <DocumentUploaderLanding />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/workflow-creation/"
                      element={
                        <ProtectedRoute
                          isAllowed={hasRole(accountIdmRoles, [
                            ROLES.EDITOR,
                            ROLES.SUPERUSER,
                            ROLES.PLANT_DOCUMENT_RESPONSIBLE,
                            ROLES.DEPARTMENT_LEADER,
                            ROLES.QTEAMER,
                            ROLES.HSE,
                            ROLES.ARCHIVE,
                            ROLES.TWI_COORDINATOR,
                            ROLES.DOCUMENT_RESPONSIBLE,
                            ROLES.TEF6,
                            ROLES.GROUP_LEADER,
                            ROLES.PRODUCT_PLANNER,
                            ROLES.ARCHIVE,
                          ])}
                        >
                          <WorkflowCreate />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/workflow-management/"
                      element={
                        <ProtectedRoute
                          isAllowed={hasRole(accountIdmRoles, [
                            ROLES.EDITOR,
                            ROLES.SUPERUSER,
                            ROLES.PLANT_DOCUMENT_RESPONSIBLE,
                            ROLES.DEPARTMENT_LEADER,
                            ROLES.QTEAMER,
                            ROLES.ARCHIVE,
                            ROLES.HSE,
                            ROLES.TWI_COORDINATOR,
                            ROLES.DOCUMENT_RESPONSIBLE,
                            ROLES.TEF6,
                            ROLES.GROUP_LEADER,
                            ROLES.PRODUCT_PLANNER,
                          ])}
                        >
                          <WorkflowLanding />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/workflow-history/"
                      element={
                        <ProtectedRoute
                          isAllowed={hasRole(accountIdmRoles, [
                            ROLES.EDITOR,
                            ROLES.SUPERUSER,
                            ROLES.PLANT_DOCUMENT_RESPONSIBLE,
                            ROLES.DEPARTMENT_LEADER,
                            ROLES.QTEAMER,
                            ROLES.HSE,
                            ROLES.ARCHIVE,
                            ROLES.TWI_COORDINATOR,
                            ROLES.DOCUMENT_RESPONSIBLE,
                            ROLES.TEF6,
                            ROLES.GROUP_LEADER,
                            ROLES.PRODUCT_PLANNER,
                          ])}
                        >
                          <WorkflowHistory />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                    <Route
                      path="/plant-coordinator-management"
                      element={
                        <ProtectedRoute
                          isAllowed={hasRole(accountIdmRoles, [
                            ROLES.SUPERUSER,
                            ROLES.PLANT_DOCUMENT_RESPONSIBLE,
                          ])}
                        >
                          <PlantDocumentCoordinator />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </div>
              </UserContext.Provider>
              <Footer></Footer>
            </LocalizationProvider>
          ) : (
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <UserContext.Provider
                value={{
                  loggedUserId: "",
                  loggedUserRole: [],
                  loggedUserName: "",
                  loggedUserIdmRole: [],
                }}
              >
                <MinimalHeader
                  ref={navRef}
                  actions={[
                    {
                      label: (
                        <Button
                          onClick={() => toggleLanguage()}
                          variant="outlined"
                          styles={{ float: "right" }}
                        >
                          {languageButtonLabel()}
                        </Button>
                      ),
                      showLabel: true,
                    },
                    {
                      label: <Login />,
                      showLabel: true,
                    },
                  ]}
                  logo={{
                    href: "https://bosch.com",
                    target: "_blank",
                    "aria-label": "My Logo",
                    title: "My Logo",
                  }}
                  children="Document Store"
                  sideNavigation={{
                    contrast: true,
                    body: {
                      menuItems: [
                        {
                          label: t("document_browser"),
                          value: "document-editor",
                          icon: "document-search",
                          link: {
                            onClick: function onClick() {
                              navigate("/");
                            },
                          },
                        },
                        {
                          label: t("user_manual"),
                          value: "user_manual",
                          icon: "document-ppt",
                          link: {
                            onClick: function onClick() {
                              navigate("/user-manual");
                            },
                          },
                        },
                      ],
                    },
                  }}
                />

                <div
                  className={`e-container -full-width ${
                    isSidebarOpen ? "-sidebar-opened" : "-sidebar-closed"
                  }`}
                >
                  <Routes>
                    <Route path="/" element={<DocumentBrowser />} />
                    <Route path="/login" element={<Login />} />
                    <Route
                      path="/document-view-details/:id/:version"
                      element={<DocumentViewer2 />}
                    />
                    <Route
                      path="/document-view-details/:id/"
                      element={<DocumentViewer2 />}
                    />
                    <Route
                      path="/document-uploader"
                      element={<NoRoleMessage />}
                    />
                    <Route
                      path="/document-uploader-landing"
                      element={<NoRoleMessage />}
                    />
                    <Route
                      path="/workflow-view/:id"
                      element={<NoRoleMessage />}
                    />
                    <Route
                      path="/document-view/:id/:version"
                      element={<DocumentIframe />}
                    />
                    <Route
                      path="/document-view-details/:id/:version"
                      element={<NoRoleMessage />}
                    />
                    <Route
                      path="/document-view-details/:id/"
                      element={<DocumentViewer2 />}
                    />
                    <Route
                      path="/document-view-details2/:id/:version"
                      element={<NoRoleMessage />}
                    />
                    <Route
                      path="/workflow-creation/"
                      element={<NoRoleMessage />}
                    />

                    <Route
                      path="/workflow-management/"
                      element={<NoRoleMessage />}
                    />
                    <Route
                      path="/workflow-history/"
                      element={<NoRoleMessage />}
                    />
                    <Route path="/user-manual" element={<UserManual />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </UserContext.Provider>
              <Footer></Footer>
            </LocalizationProvider>
          )}
        </>
      ) : (
        <Spinner size={"medium"} />
      )}
      <DataProtectionNotice open={openDataPrt} setOpen={setOpenDataPrt} />
    </div>
  );
}

export default App;
