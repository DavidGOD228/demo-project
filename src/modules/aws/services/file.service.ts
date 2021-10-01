import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
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

  public async uploadRawMedia(dataBuffer: Buffer, filename: string, entityName: string): Promise<string> {
    const encryptedName = crypto.AES.encrypt(filename, constants.WILSON_NAME_SECRET);
    const uuid = uuidv4();
    const s3Bucket = new S3();
    const uploadResult = await s3Bucket
      .upload({
        Bucket: this.configService.get(constants.WILSON_AWS_S3_BUCKET),
        Body: dataBuffer,
        Key: `${entityName}/${uuid}-${encryptedName}`,
      })
      .promise();

    return uploadResult.Location;
  }

  public async uploadMedia(id: string, dataBuffer: Buffer, filename: string, entityName: string): Promise<string> {
    const s3Bucket = new S3();
    const uploadResult = await s3Bucket
      .upload({
        Bucket: this.configService.get(constants.WILSON_AWS_S3_BUCKET),
        Body: dataBuffer,
        Key: `${entityName}/${id}-${filename}`,
      })
      .promise();

    return uploadResult.Location;
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
}
