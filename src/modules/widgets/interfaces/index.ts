export interface FilteredWidgetsResponse {
  id: string;
  title: string;
  type: string;
  startdate: string;
  expirationdate: string;
  exclusive: boolean;
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
