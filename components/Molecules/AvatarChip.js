import React from "react";
import { Avatar } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import Chip from "@mui/material/Chip";
import AvatarComponent from "./AvatarComponent";

const AvatarChip = ({ userid, name, size, backgroundColor }) => {

  return (
    <>
      <Chip
        sx={{ backgroundColor: backgroundColor }}
        avatar={userid ? (
          <AvatarComponent
            userid={userid}
            name={name}
            size={size}
          />
        ) : (
          <Avatar
            alt={name}
            sx={{ width: 24, height: 24 }}
          >
            <PersonIcon />
          </Avatar>
        )}
        label={name}>
      </Chip >
    </>
  );
};

export default AvatarChip;
