import React from "react";
import { Layout } from "@bosch/react-frok";
import Grid from "@mui/material/Grid";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <Layout fullWidth={false}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Grid container padding={2} gap={1} spacing={1}>
          <Grid item xs={12}>
            <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>{t("no_such_route")}</h2>
            <span>{t("no_such_route_desc")}</span>
          </Grid>
          <Grid item xs={12} ml={0}>
             <Link to="/">{t("back_home")}</Link>
          </Grid>
        </Grid>
      </div>
    </Layout>
  );
}
