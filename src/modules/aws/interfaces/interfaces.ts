import * as sdk from 'aws-sdk';
import { Channel } from '../../channels/entities/channel.entity';

export interface GetChannelByImage {
  labelsInfo: Record<string, sdk.Rekognition.CustomLabel>;
  channel: Channel;
}
