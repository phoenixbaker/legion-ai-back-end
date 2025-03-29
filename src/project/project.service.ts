import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';
import { FullProject } from './types/full-project.type';
import { Project } from '@prisma/client';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  public async createProject(
    createProjectDto: CreateProjectDto,
  ): Promise<Project> {
    return await this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        containerId: createProjectDto.containerId,
      },
    });
  }

  public async getProject(id: string): Promise<FullProject | null> {
    return await this.prisma.project.findUnique({
      where: { id },
      include: {
        agents: true,
      },
    });
  }

  public async deleteProject(id: string): Promise<Project> {
    return await this.prisma.project.delete({
      where: { id },
    });
  }

  public async updateProject(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<FullProject> {
    return await this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: {
        agents: true,
      },
    });
  }
}
