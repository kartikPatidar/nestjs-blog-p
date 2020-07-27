import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from "typeorm";

@Entity()
export class UserEntity {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @BeforeInsert()
    emailToLoweCase() {
        this.email = this.email.toLowerCase();
    }
}