import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as sdk from 'aws-sdk';
import { S3 } from 'aws-sdk';
import * as crypto from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import * as constants from '../../../common/constants/constants';

@Injectable()
export class FileService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  public SIGNED_URL_EXPIRATION_TIME = 604800; //7 days

  public async uploadRawMedia(dataBuffer: Buffer, filename: string, entityName: string): Promise<string> {
    const encryptedName = crypto.AES.encrypt(filename, constants.WILSON_NAME_SECRET);
    const uuid = uuidv4();
    const s3Bucket = new S3();
    const uploadResult = await s3Bucket
      .upload({
        Bucket: this.configService.get(constants.WILSON_AWS_S3_BUCKET),
        Body: dataBuffer,
        Key: `/${entityName}/${uuid}-${encryptedName}`,
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

  public getImageUrl(fileKey: string) {
    if (!fileKey) {
      return undefined;
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
