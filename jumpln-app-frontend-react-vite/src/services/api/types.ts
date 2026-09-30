/**
 * Standard API error structure normalized across backend variations
 */
export interface ApiError {
  status: number;
  message: string;
  errorKey?: string;
  detail?: string;
  violations?: Array<{ field: string; message: string }>;
  raw?: unknown;
}

/**
 * Standard backend wrapper from ResFormatResponse
 */
export interface RestResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  error?: string | null;
}
