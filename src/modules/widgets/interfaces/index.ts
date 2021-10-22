import { Widget } from '../entities/widget.entity';

export interface FilteredWidgetsResponse {
  widgets: Partial<Widget>[];
  length: number;
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
