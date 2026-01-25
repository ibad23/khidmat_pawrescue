// ============================================
// Core Entity Types
// ============================================

export interface User {
  id: string;
  email: string;
  user_name?: string;
  role?: string;
}

export interface Cat {
  id: string; // Formatted ID like "PA-0001"
  cat_id: number; // Raw database ID
  name: string;
  owner: string;
  contact: string;
  date: string;
  admitted_on_raw: string | null;
  type: string;
  cage: string;
  status: string;
  color: StatusColor;
}

export interface Treatment {
  id: number;
  catId: string; // Formatted like "PA-0001"
  catIdNum: number;
  catName: string;
  cageNo: string;
  temp: string;
  treatment: string;
  time: string;
  givenBy: string;
}

export interface CatTreatment {
  id: number;
  date: string;
  temp: string;
  treatment: string;
  givenBy: string;
}

export interface Cage {
  cage_id: number;
  cage_no: number;
  ward_id: number;
  status: string;
}

export interface Ward {
  name: string;
  code: string;
  totalCages: number;
  freeCages: number;
}

export interface InternalRole {
  internal_role_id: number;
  role_desc: string;
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  roleId: number;
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardStats {
  totalCats: number;
  recovered: number;
  expired: number;
  discharged: number;
}

export interface MonthlyDataPoint {
  month: string;
  value: number;
}

export interface CatStatusDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface TopReporter {
  name: string;
  count: number;
  contact?: string | null;
}

export interface DashboardData {
  stats: DashboardStats;
  monthlyData: MonthlyDataPoint[];
  catStatusData: CatStatusDataPoint[];
  topReporters: TopReporter[];
}

// ============================================
// Status & Color Types
// ============================================

export type StatusColor = "success" | "danger" | "info" | "warning" | "purple";

export const STATUS_COLORS: Record<StatusColor, string> = {
  success: "bg-status-success/20 text-status-success",
  danger: "bg-status-danger/20 text-status-danger",
  info: "bg-status-info/20 text-status-info",
  warning: "bg-status-warning/20 text-status-warning",
  purple: "bg-status-purple/20 text-status-purple",
};

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// ============================================
// Form/Dialog Props Types
// ============================================

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ============================================
// Profile Types
// ============================================

export interface UserProfile {
  name: string | null;
  role: string | null;
}
