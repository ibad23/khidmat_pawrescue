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

export interface CageDetail {
  cage_id: number;
  cage_no: number;
  ward_id: number;
  cage_status: string;
  date: string | null;
  cat_id: number | null;
  cat_name: string | null;
}

export interface Ward {
  ward_id: number;
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
  success: "bg-status-success text-white",
  danger: "bg-status-danger text-white",
  info: "bg-status-info text-white",
  warning: "bg-status-warning text-white",
  purple: "bg-status-purple text-white",
};

export const STATUS_DOT_COLORS: Record<StatusColor, string> = {
  success: "bg-status-success",
  danger: "bg-status-danger",
  info: "bg-status-info",
  warning: "bg-status-warning",
  purple: "bg-status-purple",
};

export const STATUS_RING_COLORS: Record<StatusColor, string> = {
  success: "ring-status-success ring-opacity-50",
  danger: "ring-status-danger ring-opacity-50",
  info: "ring-status-info ring-opacity-50",
  warning: "ring-status-warning ring-opacity-50",
  purple: "ring-status-purple ring-opacity-50",
};



// ============================================
// Finance Types
// ============================================

export interface Donation {
  donation_id: number;
  donor_id: number;
  mode: string;
  amount: number;
  date: string;
  donor_name: string;
  contact_num: string;
}

export interface Revenue {
  revenue_id: number;
  buyer_id: number;
  mode: string;
  amount: number;
  date: string;
  remarks: string;
  buyer_name: string;
  contact_num: string;
}

export interface Transaction {
  transaction_id: number;
  mode: string;
  amount: number;
  bill_for: string;
  date: string;
  remarks: string;
}

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
// External (Donor/Reporter/Buyer) Types
// ============================================

export interface External {
  external_id: number;
  name: string;
  contact_num: string;
  address: string | null;
}

// ============================================
// Profile Types
// ============================================

export interface UserProfile {
  name: string | null;
  role: string | null;
}
