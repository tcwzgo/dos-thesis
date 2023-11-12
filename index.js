import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import { EventType, PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import "./i18nextConf";

// Somewhere in your `index.ts`:
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
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router>
    <MsalProvider instance={pca} forceLogin={false}>
      <App />
    </MsalProvider>
  </Router>
);
