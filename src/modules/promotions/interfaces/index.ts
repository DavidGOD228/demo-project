export enum SubmissionsFilterTypeEnum {
  NAME = 'name',
  EMAIL = 'email',
  TITLE = 'title',
  TYPE = 'type',
  WINNER = 'winner',
}

export interface FeedSubmission {
  userId: string;
  name: string;
  email: string;
  widgetId: string;
  type: string;
  title: string;
  promotionId: string;
  winner: boolean;
}

export interface FeedSubmissionResponse {
  submissions: FeedSubmission[];
  length: number;
}

export interface PromotionMediaResponse {
  promotionMedia: string;
}

export enum GetSubmissionsWinnersEnum {
  WINNER = 'WINNER',
  ASSIGN = 'ASSIGN',
}
