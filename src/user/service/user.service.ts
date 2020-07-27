import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../models/user.entity';
import { Repository } from 'typeorm';
import { User } from '../models/user.interface';
import { Observable, from, throwError } from 'rxjs';
import { AuthService } from 'src/auth/services/auth.service';

import { switchMap, map, catchError } from 'rxjs/operators';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        private readonly authservice: AuthService    
    ) {}

    createUser(user: User): Observable<User>{
        return this.authservice.hashPassward(user.password).pipe(
            switchMap((passwordHash: string) => {
                const newUser = new UserEntity();
                newUser.name = user.name;
                newUser.username = user.username;
                newUser.email = user.email;
                newUser.password = passwordHash;
                newUser.role = user.role;

                return from(this.userRepository.save(newUser)).pipe(
                    map((user: User) => {
                        const {password, ...result} = user;
                        return result;
                    }),
                    catchError(err => throwError(err))
                )
            })
        )
        // return from(this.userRepository.save(user));
    }

    getUser(id: number): Observable<User> {
        return from(this.userRepository.findOne({id})).pipe(
            map((user: User) => {
                if(!user) {
                    throw new NotFoundException();
                }
                const { password, ...result } = user;
                return result;
            })
        )
    }


    getAllUsers(): Observable<User[]> {
        return from(this.userRepository.find()).pipe(
            map((users) => {
                users.forEach(function (user) {delete user.password});
                return users;
            })
        );
    }

    deleteUser(id: number): Observable<any> {
        return from(this.userRepository.delete(id));
    }

    updateUser(id: number, user: User): Observable<any> {
        delete user.password;
        delete user.email;
        return from(this.userRepository.update(id, user));
    }

    updateRoleOfUser(id: number, user: User): Observable<any> {
        return from(this.userRepository.update(id, user));
    }

    login(user: User): Observable<string> {
        return this.validateUser(user.email, user.password).pipe(
            switchMap((user: User) => {
                if(user) {
                    return this.authservice.generateJWT(user).pipe(
                        map((jwt: string) => jwt)
                    )
                } else {
                    return 'Wrong Credentials';
                }
            })
        )
    }

    validateUser(email: string, password: string): Observable<User> {
        return this.findByMail(email).pipe(
            switchMap((user: User) => {
                if(!user) {
                    throw new NotFoundException();
                }
                return this.authservice.comparePasswords(password, user.password).pipe(
                map((match: boolean) => {
                    if(match) {
                        const {password, ...result} = user;
                        return result;
                    }
                    //edited
                    throw Error;
                })
            )})
        )
    }

    findByMail(email: string): Observable<User> {
        return from(this.userRepository.findOne({email: email.toLowerCase()}))
    }
}
