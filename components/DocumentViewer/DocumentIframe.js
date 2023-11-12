import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { OverlayActivityIndicator } from "@bosch/react-frok";
import Iframe from "react-iframe";
import { useTranslation } from "react-i18next";

function DocumentIframe() {
  const { id } = useParams();
  const [isPending, setIsPending] = useState(true);
  const { version } = useParams();
  const { t } = useTranslation();
  const [iframeurl, setIframeUrl] = useState();
  useEffect(() => {
    setIsPending(true);
    const documentFetched = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const blob = new Blob([xhr.response], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          setIframeUrl(url);
        }
        setIsPending(false);
      }
    };
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = documentFetched;
    xhr.open(
      "GET",
      `${process.env.REACT_APP_HOST_NAME}/api/documents/${id}/${version}/document`,
      true
    );
    xhr.responseType = "blob";
    xhr.setRequestHeader(
      "DOSaccessToken",
      localStorage.getItem("DOSaccessToken")
    );
    xhr.send();
  }, []);

  function CustomLoadingOverlay() {
    return <OverlayActivityIndicator size={"small"} disableBlur={true} />;
  }

  return (
    <div>
      {!isPending ? (
        iframeurl ? (
          <Iframe
            url={iframeurl}
            width="100%"
            height="1400rem"
            id=""
            className=""
            display="block"
            position="relative"
            flexDirection="row"
          />
        ) : (
          <h4>{t("document_not_found")}</h4>
        )
      ) : (
        <CustomLoadingOverlay />
      )}
    </div>
  );
}

export default DocumentIframe;
