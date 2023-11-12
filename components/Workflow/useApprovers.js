import { useState, useEffect } from "react"
import api from "../../axios_conf"
import axios from "axios";
import { ROLES, readDisplayNamesOfGivenIdmRole, roles } from "../utils"
import { v4 as uuidv4 } from 'uuid';

const useApprovers = (documentType, publisher_department, related_departments, isArchival) => {
    const [approverRoles, setApproverRoles] = useState(null)
    const [allDepartments, setAllDepartments] = useState([])

    useEffect(() => {
        const fetchDepartments = async () => {
            await axios
                .get(process.env.REACT_APP_LOS_API_ENDPOINT + `/api/departments`)
                .then((res) => {
                    setAllDepartments([...res.data]);
                })
                .catch((error) => {
                    console.error(error);
                });
        }

        fetchDepartments();
    }, [documentType])

    useEffect(() => {
        if (allDepartments.length === 0) return
        api().get("/api/admin/config")
            .then((res) => {
                const relevantDocumentType = res.data?.document_types?.find((dt) => dt.name === documentType && dt.active)
                const relevantApprovers = relevantDocumentType?.approver_roles
                const mandatoryApprovers = relevantApprovers?.map((level) => {

                    const approverRoles = level?.roles?.map((approverRole) => {
                        let departmentId = publisher_department
                        if (approverRole === roles[ROLES.TEF6].idmDisplayName) {
                            departmentId = 65
                        }
                        if (approverRole === roles[ROLES.HSE].idmDisplayName) {
                            departmentId = 53
                        }
                        if (isArchival) {
                            return {
                                role: {
                                    name: readDisplayNamesOfGivenIdmRole(approverRole),
                                    id: approverRole,
                                },
                                user: null,
                                department: departmentId,
                                departmentName: allDepartments.find((departmentName) => departmentName.value === departmentId)?.label,
                                isMandatory: true,
                                uuid: uuidv4(),
                            }
                        }
                        return {
                            role: {
                                name: readDisplayNamesOfGivenIdmRole(approverRole),
                                id: approverRole,
                            },
                            user: null,
                            department: departmentId,
                            departmentName: allDepartments.find((departmentName) => departmentName.value === departmentId)?.label,
                            isMandatory: true,
                            uuid: uuidv4(),
                        };
                    })
                    return {
                        level: level.level,
                        isMandatory: true,
                        approverRoles: approverRoles.flat()
                    }
                })
                const departmentLeaders = related_departments.map((department) => {
                    return {
                        role: {
                            name: readDisplayNamesOfGivenIdmRole(roles[ROLES.DEPARTMENT_LEADER].idmDisplayName),
                            id: roles[ROLES.DEPARTMENT_LEADER].idmDisplayName,
                        },
                        user: null,
                        department: department,
                        departmentName: allDepartments.find((departmentName) => departmentName.value === department)?.label,
                        isMandatory: true,
                        uuid: uuidv4()
                    };
                })
                mandatoryApprovers[mandatoryApprovers.length - 1].approverRoles.push(...departmentLeaders)
                setApproverRoles(mandatoryApprovers)
            })
    }, [documentType, allDepartments])

    return approverRoles
}

export default useApprovers