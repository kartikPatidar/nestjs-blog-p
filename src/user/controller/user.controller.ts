import { Controller, Post, Get, Patch, Body, Param, Delete } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { User } from '../models/user.interface';
import { Observable } from 'rxjs';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    createUser(@Body() user: User): Observable<User> {
        return this.userService.createUser(user);
    }

    @Get(':id')
    getUser(@Param('id') id: string ): Observable<User> {
        return this.userService.getUser(Number(id))
    }
    
    @Get()
    getAllUsers(): Observable<User[]> {
        return this.userService.getAllUsers();
    }

    @Delete(':id')
    deleteUser(@Param('id') id: string ): Observable<User> {
        return this.userService.deleteUser(Number(id))
    }

    @Patch(':id')
    updateUser(
        @Param('id') id: string,
        @Body() user: User
    ): Observable<any> {
        return this.userService.updateUser(Number(id), user);
    }

}
