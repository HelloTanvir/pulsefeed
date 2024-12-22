import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetCurrentUser } from '../common/decorators/get-current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get(':userId')
    // TODO: implement admin access only
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    findOneUserById(@Param('userId') userId: string): Promise<User> {
        return this.userService.findOneUserById(userId);
    }

    @Get('current-user')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    getCurrentUser(@GetCurrentUser('userId') userId: string): Promise<User> {
        return this.userService.findOneUserById(userId);
    }

    @Patch(':userId')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    updateUser(
        @Param('userId') userId: string,
        @Body() updateUserDto: UpdateUserDto
    ): Promise<User> {
        return this.userService.updateUser(userId, updateUserDto);
    }

    @Delete(':userId')
    // TODO: implement admin access only
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    removeUser(@Param('userId') userId: string): Promise<User> {
        return this.userService.removeUser(userId);
    }
}
