export const approverTableReducer = (state, action) => {
    switch(action.type) {
        case "ADD_CREATOR": 
            return [
                {
                    level: 1,
                    isMandatory: true,
                    approverRoles: [
                        {
                            role: action.payload.role,
                            user: action.payload.creator,
                            isMandatory: true,
                            uuid: action.payload.uuid
                        }
                    ]
                }
            ]
        case "ADD_LEVEL":
            return [
                ...state,
                {
                    level: state.length + 1,
                    approverRoles: [],
                    isMandatory: false
                }
            ]
        case "ADD_ROLE":
            const stateWithEmptyRole = state.map((level) => {
                if (level.level === action.payload.level) {
                    return {
                        ...level,
                        approverRoles: [
                            ...level.approverRoles,
                            {
                                role: null,
                                user: null,
                                isMandatory: false,
                                uuid: action.payload.uuid
                            }
                        ]
                    }
                }
                return level
            })

            return [
                ...stateWithEmptyRole
            ]

        case "ADD_RESPONSIBILITY": 
            const stateWithAddedResponsibility = state.map((level) => {
                if (level.level === action.payload.level) {
                    const approverRolesWithAddedRole = [...level.approverRoles]
                    approverRolesWithAddedRole[action.payload.index] = {
                        ...approverRolesWithAddedRole[action.payload.index],
                        role: action.payload.role
                    }
                    return {
                        ...level,
                        approverRoles: approverRolesWithAddedRole
                    }
                }
                return level
            })

            return [
                ...stateWithAddedResponsibility
            ]
        case "EDIT_ROW":
            const stateWithRemovedResponsiblity = state.map((level) => {
                if (level.level === action.payload.level) {
                    const approverRolesWithRemovedResponsiblity = [...level.approverRoles]
                    approverRolesWithRemovedResponsiblity[action.payload.index] = {
                        ...approverRolesWithRemovedResponsiblity[action.payload.index],
                        role: null,
                        user: null
                    }
                    return {
                        ...level,
                        approverRoles: approverRolesWithRemovedResponsiblity
                    }
                }
                return level
            })

            return [
                ...stateWithRemovedResponsiblity
            ]
        case "DELETE_LEVEL":
            const stateWithRemovedLevel = state.filter((level) => level.level !== action.payload.level)
            return [
                ...stateWithRemovedLevel
            ]

        case "ADD_USER":
            const stateWithAddedUser = state.map((level) => {
                if (level.level === action.payload.level) {
                    const approverRolesWithAddedUser = [...level.approverRoles]
                    approverRolesWithAddedUser[action.payload.index] = {
                        ...approverRolesWithAddedUser[action.payload.index],
                        user: action.payload.user
                    }
                    return {
                        ...level,
                        approverRoles: approverRolesWithAddedUser
                    }
                }
                return level
            })

            return [
                ...stateWithAddedUser
            ]
        case "REMOVE_USER":
            const stateWithRemovedUser = state.map((level) => {
                if (level.level === action.payload.level) {
                    const approverRolesWithRemovedUser = [...level.approverRoles]
                    approverRolesWithRemovedUser[action.payload.index] = {
                        ...approverRolesWithRemovedUser[action.payload.index],
                        user: null
                    }
                    return {
                        ...level,
                        approverRoles: approverRolesWithRemovedUser
                    }
                }
                return level
            })

            return [
                ...stateWithRemovedUser
            ]
        
        case "REMOVE_ROLE":
            const stateWithRemovedRole = state.map((level) => {
                if (level.level === action.payload.level) {
                    const approverRolesWithRemovedRole = [...level.approverRoles]
                    approverRolesWithRemovedRole.splice(action.payload.index, 1)
                    return {
                        ...level,
                        approverRoles: approverRolesWithRemovedRole
                    }
                }
                return level
            })
            
            return [
                ...stateWithRemovedRole
            ]

        default:
            return state
    }
}