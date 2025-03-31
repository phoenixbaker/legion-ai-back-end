import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  public async createProject(@Body() createProjectDto: CreateProjectDto) {
    return await this.projectService.createProject(createProjectDto);
  }

  @Get(':id')
  public async getProject(@Param('id') id: string) {
    return await this.projectService.getProject(id);
  }

  @Delete(':id')
  public async deleteProject(@Param('id') id: string) {
    return await this.projectService.deleteProject(id);
  }

  @Put(':id')
  public async updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return await this.projectService.updateProject(id, updateProjectDto);
  }
}
