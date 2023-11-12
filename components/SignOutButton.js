import React from "react";
import { Button } from "@bosch/react-frok";
import { useMsal } from "@azure/msal-react";

/**
 * Renders a button which, when selected, will redirect the page to the login prompt
 */
export const SignOutButton = () => {
  const { instance } = useMsal();

  const handleLogout = (logoutType) => {
    if (logoutType === "silent") {
      instance.logoutSilent({
        postLogoutRedirectUri: "/",
        mainWindowRedirectUri: "/", // redirects the top level app after logout
      });
      localStorage.clear();
      sessionStorage.clear();
    }
  };
  return (
    <Button
      onClick={() => handleLogout("silent")}
      label={"Logout"}
      styles={{ float: "right" }}
    />
  );
};
