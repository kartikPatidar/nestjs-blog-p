import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable, from, of } from 'rxjs';
import { User } from 'src/user/models/user.interface';
const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
    constructor(private readonly jwtservice: JwtService) {}

    generateJWT(user: User): Observable<string> {
        return from(this.jwtservice.signAsync({user}));
    }

    hashPassward(passward: string): Observable<string> {
        return from<string>(bcrypt.hash(passward, 12));
    }

    comparePasswords(newPassward: string, passwardHash: string): Observable<any | boolean> {
        return of<any | boolean>(bcrypt.compare(newPassward, passwardHash));
    }
}
