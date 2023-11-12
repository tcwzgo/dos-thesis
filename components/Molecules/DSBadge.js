const DSBadge = ({content, type}) => {
    return ( 
        <div className={`a-badge -${type}`} role="status" aria-live="off">
            {content}
        </div>
    );
}
 
export default DSBadge;