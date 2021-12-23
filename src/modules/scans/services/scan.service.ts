import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scan } from '../entities/scan.entity';
import { Widget } from '../../widgets/entities/widget.entity';
import { User } from '../../users/entities/user.entity';
import { Channel } from '../../channels/entities/channel.entity';

@Injectable()
export class ScanService {
  constructor(
    @InjectRepository(Scan)
    private readonly scansRepository: Repository<Scan>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Widget)
    private readonly widgetsRepository: Repository<Widget>,

    @InjectRepository(Channel)
    private readonly channelsRepository: Repository<Channel>,
  ) {}

  public async increaseScanTimes(widgetIds: string[], userId: string, channelId: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId }, relations: ['scans', 'scans.channel'] });

    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    const widgets = await this.widgetsRepository.findByIds(widgetIds, { relations: ['scans', 'scans.channel'] });
    const channel = await this.channelsRepository.findOne({ where: { id: channelId } });

    if (!channel) {
      throw new BadRequestException('This channel does not exist');
    }

    const newScans: Scan[] = [];

    widgets.forEach(widget => {
      const existingWidgetScan = widget.scans?.find(scan => scan.channel.id === channel.id);

      newScans.push(
        existingWidgetScan
          ? { ...existingWidgetScan, number: existingWidgetScan.number + 1 }
          : this.scansRepository.create({ objectId: widget.id, number: 1, channel }),
      );
    });

    const existingUserScan = user.scans?.find(scan => scan.channel.id === channel.id);

    newScans.push(
      existingUserScan
        ? { ...existingUserScan, number: existingUserScan.number + 1 }
        : this.scansRepository.create({ objectId: user.id, number: 1, channel }),
    );

    await this.scansRepository.save(newScans);
  }

  public async getScansByObjectId(objectId: string) {
    const scan = await this.scansRepository.find({ where: { objectId: objectId } });

    if (!scan) {
      throw new NotFoundException();
    }

    return scan;
  }
}
