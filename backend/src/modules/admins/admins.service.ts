import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import {
  PaginatedResponse,
  PaginationDto,
} from '../../common/dto/pagination.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin, AdminDocument } from './schemas/admin.schema';

@Injectable()
export class AdminsService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    // eslint-disable-next-line prettier/prettier
  ) { }

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    try {
      const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);

      const newAdmin = new this.adminModel({
        ...createAdminDto,
        passwordHash: hashedPassword,
      });

      const savedAdmin = await newAdmin.save();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      return this.findOne((savedAdmin._id as any).toString());
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === 11000) {
        throw new ConflictException('Email already exists');
      }
      throw new BadRequestException('Failed to create admin');
    }
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Admin>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [admins, totalItems] = await Promise.all([
      this.adminModel
        .find()
        .select('-passwordHash')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.adminModel.countDocuments().exec(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: admins,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<Admin> {
    const admin = await this.adminModel
      .findById(id)
      .select('-passwordHash')
      .exec();

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }

  async findByEmail(email: string): Promise<Admin | null> {
    return this.adminModel.findOne({ email }).exec();
  }

  async update(id: string, updateAdminDto: UpdateAdminDto): Promise<Admin> {
    try {
      const admin = await this.adminModel
        .findByIdAndUpdate(id, updateAdminDto, { new: true })
        .select('-passwordHash')
        .exec();

      if (!admin) {
        throw new NotFoundException('Admin not found');
      }

      return admin;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === 11000) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.adminModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Admin not found');
    }
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await this.adminModel
      .updateOne({ _id: id }, { passwordHash: hashedPassword })
      .exec();

    if (result.matchedCount === 0) {
      throw new NotFoundException('Admin not found');
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getSystemStats(): Promise<any> {
    // This would typically import and use other services
    // For now, we'll return a placeholder structure
    return {
      users: {
        total: 0,
        newThisMonth: 0,
      },
      companies: {
        total: 0,
        newThisMonth: 0,
      },
      jobPosts: {
        total: 0,
        active: 0,
        newThisMonth: 0,
      },
      applications: {
        total: 0,
        pending: 0,
        newThisMonth: 0,
      },
      categories: {
        total: 0,
      },
      skills: {
        total: 0,
      },
    };
  }
}
