import { Module } from '@nestjs/common';
import { TemplateService } from './template.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [TemplateService, PrismaService],
  exports: [TemplateService],
})
export class TemplateModule {}
