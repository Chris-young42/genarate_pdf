import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Resume } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';

@Injectable()
export class ResumeService {
  public constructor(private readonly prisma: PrismaService) {}

  public async findAll(): Promise<Resume[]> {
    try {
      return await this.prisma.resume.findMany({
        orderBy: { updatedAt: 'desc' },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Failed to fetch resumes: ${message}`);
    }
  }

  public async findOne(id: number): Promise<Resume> {
    try {
      const resume = await this.prisma.resume.findUnique({ where: { id } });
      if (!resume) {
        throw new NotFoundException(`Resume #${id} not found`);
      }
      return resume;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Failed to fetch resume #${id}: ${message}`);
    }
  }

  public async create(dto: CreateResumeDto): Promise<Resume> {
    try {
      return await this.prisma.resume.create({ data: dto });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Failed to create resume: ${message}`);
    }
  }

  public async update(id: number, dto: UpdateResumeDto): Promise<Resume> {
    try {
      await this.findOne(id);
      return await this.prisma.resume.update({ where: { id }, data: dto });
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Failed to update resume #${id}: ${message}`);
    }
  }

  public async remove(id: number): Promise<Resume> {
    try {
      await this.findOne(id);
      return await this.prisma.resume.delete({ where: { id } });
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Failed to delete resume #${id}: ${message}`);
    }
  }
}
