import NoRoleMessage from "./components/NoRoleMessage";

const ProtectedRoute = ({ isAllowed, children }) => {

    if (!isAllowed) {
      return <NoRoleMessage />;
    }
  
    return children ? children : <NoRoleMessage />;
  }

export default ProtectedRoute;
