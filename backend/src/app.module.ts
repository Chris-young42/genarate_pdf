import { Module } from '@nestjs/common';
import { ResumeModule } from './resume/resume.module';

@Module({
  imports: [ResumeModule],
})
export class AppModule {}
