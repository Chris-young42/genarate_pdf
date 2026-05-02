import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateResumeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  public title!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  public content!: string;
}
