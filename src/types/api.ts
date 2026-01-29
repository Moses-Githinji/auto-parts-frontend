export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ListResponse<T> {
  data: T[];
}

export interface MessageResponse {
  message: string;
}

export interface HealthCheckResponse {
  status: "OK";
  timestamp: string;
  env: string;
}

export interface UploadResponse {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

export type AuthProfileResponse =
  | import("./user").UserProfile
  | import("./vendor").VendorProfile;
