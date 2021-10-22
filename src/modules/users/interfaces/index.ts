import { User } from '../entities/user.entity';

export interface UserAvatarUploadResponse {
  imageUrl: string;
}

export interface UserAvatarResponse {
  userAvatar: string;
}

export interface UsersWithFiltersResponse {
  users: User[];
  length: number;
}
