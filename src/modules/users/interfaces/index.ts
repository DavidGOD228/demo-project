import { User } from '../entities/user.entity';

export interface UsersWithFiltersResponse {
  table: Record<string, any>;
  users: User[];
}
