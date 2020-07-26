import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../models/user.entity';
import { Repository } from 'typeorm';
import { User } from '../models/user.interface';
import { Observable, from } from 'rxjs';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>
    ) {}

    createUser(user: User): Observable<User>{
        return from(this.userRepository.save(user));
    }

    getUser(id: number): Observable<User> {
        return from(this.userRepository.findOne({id}));
    }


    getAllUsers(): Observable<User[]> {
        return from(this.userRepository.find());
    }

    deleteUser(id: number): Observable<any> {
        return from(this.userRepository.delete(id));
    }

    updateUser(id: number, user: User): Observable<any> {
        return from(this.userRepository.update(id, user));
    }
}
