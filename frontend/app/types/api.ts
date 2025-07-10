// API Response Types based on Visa Dossier API

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  device_name?: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Token {
  id: number;
  name: string;
  abilities: string[];
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  token: string;
  name: string;
  abilities: string[];
}

// Visa Types
export type VisaType = "tourist" | "student" | "work" | "business" | "transit";

export interface VisaTypeOption {
  value: VisaType;
  label: string;
}

// Application Status
export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "processing"
  | "approved"
  | "rejected";

export interface ApplicationStatusOption {
  value: ApplicationStatus;
  label: string;
  color: string;
}

// Document Types
export type DocumentType =
  | "passport"
  | "birth_certificate"
  | "marriage_certificate"
  | "proof_of_income"
  | "bank_statement"
  | "accommodation_proof"
  | "health_insurance"
  | "criminal_record"
  | "educational_certificate"
  | "employment_contract"
  | "visa_application_form"
  | "passport_photo"
  | "other";

export interface DocumentTypeOption {
  value: DocumentType;
  label: string;
}

// Document Categories for UI grouping
export interface DocumentCategory {
  key: string;
  title: string;
  description: string;
  types: DocumentType[];
}

export interface Document {
  id: number;
  dossier_id: number;
  document_type: DocumentType;
  document_type_label: string;
  name: string;
  description: string | null;
  file_size: number;
  file_size_formatted: string;
  mime_type: string;
  original_filename: string;
  files: DocumentFile[]; // Array of files within this document
  uploaded_at: string;
  updated_at: string;
}

export interface DocumentFile {
  id: number;
  name: string;
  url: string;
  thumbnail_url: string | null;
  size: string;
  mime_type: string;
}

export interface Dossier {
  id: number;
  user_id: number;
  passport_number: string;
  nationality: string;
  date_of_birth: string;
  visa_type: VisaType;
  visa_type_label: string;
  application_status: ApplicationStatus;
  application_status_label: string;
  application_status_color: string;
  assigned_officer: string | null;
  notes: string | null;
  additional_data: Record<string, any> | null;
  documents?: Document[];
  created_at: string;
  updated_at: string;
  has_required_documents: boolean;
  can_submit: boolean;
}

export interface CreateDossierData {
  passport_number: string;
  nationality: string;
  date_of_birth: string;
  visa_type: VisaType;
  additional_data?: Record<string, any>;
}

export interface UpdateDossierData {
  passport_number?: string;
  nationality?: string;
  date_of_birth?: string;
  visa_type?: VisaType;
  application_status?: ApplicationStatus;
  notes?: string;
  additional_data?: Record<string, any>;
}

export interface UploadDocumentData {
  files: File[];
  document_type: DocumentType;
  name: string;
  description?: string;
}

// API Response Wrappers
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiListResponse<T> {
  data: T[];
  meta: {
    total_count: number;
    total_size: number;
    total_size_formatted: string | null;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// UI State Types
export interface LoadingState {
  [key: string]: boolean;
}

export interface UploadProgress {
  [fileId: string]: {
    percent: number;
    status: "uploading" | "done" | "error";
  };
}
