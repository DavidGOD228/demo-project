import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TermsOfUseController } from './controllers/terms.controller';
import { TermsOfUse } from './entities/terms.entity';
import { TermsOfUseService } from './services/terms.service';

@Module({
  controllers: [TermsOfUseController],
  providers: [TermsOfUseService],
  imports: [TypeOrmModule.forFeature([TermsOfUse])],
})
export class TermsOfUseModule {}
