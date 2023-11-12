import React, { useState } from "react";
import { Grid } from "@mui/material";
import { SignInButton } from "./SignInButton.js";
import { EventType, PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import "./Login.scss";

import { useTranslation } from "react-i18next";
function Login() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const pca = new PublicClientApplication({
    auth: {
      clientId: "5885eb12-3ff6-4d21-8a7e-c11dc8cf44a5",
      authority:
        "https://login.microsoftonline.com/0ae51e19-07c8-4e4b-bb6d-648ee58410f4",
      clientSecret: process.env.AZURE_SECRET,
      redirectUri: "/",
    },
  });

  pca.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS) {
      pca.setActiveAccount(event.payload.account);
    }
  });

  const [message, setMessage] = useState(0);

  return (
    <Grid
      zIndex={100}
      container
      spacing={1}
      sx={{
        width: "auto",
      }}
      align="center"
      justify="center"
      alignItems="center"
    >
      <Grid item xs={12}>
        <MsalProvider instance={pca} forceLogin={false}>
          <SignInButton
            setMessage={setMessage}
            loading={loading}
            setLoading={setLoading}
          />
        </MsalProvider>
      </Grid>

      {message === 1 && console.log(t("invalid_login_credentials"))}
      {message === 3 && console.log(t("successfully_logged_in"))}
    </Grid>
  );
}

export default Login;
