export * from './orm.interfaces';
import { Request } from 'express';

export interface RequestWithUserParams extends Request {
  user?: {
    id: number;
  };
}
