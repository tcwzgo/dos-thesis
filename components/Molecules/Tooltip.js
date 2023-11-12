const Tooltip = ({message, type}) => {

    return ( 
        <span
            className="a-tooltip a-tooltip--error -dynamic-width -floating-shadow-s"
            role="tooltip"
            >
            <i className={`a-icon ui-ic-${type}`}></i>
            {message}
        </span>
     );
}
 
export default Tooltip;