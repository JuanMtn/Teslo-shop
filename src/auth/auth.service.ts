import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from "bcrypt";


@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){}

  async create(createUserDto: CreateUserDto) {

    try {
      const {password, ...userData}=createUserDto;
      const user= this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password,10)
    });

      await this.userRepository.save(user);
      delete user.password;
      
      return user;
      //TODO: Retornar el JWT de acceso

    } catch (error) {
      this.handleDBErrors(error);
    }

  }

  async login(loginUserDto: LoginUserDto){

    const {password, email}= loginUserDto;

    const user = await this.userRepository.findOne({
      where: {email},
      select:{email:true,password:true}
    })

    if(!user)
    throw new UnauthorizedException(`Credencials are not valid (email)`);
  
    if(!bcrypt.compareSync(password,user.password))
      throw new UnauthorizedException(`Credencials are not valid (password)`);

      //TODO return JWT
      
    return user;
  }

  private handleDBErrors(error:any):never{
    if(error.code === '23505'){
      throw new BadRequestException(error.detail);
    }
    console.log(error);

    throw new InternalServerErrorException(`Please check server logs`);
  }
}
