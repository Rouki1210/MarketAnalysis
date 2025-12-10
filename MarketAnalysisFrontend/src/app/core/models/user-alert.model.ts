/**
 * User Alert Models
 *
 * Defines DTOs for user-created price alert functionality
 */

// ==================== Request DTOs ====================

/**
 * Data Transfer Object for creating a new price alert
 *
 * Users can create alerts that trigger when price crosses a threshold
 */
export interface CreateUserAlertDto {
  /** ID of the asset to monitor */
  assetId: number;
  /** Alert trigger condition */
  alertType: 'ABOVE' | 'BELOW' | 'REACHES';
  /** Target price that triggers the alert */
  targetPrice: number;
  /** If true, alert can trigger multiple times */
  isRepeating: boolean;
  /** Optional user note about this alert */
  note?: string;
}

/**
 * Data Transfer Object for updating an existing alert
 * All fields are optional - only provided fields will be updated
 */
export interface UpdateUserAlertDto {
  /** New target price */
  targetPrice?: number;
  /** Change repeating behavior */
  isRepeating?: boolean;
  /** Enable or disable the alert */
  isActive?: boolean;
  /** Update the note */
  note?: string;
}

// ==================== Response DTOs ====================

/**
 * Full alert information returned from API
 * Includes creation metadata and trigger history
 */
export interface UserAlertResponseDto {
  /** Unique alert identifier */
  id: number;
  /** Owner user ID */
  userId: number;
  /** Asset being monitored */
  assetId: number;
  /** Asset symbol (e.g., 'BTC') */
  assetSymbol: string;
  /** Asset full name */
  assetName: string;
  /** Alert trigger condition */
  alertType: string;
  /** Target price threshold */
  targetPrice: number;
  /** Whether alert can trigger multiple times */
  isRepeating: boolean;
  /** Whether alert is currently active */
  isActive: boolean;
  /** User's note about this alert */
  note: string;
  /** Alert creation timestamp */
  createdAt: Date;
  /** Last time this alert triggered */
  lastTriggeredAt?: Date;
  /** Total number of times alert has triggered */
  triggerCount: number;
}
