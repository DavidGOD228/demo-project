export interface FilteredWidgetsResponse {
  id: string;
  title: string;
  type: string;
  startDate: string;
  expirationDate: string;
  isExclusive: boolean;
  channels: string;
}

export interface AddThumbnailResponse {
  thumbnail: string;
}

export interface AddDetailsMediaResponse {
  detailsMedia: string;
}

export interface AddFeedMediaResponse {
  feedMedia: string;
}

export interface AddStoryMedia {
  storyAssetUrl: string;
}

export interface DeleteWidgetResponse {
  message: string;
}

export interface AddAuthorAvatarResponse {
  authorAvatarUrl: string;
}
