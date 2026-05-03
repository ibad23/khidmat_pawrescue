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
  readyToDischarge: number;
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

const STATUS_HEX: Record<StatusColor, string> = {
  success: "#22c55e",
  danger:  "#ef4444",
  info:    "#3b82f6",
  warning: "#f59e0b",
  purple:  "#a855f7",
};

export const getStatusStyle = (color: StatusColor): React.CSSProperties => ({
  backgroundColor: `${STATUS_HEX[color]}1a`, // 10% opacity
  color:           STATUS_HEX[color],
  borderColor:     `${STATUS_HEX[color]}33`, // 20% opacity
});

export const getStatusDotStyle = (color: StatusColor): React.CSSProperties => ({
  backgroundColor: STATUS_HEX[color],
});

export const getStatusRingStyle = (color: StatusColor): React.CSSProperties => ({
  outline: `2px solid ${STATUS_HEX[color]}80`, // 50% opacity
});

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
