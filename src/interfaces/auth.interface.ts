export enum AdminRole {
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export interface IAuth {
  uid: string;
  role: AdminRole;
  // Add other auth related fields if necessary
}
