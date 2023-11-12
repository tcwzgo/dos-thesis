export const INITIAL_STATE = {
  search: {
    query: "",
    find_in_document_body: false,
  },
  filter: {
    date: null,
    creator: [],
    document_type: [],
    locations: [],
    affected_roles: [],
    product_family: [],
    areas: [],
    training_method: [],
    document_status: [],
    competence_criticality: [],
    departments: [],
    availability: [],
    confidentiality: [],
    integrity: [],
  },
  show_valid_to_all: true,
};

export const documentBrowserReducer = (storageState, action) => {
  switch (action.type) {
    case "CLEAR_ALL":
      return {
        search: {
          query: "",
          find_in_document_body: false,
        },
        filter: {
          date: null,
          creator: [],
          document_type: [],
          locations: [],
          affected_roles: [],
          product_family: [],
          areas: [],
          training_method: [],
          document_status: [],
          competence_criticality: [],
          departments: [],
          publisher_department: [],
          confidentiality: [],
          integrity: [],
          availability: [],
          related_documents: [],
        },
        show_valid_to_all: true,
      };
    case "ADD_FILTER":
      return {
        ...storageState,
        filter: {
          ...storageState.filter,
          [action.payload.name]: action.payload.value,
        },
      };
    case "ADD_OPTION":
      return {
        ...storageState,
        [action.payload.name]: action.payload.value,
      };
    case "ADD_SEARCH":
      return {
        ...storageState,
        search: {
          ...storageState.search,
          [action.payload.name]: action.payload.value,
        },
      };
    default:
      break;
  }
};
