import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Widget } from '../entities/widget.entity';
import { User } from '../../users/entities/user.entity';
import { UserRoleEnum } from '../../users/interfaces/user.enum';
import { GetWidgetFeedDto } from '../interfaces/getWidgetFeed.dto';

@Injectable()
export class WidgetService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Widget)
    private readonly widgetsRepository: Repository<Widget>,
  ) {}

  public async getWidgetById(id: string): Promise<Widget> {
    const widget = await this.widgetsRepository.findOne({ where: { id }, relations: ['scans'] });
    if (!widget) {
      throw new NotFoundException();
    }
    return widget;
  }

  public async generateWidgetFeed(userId: string, { tags, pageNumber, perPage }: GetWidgetFeedDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    const widgetList = this.widgetsRepository
      .createQueryBuilder('widget')
      .where('widget.parent_id IS NULL')
      .andWhere('(widget.expire_at IS NULL OR widget.expire_at > :startDate)', { startDate: new Date() });

    if (!user.exclusiveSubscription && user.role === UserRoleEnum.USER) {
      widgetList.andWhere('widget.exclusive = FALSE');
    }

    if (tags?.length) {
      widgetList.innerJoin('widget.tags', 'tag', 'tag.id IN (:...tagIds)', { tagIds: tags });
    }

    if (perPage && pageNumber) {
      widgetList.skip((pageNumber - 1) * perPage).take(perPage);
    }

    return widgetList
      .orderBy('widget.expireAt')
      .addOrderBy('widget.updatedAt', 'DESC')
      .leftJoinAndSelect('widget.storyBlocks', 'stories')
      .leftJoinAndSelect('widget.childWidgets', 'children')
      .leftJoinAndSelect('children.storyBlocks', 'childStoryBlocks')
      .getMany();
  }
}
