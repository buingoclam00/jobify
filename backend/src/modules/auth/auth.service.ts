import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AdminsService } from '../admins/admins.service';
import { CompaniesService } from '../companies/companies.service';
import { UsersService } from '../users/users.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private companiesService: CompaniesService,
    private adminsService: AdminsService,
  ) { }

  async loginUser(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user || !(await bcrypt.compare(loginDto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user._id,
      email: user.email,
      type: 'user',
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: (user._id as any).toString(),
        email: user.email,
        name: user.name,
        type: 'user',
      },
    };
  }

  async loginCompany(loginDto: LoginDto): Promise<AuthResponseDto> {
    const company = await this.companiesService.findByEmail(loginDto.email);

    if (!company || !(await bcrypt.compare(loginDto.password, company.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: company._id,
      email: company.email,
      type: 'company',
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: (company._id as any).toString(),
        email: company.email,
        name: company.name,
        type: 'company',
      },
    };
  }

  async loginAdmin(loginDto: LoginDto): Promise<AuthResponseDto> {
    const admin = await this.adminsService.findByEmail(loginDto.email);

    if (!admin || !(await bcrypt.compare(loginDto.password, admin.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: admin._id,
      email: admin.email,
      type: 'admin',
      role: admin.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: (admin._id as any).toString(),
        email: admin.email,
        name: admin.name,
        type: 'admin',
        role: admin.role,
      },
    };
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshToken(oldToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = this.jwtService.verify(oldToken);
      const newToken = this.jwtService.sign({
        sub: decoded.sub,
        email: decoded.email,
        type: decoded.type,
        role: decoded.role,
      });

      return { accessToken: newToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}