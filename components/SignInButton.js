import React from "react";
import { useMsalAuthentication } from "@azure/msal-react";
import { InteractionType } from "@azure/msal-browser";
import { useTranslation } from "react-i18next";
import LoadingButton from "@mui/lab/LoadingButton";
import { Login } from "@mui/icons-material";

/**
 * Renders a button which, when selected, will redirect the page to the login prompt
 */
export function SignInButton({ setMessage, loading, setLoading }) {
  const { t } = useTranslation();

  const requestForUsers = {
    scopes: ["user.readbasic.all", "GroupMember.Read.All"],
  };

  const { login: loginForUsers } =
    useMsalAuthentication(requestForUsers);

  async function FirstLogin() {
    await loginForUsers(InteractionType.Popup, requestForUsers)
      .then((response) => {
        window.localStorage.setItem(
          "DOSaccessTokenForUsers",
          response.accessToken
        );
        window.localStorage.setItem("DOSaccessToken", response.idToken);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  async function LoadData() {
    setMessage(2);
    if (
      !localStorage.getItem("DOSaccessTokenForUsers") &&
      !localStorage.getItem("DOSaccessToken")
    ) {
      await FirstLogin();
      setMessage(3);
      setLoading(false);
      Refresh();
    } else {
      setMessage(3);
      setLoading(false);
      Refresh();
    }
  }
  function Refresh() {
    window.location.reload(false);
  }
  const handleLogin = async (loginType) => {
    setLoading(true);
    setMessage(2);
    await LoadData();
  };
  return (
    <LoadingButton
      onClick={() => handleLogin("popup")}
      variant="contained"
      loading={loading}
      sx={{ float: "right", width: "12rem" }}
    >
      <Login sx={{ paddingRight: 1 }} />
      <span>{t("login")}</span>
    </LoadingButton>
  );
}
