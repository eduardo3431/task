import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { AuthCredentialDto } from './dto/auth-credential.dto';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';


@EntityRepository(User)
export class UserRepository extends Repository<User> {
    
    async signUp(authCredentialDto: AuthCredentialDto): Promise<void> {
        const { username, password} = authCredentialDto;
        //create encrypt password

        const user = new User();
        user.username = username;
        user.salt = await bcrypt.genSalt();
        user.password = await this.hashPassword(password,  user.salt);
        

        try {
            await user.save();
        }catch (error) {
            if(error.code === "ER_DUP_ENTRY") { // duplicate username
                throw new ConflictException("Username already exist"); 
            }else {
                throw new InternalServerErrorException(); 
            }
        }
      
    }

    async validateUserPassword(authCredentialDto: AuthCredentialDto): Promise<string> {
        const { username, password} = authCredentialDto;
        const user = await this.findOne({ username });

        if( user && await user.validatePassword(password)) {
            return user.username;
        }else {
            return null;
        }

    }

    private async hashPassword(password: string, salt: string) {
        return bcrypt.hash(password, salt);
    }
}