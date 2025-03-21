import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as sdk from 'aws-sdk';
import { S3 } from 'aws-sdk';
import * as crypto from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import { Repository } from 'typeorm';
import * as sharp from 'sharp';
import { User } from '../../users/entities/user.entity';
import * as constants from '../../../common/constants/constants';
import { StoryBlockTypeEnum } from '../../widgets/interfaces/widget.enum';

@Injectable()
export class FileService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  public SIGNED_URL_EXPIRATION_TIME = 604800; //7 days

  public checkFileType(mimetype: string): StoryBlockTypeEnum {
    const videoType = 'video';
    const imageType = 'image';

    if (mimetype.includes(videoType)) return StoryBlockTypeEnum.VIDEO;

    if (mimetype.includes(imageType)) return StoryBlockTypeEnum.IMAGE;
  }

  public async uploadRawMedia(
    dataBuffer: Buffer,
    filename: string,
    entityName: string,
    type?: StoryBlockTypeEnum,
  ): Promise<string> {
    const encryptedName = crypto.AES.encrypt(filename, constants.WILSON_NAME_SECRET);
    const uuid = uuidv4();
    const s3Bucket = new S3();
    const uploadResult = await s3Bucket
      .upload({
        Bucket: this.configService.get(constants.WILSON_AWS_S3_BUCKET),
        Body: dataBuffer,
        Key: `/${entityName}/${uuid}-${encryptedName}`,
        ContentType: type === StoryBlockTypeEnum.VIDEO ? 'video/mp4' : 'application/octet-stream',
      })
      .promise();

    return uploadResult.Key;
  }

  public async uploadMedia(id: string, dataBuffer: Buffer, filename: string, entityName: string): Promise<string> {
    const s3Bucket = new S3();
    const uploadResult = await s3Bucket
      .upload({
        Bucket: this.configService.get(constants.WILSON_AWS_S3_BUCKET),
        Body: dataBuffer,
        Key: `/${entityName}/${id}-${filename}`,
      })
      .promise();

    return uploadResult.Key;
  }

  public async uploadUserAvatar(
    userId: string,
    dataBuffer: Buffer,
    filename: string,
    entityName: string,
  ): Promise<string> {
    const imageUrl = await this.uploadMedia(userId, dataBuffer, filename, entityName);

    await this.usersRepository.update(userId, { imageUrl: imageUrl });

    const user = await this.usersRepository.findOne(userId);

    return user.imageUrl;
  }

  public resizeImage(dataBuffer: Buffer): Promise<Buffer> {
    return sharp(dataBuffer)
      .resize({
        width: 50,
        withoutEnlargement: true,
      })
      .sharpen()
      .toBuffer();
  }

  public getFile(fileKey: string) {
    const s3Bucket = new S3();
    const file = s3Bucket
      .getObject({
        Bucket: this.configService.get(constants.WILSON_AWS_S3_BUCKET),
        Key: fileKey,
      })
      .promise();

    return file;
  }

  public getImageUrl(fileKey: string) {
    if (!fileKey) {
      return undefined;
    } else if (fileKey.startsWith('http')) {
      return fileKey;
    }

    const s3Bucket = new sdk.S3();

    const requestObject: Record<string, any> = {
      Expires: this.SIGNED_URL_EXPIRATION_TIME,
      Bucket: this.configService.get(constants.WILSON_AWS_S3_BUCKET),
      Key: fileKey,
    };

    return s3Bucket.getSignedUrl('getObject', requestObject);
  }

  public getPublicImageUrl(fileKey: string) {
    return `https://${this.configService.get(constants.WILSON_AWS_S3_BUCKET)}.s3.amazonaws.com${fileKey}`;
  }
}
