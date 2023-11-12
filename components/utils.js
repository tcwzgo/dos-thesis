import { OverlayActivityIndicator } from "@bosch/react-frok";
import moment from "moment";

export const ROLES = {
  DOCUMENT_RESPONSIBLE: "DOCUMENT_RESPONSIBLE",
  EDITOR: "EDITOR",
  ARCHIVE: "ARCHIVE",
  VIEWER: "VIEWER",
  PLANT_DOCUMENT_RESPONSIBLE: "PLANT_DOCUMENT_RESPONSIBLE",
  DEPARTMENT_LEADER: "DEPARTMENT_LEADER",
  QTEAMER: "QTEAMER",
  HSE: "HSE",
  TWI_COORDINATOR: "TWI_COORDINATOR",
  TEF6: "TEF6",
  GROUP_LEADER: "GROUP_LEADER",
  PRODUCT_PLANNER: "PRODUCT_PLANNER",
  SUPERUSER: "SUPERUSER"
}

export const idmRolesToRoleNames = [
  {
    name: ROLES.VIEWER,
    idmDisplayName: "\\idm2bcd_HtvP_Document-Store_Viewer"
  },
  {
    name: ROLES.EDITOR,
    idmDisplayName: "\\idm2bcd_HtvP_Document-Store_Editor"
  },
  {
    name: ROLES.ARCHIVE,
    idmDisplayName: "\\idm2bcd_HtvP_Document-Store_Archive"
  },
  {
    name: ROLES.PLANT_DOCUMENT_RESPONSIBLE,
    idmDisplayName: "\\idm2bcd_HtvP_Document-Store_Plant_Document_Responsible"
  },
  {
    name: ROLES.QTEAMER,
    idmDisplayName: "\\idm2bcd_HtvP_Document-Store_QTeamer"
  },
  {
    name: ROLES.TWI_COORDINATOR,
    idmDisplayName: "\\idm2bcd_HtvP_Document-Store_TWI_coordinator"
  },
  {
    name: ROLES.DEPARTMENT_LEADER,
    idmDisplayName: "\\idm2bcd_HtvP_Document-Store_VSDepartment_Leader"
  },
  {
    name: ROLES.TEF6,
    idmDisplayName: "\\idm2bcd_HtvP_Document-Store_TEF6"
  },
  {
    name: ROLES.HSE,
    idmDisplayName: "\\idm2bcd_HtvP_Document-Store_HSE"
  },
  {
    name: ROLES.GROUP_LEADER,
    idmDisplayName: "\\idm2bcd_HtvP_Document-Store_Group_leader"
  },
  {
    name: ROLES.PRODUCT_PLANNER,
    idmDisplayName: "\\idm2bcd_HtvP_Document-Store_Product_Planner"
  },
  {
    name: ROLES.DOCUMENT_RESPONSIBLE,
    idmDisplayName: "\\idm2bcd_HtvP_Document-Store_Document_Responsible"
  },
  {
    name: ROLES.SUPERUSER,
    idmDisplayName: "\\idm2bcd_HtvP_Document-Store_Superuser"
  },
]

export const roles = {
  [ROLES.DOCUMENT_RESPONSIBLE]: {
    asmRoleId: 84,
    idmDisplayName: "idm2bcd_HtvP_Document-Store_Document_Responsible",
    name: "Dokumentumfelelős",
  },
  [ROLES.PRODUCT_PLANNER]: {
    asmRoleId: 87,
    idmDisplayName: "idm2bcd_HtvP_Document-Store_Product_Planner",
    name: "Termék mérnök",
  },
  [ROLES.GROUP_LEADER]: {
    asmRoleId: 86,
    idmDisplayName: "idm2bcd_HtvP_Document-Store_Group_leader",
    name: "Csoportvezető",
  },
  [ROLES.HSE]: {
    asmRoleId: 82,
    idmDisplayName: "idm2bcd_HtvP_Document-Store_HSE",
    name: "HSE",
  },
  [ROLES.TEF6]: {
    asmRoleId: 85,
    idmDisplayName: "idm2bcd_HtvP_Document-Store_TEF6",
    name: "TEF6",
  },
  [ROLES.DEPARTMENT_LEADER]: {
    asmRoleId: 81,
    idmDisplayName: "idm2bcd_HtvP_Document-Store_VSDepartment_Leader",
    name: "Osztály/VS vezető",
  },
  [ROLES.TWI_COORDINATOR]: {
    asmRoleId: 83,
    idmDisplayName: "idm2bcd_HtvP_Document-Store_TWI_coordinator",
    name: "TWI Coach",
  },
  [ROLES.QTEAMER]: {
    asmRoleId: 80,
    idmDisplayName: "idm2bcd_HtvP_Document-Store_QTeamer",
    name: "Q-teamer",
  },
  [ROLES.ARCHIVE]: {
    asmRoleId: null,
    idmDisplayName: "idm2bcd_HtvP_Document-Store_Archive",
    name: "Archív",
  },
  [ROLES.VIEWER]: {
    asmRoleId: null,
    idmDisplayName: "idm2bcd_HtvP_Document-Store_Viewer",
    name: "Látogató",
  },
  [ROLES.EDITOR]: {
    asmRoleId: null,
    idmDisplayName: "idm2bcd_HtvP_Document-Store_Editor",
    name: "Szerkesztő",
  },
  [ROLES.SUPERUSER]: {
    asmRoleId: null,
    idmDisplayName: "idm2bcd_HtvP_Document-Store_Superuser",
    name: "Superuser",
  },
  [ROLES.PLANT_DOCUMENT_RESPONSIBLE]: {
    asmRoleId: null,
    idmDisplayName: "idm2bcd_HtvP_Document-Store_Plant_Document_Responsible",
    name: "Gyári dokumentumfelelős"
  }
};

export function CustomLoadingOverlay() {
  return <OverlayActivityIndicator size={"small"} disableBlur={true} />;
}

export const readIdmNamesOfGivenRoles = (givenRoles) => {
  if (givenRoles.length === 0 || !givenRoles) return []
  const results = []
  for (const key of Object.keys(roles)) {
    for (const roleName of givenRoles) {
      if (key === roleName) {
        results.push(roles[key].idmDisplayName)
      }
      continue
    }
  }
  return results
}

export const readDisplayNamesOfGivenIdmRole = (givenIdmRole) => {
  if (givenIdmRole) {
    const result = Object.keys(roles).find((role) => roles[role].idmDisplayName === givenIdmRole)
    if (roles[result]) {
      return roles[result].name
    }
    return givenIdmRole
  }
  return null
} 

export const reFormatDate = (dateToReformat) => {
  return moment(dateToReformat).isValid() ? moment(dateToReformat) : null;
};

export const searchForDuplication = (array) => {
  const duplicateItems = array.filter(
    (item, index) => array.indexOf(item) !== index
  );

  return duplicateItems.length > 0;
};

export const transformData = (data) => {
  if (data === "") {
    return null;
  }
  return { value: 0, label: data };
};

export const transformArray = (data) => {
  let final = data.map((e, i) => {
    // I don't want to transform something that has already been transoformed
    // i.e.: when adding a related document it transforms the already transformed data
    // therefore it cannnot render properly
    if (typeof e === "object") {
      return e;
    } else {
      return { value: i, label: e };
    }
  });
  return final;
};

export const hasRole = (roles, expected) => {
  return roles.some((item) => expected.includes(item));
};

export const transformUserData = (userData) => {
  const temp = [];
  for (const record of userData) {
    temp.push({
      value: record.userPrincipalName.split("@")[0],
      label: record.displayName,
    });
  }
  return temp;
}; 