import PropTypes from 'prop-types';

const Spinner = ({ size }) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: "20rem", width: "100%" }}>
            <div className={`a-activity-indicator -${size}`} aria-live="off">
                <div className="a-activity-indicator__top-box"></div>
                <div className="a-activity-indicator__bottom-box"></div>
            </div>
        </div>
    )
}

Spinner.propTypes = {
    size: PropTypes.oneOf([ 'small', 'medium', 'large' ])
}

export default Spinner