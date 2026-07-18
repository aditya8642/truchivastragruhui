// Mirrors ApiResponse<T> used by AuthController on the backend.
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// Mirrors Spring Data's Page<T> JSON shape, used by product list/search endpoints.
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;   // current page index (0-based)
  size: number;
  first: boolean;
  last: boolean;
}
