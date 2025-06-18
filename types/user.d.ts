export interface User {
  id?: number;
  uuid?: string;
  email: string;
  createdAt?: string;
  nickname: string;
  avatarUrl: string;
  locale?: string;
  signinType?: string;
  signinIp?: string;
  signinProvider?: string;
  signinOpenid?: string;
  credits?: UserCredits;
  inviteCode?: string;
  invitedBy?: string;
  isAffiliate?: boolean;
}

export interface UserCredits {
  oneTimeCredits?: number;
  monthlyCredits?: number;
  totalCredits?: number;
  usedCredits?: number;
  leftCredits: number;
  freeCredits?: number;
  isRecharged?: boolean;
  isPro?: boolean;
}
