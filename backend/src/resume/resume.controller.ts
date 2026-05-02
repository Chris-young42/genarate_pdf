import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { Resume } from '@prisma/client';
import { ResumeService } from './resume.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';

@Controller('api/resumes')
export class ResumeController {
  public constructor(private readonly resumeService: ResumeService) {}

  @Get()
  public async findAll(): Promise<Resume[]> {
    return this.resumeService.findAll();
  }

  @Get(':id')
  public async findOne(@Param('id', ParseIntPipe) id: number): Promise<Resume> {
    return this.resumeService.findOne(id);
  }

  @Post()
  public async create(@Body() dto: CreateResumeDto): Promise<Resume> {
    return this.resumeService.create(dto);
  }

  @Put(':id')
  public async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateResumeDto,
  ): Promise<Resume> {
    return this.resumeService.update(id, dto);
  }

  @Delete(':id')
  public async remove(@Param('id', ParseIntPipe) id: number): Promise<Resume> {
    return this.resumeService.remove(id);
  }
}
