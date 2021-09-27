import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Widget } from '../entities/widget.entity';

@Injectable()
export class WidgetService {
  constructor(@InjectRepository(Widget) private readonly widgetsRepository: Repository<Widget>) {}

  public async getWidgetById(id: string): Promise<Widget> {
    const widget = await this.widgetsRepository.findOne({ where: { id } });
    if (!widget) {
      throw new NotFoundException();
    }
    return widget;
  }
}
