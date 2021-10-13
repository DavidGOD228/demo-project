import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MIN_TAG_NAME_LENGTH } from 'src/common/constants/constants';
import { Widget } from 'src/modules/widgets/entities/widget.entity';
import { Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { DeleteTagResponse } from '../interfaces';
import { CreateTagDto, DeleteTagFromWidget, TagNameFilterDto } from '../interfaces/tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,

    @InjectRepository(Widget)
    private readonly widgetsRepository: Repository<Widget>,
  ) {}

  public async addTag({ name }: CreateTagDto): Promise<Tag> {
    const tag = await this.tagsRepository
      .createQueryBuilder('tag')
      .where('LOWER(tag.name) = LOWER(:name)', { name: name })
      .getOne();

    if (!tag) {
      const newTag = this.tagsRepository.create({ name: name });

      await this.tagsRepository.save(newTag);

      return newTag;
    }

    return tag;
  }

  public async getFilteredTags({ filterValue }: TagNameFilterDto): Promise<Tag[]> {
    if (filterValue.trim().length >= MIN_TAG_NAME_LENGTH) {
      return await this.tagsRepository
        .createQueryBuilder('tags')
        .where('LOWER(tags.name) LIKE :name', { name: `${filterValue.toLowerCase()}%` })
        .getMany();
    }

    return [];
  }

  public async deleteTagFromWidget(tagId: string, { widgetId }: DeleteTagFromWidget): Promise<DeleteTagResponse> {
    const tagToDelete = await this.tagsRepository.findOne(tagId);

    if (!tagToDelete) {
      throw new NotFoundException('There is no tag with such id!');
    }

    const widget = await this.widgetsRepository
      .createQueryBuilder('widget')
      .select(['widget.id', 'widget.title'])
      .where('widget.id = :widgetId', { widgetId: widgetId })
      .leftJoinAndSelect('widget.tags', 'tags')
      .getOne();

    if (!widget) {
      throw new NotFoundException('There is no widget with such id!');
    }

    if (!widget.tags.length) {
      console.log(widget.tags);

      throw new BadRequestException('This widget does not have a tag with such id!');
    }

    widget.tags = widget.tags.filter(tag => tag.id !== tagToDelete.id);

    await this.widgetsRepository.save(widget);

    const widgets = await this.widgetsRepository
      .createQueryBuilder('widgets')
      .leftJoin('widgets.tags', 'tags')
      .where('tags.id = :tagId', { tagId: tagToDelete.id })
      .getMany();

    if (!widgets.length) {
      await this.tagsRepository.remove(tagToDelete);
    }

    return { message: 'Tag was successfully deleted from a widget!' };
  }
}
