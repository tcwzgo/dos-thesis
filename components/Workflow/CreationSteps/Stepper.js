import React from "react";

const Stepper = ({counter, stepData}) => {
    return ( 
        <div>
            <div className="m-step-indicator">
                <ul className="m-step-indicator__steps">
                    {stepData.map((step, index) => {
                        return ( 
                                <li key={index} className={`m-step-indicator__step ${counter === index + 1 ? '-active' : ''}`}>
                                    <div className="m-step-indicator__node">{index + 1}</div>
                                    <span className="m-step-indicator__label">{step.label}</span>
                                </li>
                        )
                    })}
                </ul>
            </div>
        </div>
     );
}
 
export default Stepper;