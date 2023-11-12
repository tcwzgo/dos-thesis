const Toggle = ({label, onChange, id, name, checked}) => {
    return ( 
        <div className="a-toggle">
            <label className="a-toggle__label -left" htmlFor={id}>{label}</label>
                <input
                    type="checkbox"
                    id={id}
                    name={name}
                    checked={checked}
                    aria-describedby={id}
                    onChange={onChange}
                />
            <label className="a-toggle__box" htmlFor={id}></label>
        </div>
     );
}
 
export default Toggle;