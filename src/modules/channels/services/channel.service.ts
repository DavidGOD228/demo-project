import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from '../entities/channel.entity';
import { Repository } from 'typeorm';
import { IGetChannel } from '../interfaces/interfaces';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
  ) {}

  public async getChannels(): Promise<IGetChannel[]> {
    return this.channelRepository
      .createQueryBuilder('channel')
      .select(['channel.league as league', 'channel.type as type', 'channel.inscription as inscription'])
      .addSelect('array_agg(channel.id)', 'channelIds')
      .groupBy('channel.league')
      .addGroupBy('channel.type')
      .addGroupBy('channel.inscription')
      .getRawMany();
  }
}
