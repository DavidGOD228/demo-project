import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export interface IDbProps {
  type: string;
  host: any;
  port: number;
  username: string;
  password: string;
  database: string;
  entities: string[];
  synchronize: boolean;
  namingStrategy: SnakeNamingStrategy;
  logging?: boolean;
}
