import React, { useState, useEffect } from "react";
import { Avatar } from "@mui/material";
import Axios from "axios";
import PersonIcon from "@mui/icons-material/Person";

const AvatarComponent = ({ userid, name, size }) => {
  const [avatarSrc, setAvatarSrc] = useState(null);

  useEffect(() => {
    const getImage = (userid) => {
      const token2 = localStorage.getItem("DOSaccessTokenForUsers");
      Axios.get(
        `https://graph.microsoft.com/v1.0/users/${userid}@bosch.com/photo/$value`,
        {
          headers: { Authorization: `Bearer ${token2}` },
          responseType: "blob",
        }
      )
        .then((o) => {
          const url = window.URL || window.webkitURL;
          const blobUrl = url.createObjectURL(o.data);
          setAvatarSrc(blobUrl); // set the state value here
        })
        .catch((error) => {
          setAvatarSrc(null); // set the state value here
        });
    };

    getImage(userid);
  }, [userid]);

  return (
    <>
      {avatarSrc ? (
        <Avatar alt={name} src={avatarSrc} sx={size==="small"? { width: 25, height: 25 , marginLeft: 1} : {width: 40, height: 40}}/>
      ) : (
        <Avatar alt={name} sx={size==="small"? { width: 25, height: 25 , marginLeft: 1} : {width: 40, height: 40}}>
          <PersonIcon />
        </Avatar>
      )}
    </>
  );
};

export default AvatarComponent;
