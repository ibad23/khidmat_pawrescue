import useAuth from "./useAuth";
import { UserRole } from "@/components/context/AuthProvider";

export interface Permissions {
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canChangePassword: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isSurgeon: boolean;
  role: UserRole;
}

const usePermissions = (): Permissions => {
  const { userRole } = useAuth();

  const isAdmin = userRole === "Administrator";
  const isModerator = userRole === "Moderator";
  const isSurgeon = userRole === "Surgeon";

  return {
    // All roles can add
    canAdd: isAdmin || isModerator || isSurgeon,
    // Only admin can edit
    canEdit: isAdmin,
    // Only admin can delete
    canDelete: isAdmin,
    // Only admin can change passwords
    canChangePassword: isAdmin,
    isAdmin,
    isModerator,
    isSurgeon,
    role: userRole,
  };
};

export default usePermissions;
