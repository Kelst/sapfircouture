import type {
  User,
  Session,
  Collection,
  Style,
  Dress,
  Page,
  Setting,
  ContactRequest,
} from "@/lib/db/schema";

// Re-export database types
export type { User, Session, Collection, Style, Dress, Page, Setting, ContactRequest };

// Locale type
export type Locale = "en" | "uk";

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter types
export interface DressFilters {
  collectionId?: string;
  styleId?: string;
  isPublished?: boolean;
}

// Form state types
export interface FormState {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
}

// Navigation types
export interface NavItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}
