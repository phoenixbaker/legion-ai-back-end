import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectController } from './project.controller';

@Module({
  providers: [ProjectService, PrismaService],
  controllers: [ProjectController],
})
export class ProjectModule {}
