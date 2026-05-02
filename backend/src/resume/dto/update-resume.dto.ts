import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateResumeDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(200)
  public title?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  public content?: string;
}
