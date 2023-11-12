const TextArea = ({handleChange, label, name, value, styles, isDisabled}) => {
    return ( 
        <div className="a-text-area" style={styles}>
            <label>{label}</label>
            <textarea disabled={isDisabled} onChange={handleChange} name={name} value={value}></textarea>
        </div>
     );
}
 
export default TextArea;