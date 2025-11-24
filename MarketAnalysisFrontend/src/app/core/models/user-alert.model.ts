export interface CreateUserAlertDto {
  assetId: number;
  alertType: 'ABOVE' | 'BELOW' | 'REACHES';
  targetPrice: number;
  isRepeating: boolean;
  note?: string;
}

export interface UpdateUserAlertDto {
  targetPrice?: number;
  isRepeating?: boolean;
  isActive?: boolean;
  note?: string;
}

export interface UserAlertResponseDto {
  id: number;
  userId: number;
  assetId: number;
  assetSymbol: string;
  assetName: string;
  alertType: string;
  targetPrice: number;
  isRepeating: boolean;
  isActive: boolean;
  note: string;
  createdAt: Date;
  lastTriggeredAt?: Date;
  triggerCount: number;
}
