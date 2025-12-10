/**
 * User Profile Models
 *
 * Defines interfaces for user account and profile information
 */

/**
 * User profile information
 * Contains account details and metadata for authenticated users
 */
export interface UserInfo {
  /** Unique user identifier */
  id: number;
  /** Username for login */
  username: string;
  /** Display name shown in UI */
  displayName: string;
  /** User's email address */
  email: string;
  /** Crypto wallet address (if wallet-based auth used) */
  walletAddress?: string;
  /** Authentication method used ('email', 'google', 'wallet') */
  authType: string;
  /** User biography/description */
  bio?: string;
  /** Personal website URL */
  website?: string;
  /** User's birthday */
  birthday?: string;
  /** Account creation timestamp */
  createdAt: string;
}

/**
 * Response from profile update API
 * Indicates success and returns updated user information
 */
export interface UpdateProfileResponse {
  /** True if update was successful */
  success: boolean;
  /** Updated user information */
  data?: UserInfo;
  /** Error or success message */
  message?: string;
}
