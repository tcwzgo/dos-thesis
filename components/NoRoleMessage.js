import React, { useContext } from "react";
import { Layout } from "@bosch/react-frok";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Login from "./Login";
import { useTranslation } from "react-i18next";
import { UserContext } from "../App";

function NoRoleMessage() {
  const { t } = useTranslation();
  const { loggedUserId } = useContext(UserContext)
  return (
    <Layout fullWidth={false}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            boxShadow: 5,
            margin: 5,
            padding: 2,
          }}
        >
          <Grid container padding={2} spacing={1}>
            {loggedUserId ? (
            <Grid item xs={12}>
              {t("unauthorized_logged_in")}
            </Grid>) : (<Grid item xs={12}>
              {t("unauthorized")}
            </Grid>)}
          </Grid>
          {loggedUserId ? null : <Login />}
          
        </Box>
      </div>
    </Layout>
  );
}

export default NoRoleMessage;
