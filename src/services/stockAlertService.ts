import apiClient from "../lib/apiClient";

export interface StockAlertSubscribeRequest {
  email: string;
  userId?: string | null;
}

export interface StockAlertResponse {
  message: string;
  alert?: {
    id: string;
    productId: string;
    email: string;
    userId: string | null;
    createdAt: string;
  };
  error?: string;
}

/**
 * Subscribe to stock alert for a product
 * @param productId - The product ID to subscribe to
 * @param email - Customer email address
 * @param userId - Optional user ID if authenticated
 * @returns Promise with subscription response
 */
export async function subscribeToStockAlert(
  productId: string,
  email: string,
  userId?: string | null
): Promise<StockAlertResponse> {
  try {
    const response = await apiClient.post<StockAlertResponse>(
      `/api/products/${productId}/stock-alert`,
      {
        email,
        userId: userId || null,
      }
    );
    return response;
  } catch (error: any) {
    // Extract error message from API response
    const errorMessage =
      error.response?.data?.error ||
      error.message ||
      "Failed to subscribe to stock alerts";
    throw new Error(errorMessage);
  }
}

/**
 * Unsubscribe from stock alert for a product
 * @param productId - The product ID to unsubscribe from
 * @param email - Customer email address
 * @returns Promise that resolves when unsubscribed
 */
export async function unsubscribeFromStockAlert(
  productId: string,
  email: string
): Promise<void> {
  try {
    await apiClient.delete(
      `/api/products/${productId}/stock-alert?email=${encodeURIComponent(email)}`
    );
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error ||
      error.message ||
      "Failed to unsubscribe from stock alerts";
    throw new Error(errorMessage);
  }
}

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns True if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
