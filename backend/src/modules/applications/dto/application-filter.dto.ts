import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ApplicationStatus } from '../../../common/enums';

export class ApplicationFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'User ID to filter by',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Job post ID to filter by',
    example: '507f1f77bcf86cd799439012',
  })
  @IsOptional()
  @IsMongoId()
  jobPostId?: string;

  @ApiPropertyOptional({
    description: 'Company ID to filter by',
    example: '507f1f77bcf86cd799439013',
  })
  @IsOptional()
  @IsMongoId()
  companyId?: string;

  @ApiPropertyOptional({
    description: 'Application status to filter by',
    enum: ApplicationStatus,
    example: ApplicationStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;
}
