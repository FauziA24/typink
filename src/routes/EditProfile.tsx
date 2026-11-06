
import { Navigate } from "react-router-dom";

export default function EditProfile() {
  const userId = sessionStorage.getItem("typink_user_id");
  return <Navigate to={userId ? `/profile/${userId}` : "/auth"} replace />;
}
