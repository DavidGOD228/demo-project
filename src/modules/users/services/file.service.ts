import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { S3 } from 'aws-sdk';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as constants from '../../../common/constants/constants';

@Injectable()
export class FileService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  public async uploadFile(userId: string, dataBuffer: Buffer, filename: string): Promise<string> {
    const s3Bucket = new S3();
    const uploadResult = await s3Bucket
      .upload({
        Bucket: this.configService.get(constants.WILSON_AWS_S3_BUCKET_USERS),
        Body: dataBuffer,
        Key: `${userId}-${filename}`,
      })
      .promise();

    await this.usersRepository.update(userId, { imageUrl: uploadResult.Location });

    const user = await this.usersRepository.findOne(userId);

    return user.imageUrl;
  }
}
