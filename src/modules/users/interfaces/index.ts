import { User } from '../entities/user.entity';

export interface UserAvatarUploadResponse {
  imageUrl: string;
}

export interface UsersWithFiltersResponse {
  table: Record<string, any>;
  users: User[];
}
