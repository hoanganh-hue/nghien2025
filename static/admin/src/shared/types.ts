export interface User {
  id: number;
  username: string;
  email: string;
  is_superuser: boolean;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface PartnerRegistration {
  id: number;
  business_name: string;
  business_type: 'individual' | 'enterprise';
  industry: BusinessIndustry;
  tax_code?: string;
  business_license?: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  website?: string;
  representative_name: string;
  representative_phone: string;
  representative_email: string;
  representative_id_number: string;
  representative_position?: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  bank_branch?: string;
  status: RegistrationStatus;
  registered_at: string;
  reviewed_at?: string;
  reviewer?: string;
  notes?: string;
  uploaded_files?: UploadedFile[];
}

export interface AccountVerification {
  id: number;
  partner_id: number;
  partner_name: string;
  email_type: EmailType;
  verification_type: string;
  description?: string;
  status: RegistrationStatus;
  submitted_at: string;
  reviewed_at?: string;
  reviewer?: string;
  notes?: string;
  uploaded_files?: UploadedFile[];
}

export interface Transaction {
  id: number;
  transaction_id: string;
  partner_id: number;
  partner_name: string;
  amount: number;
  currency: string;
  transaction_type: TransactionType;
  status: TransactionStatus;
  description?: string;
  payment_method?: string;
  created_at: string;
  completed_at?: string;
}

export interface UploadedFile {
  id: number;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface AuditLog {
  id: number;
  action: string;
  resource_type: string;
  resource_id?: number;
  details?: string;
  user: string;
  created_at: string;
}

export interface DashboardStats {
  total_registrations: number;
  pending_registrations: number;
  approved_registrations: number;
  total_verifications: number;
  pending_verifications: number;
  total_transactions: number;
  completed_transactions: number;
  total_volume: number;
}

export type BusinessIndustry = 
  | 'restaurant'
  | 'retail'
  | 'services'
  | 'entertainment'
  | 'online'
  | 'canteen'
  | 'parking'
  | 'other';

export type RegistrationStatus = 
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected';

export type EmailType = 
  | 'business'
  | 'personal';

export type TransactionType = 
  | 'payment'
  | 'refund'
  | 'withdrawal';

export type TransactionStatus = 
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  pages: number;
  current_page: number;
}

export interface ApiError {
  error: string;
  details?: any;
}

export interface FilterOptions {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  industry?: string;
  start_date?: string;
  end_date?: string;
}

// Form types
export interface LoginForm {
  username: string;
  password: string;
}

export interface StatusUpdateForm {
  status: RegistrationStatus;
  notes?: string;
}

// Chart data types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface StatsCard {
  title: string;
  value: number | string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon: string;
  color: string;
}
