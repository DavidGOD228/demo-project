export enum SubmissionsFilterTypeEnum {
  NAME = 'name',
  EMAIL = 'email',
  TITLE = 'title',
  TYPE = 'type',
}

export interface FeedSubmission {
  userId: string;
  name: string;
  email: string;
  widgetId: string;
  type: string;
  title: string;
}

export interface PromotionMediaResponse {
  promotionMedia: string;
}
