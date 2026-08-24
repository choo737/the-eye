export type UserRole = 'owner' | 'editor' | 'viewer';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: UserRole;
  hd?: string; // Hosted Domain (e.g. google.com, corp.com)
  lastLogin: string;
}

export interface SsoConfig {
  provider: 'google' | 'azure_ad' | 'saml';
  clientId: string;
  clientSecret?: string;
  allowedDomains: string[];
  enforceHostedDomain: boolean;
  defaultRole: UserRole;
  enabled: boolean;
}

export interface UserManagementEntry {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'active' | 'suspended';
  lastActive: string;
}
