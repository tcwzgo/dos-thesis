export const INITAL_STATE = {
    "id": "",
    "document_name": "",
    "document_version": "",
    "document_id": "",
    "migrated": false,
    "document_body": "<html content>",
    "related_documents": [],
    "documents": [],
    "attachments": [],
    "training_material": [],
    "supporting_documents": [],
    "training_tests": [],
    "creator": "",
    "creator_name": "",
    "data_security": {
        "confidentiality": "SC1",
        "integrity": "SC0",
        "availability": "SC2",
    },
    "allowed_editors": [],
    "scope": "",
    "locations": [],
    "approvers": [],
    "affected_roles": [],
    "product_family": [],
    "areas": [],
    "document_type": "",
    "document_status": "draft",
    "training_method": "",
    "training_deadline": 14,
    "competence_criticality": "",
    "expiration_date": null,
    "related_departments": [],
    "publisher_department": null
}


/**
 * @param {*} documentState manages state
 * @param {*} action is the type of update we want to perform on the state
 * @returns the new state
 */
export const documentFormReducer = (documentState, action) => {
    switch (action.type) {
        case 'CHANGE_INPUT':
            return {
                ...documentState,
                [action.payload.name]: action.payload.value
            }
        case 'CHANGE_DOC_SECURITY':
            return {
                ...documentState,
                data_security: {
                    ...documentState.data_security,
                    [action.payload.name]: action.payload.value
                }
            }
        // for document modification
        case 'LOAD_EXISTING_DOCUMENT':
            return {
                ...action.payload.value
            }
        default:
            return documentState
    }
}