import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ProjectController } from './project.controller';

@Module({
  providers: [ProjectService, PrismaService],
  controllers: [ProjectController],
})
export class ProjectModule {}
