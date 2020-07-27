import { Controller, Post, Get, Patch, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { User, UserRole } from '../models/user.interface';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { hasRoles } from 'src/decorator/roles-decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-guard';
import { RolesGuard } from 'src/auth/guards/roles-guard';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    createUser(@Body() user: User): Observable<User | Object> {
        return this.userService.createUser(user).pipe(
            map((user: User) => user),
            catchError(err => of({error: err.message}))
        );
    }

    @Post('login')
    login(@Body() user: User): Observable<Object> {
        return this.userService.login(user).pipe(
            map((jwt: String) => {
                return {access_token: jwt}
            })
        );
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
    
    @hasRoles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Patch(':id/role')
    updateRole(@Param('id') id: string, @Body() user: User): Observable<User> {
        return this.userService.updateRoleOfUser(Number(id), user);
    }
}
