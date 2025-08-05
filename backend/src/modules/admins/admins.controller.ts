import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public, Roles } from '../../common/decorators/auth.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AdminRole } from '../../common/enums';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@ApiTags('Admins')
@Controller('admins')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) { }

  @Post()
  @Public() // Temporarily public for development
  @Roles(AdminRole.SUPERADMIN)
  @ApiOperation({ summary: 'Create a new admin' })
  @ApiResponse({
    status: 201,
    description: 'Admin created successfully',
  })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminsService.create(createAdminDto);
  }

  @Get()
  @Public() // Temporarily public for development
  @Roles(AdminRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get all admins with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Admins retrieved successfully',
  })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.adminsService.findAll(paginationDto);
  }

  @Get('system-stats')
  @Public() // Temporarily public for development
  @Roles(AdminRole.SUPERADMIN, AdminRole.MODERATOR)
  @ApiOperation({ summary: 'Get system-wide statistics' })
  @ApiResponse({
    status: 200,
    description: 'System statistics retrieved successfully',
  })
  async getSystemStats() {
    return this.adminsService.getSystemStats();
  }

  @Get(':id')
  @Public() // Temporarily public for development
  @Roles(AdminRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get admin by ID' })
  @ApiParam({ name: 'id', description: 'Admin ID' })
  @ApiResponse({
    status: 200,
    description: 'Admin retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  async findOne(@Param('id') id: string) {
    return this.adminsService.findOne(id);
  }

  @Patch(':id')
  @Public() // Temporarily public for development
  @Roles(AdminRole.SUPERADMIN)
  @ApiOperation({ summary: 'Update admin by ID' })
  @ApiParam({ name: 'id', description: 'Admin ID' })
  @ApiResponse({
    status: 200,
    description: 'Admin updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminsService.update(id, updateAdminDto);
  }

  @Delete(':id')
  @Public() // Temporarily public for development
  @Roles(AdminRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete admin by ID' })
  @ApiParam({ name: 'id', description: 'Admin ID' })
  @ApiResponse({ status: 200, description: 'Admin deleted successfully' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  async remove(@Param('id') id: string) {
    await this.adminsService.remove(id);
    return { message: 'Admin deleted successfully' };
  }
}