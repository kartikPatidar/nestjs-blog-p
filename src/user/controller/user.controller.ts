import { Controller, Post, Get, Patch, Body, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Request, Res } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { User, UserRole } from '../models/user.interface';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { hasRoles } from 'src/decorator/roles-decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-guard';
import { RolesGuard } from 'src/auth/guards/roles-guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { profile } from 'console';
import { join } from 'path';
const path = require('path'); 

export const storage = {        
    storage: diskStorage({
    destination: './uploads/profileimages',
    filename: (req, file, cb) => {
        const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
        const extension: string = path.parse(file.originalname).ext;

        cb(null, `${filename}${extension}`)
        }
    })
}

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

    @UseGuards(JwtAuthGuard)
    @Post('upload')
    @UseInterceptors(FileInterceptor('file',storage))
    uploadFile(@UploadedFile() file, @Request() req): Observable<Object> {
        const user: User = req.user;
        console.log(user)

        return this.userService.updateUser(user.id, {profileImage: file.filename}).pipe(
            tap((user: User) => console.log(user)),
            map((user: User) => ({profileImage: user.profileImage}))
        );
    }

    @Get('profile-image/:imagename')
    findProfileImage(@Param('imagename') imagename, @Res() res): Observable<Object>{
        return of(res.sendFile(join(process.cwd(), 'uploads/profileimages/' + imagename)));
    }
}
