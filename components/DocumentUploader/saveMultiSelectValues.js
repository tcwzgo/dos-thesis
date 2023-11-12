export const saveValues = (arrayToBeFiltered, state) => {
    if (arrayToBeFiltered === null) {
        return null
    }
    let filtered = []
    for(const label of arrayToBeFiltered) {
        let value
        for(const st of state) {
            if (st.label === label) {
                value = st.value 
            }
        }
        //(label + ' - ' + value)
        filtered.push({
            value: value,
            label: label
        })
    }

    return filtered
} 