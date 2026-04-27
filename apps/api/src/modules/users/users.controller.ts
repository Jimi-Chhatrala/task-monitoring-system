import { Controller, Get, Post, Body, Param, ForbiddenException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @UseGuards(AuthGuard)
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return [user];
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get current user' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    if (id !== user.id) {
      throw new ForbiddenException('You can only access your own profile');
    }
    return this.usersService.findOne(id);
  }
}
