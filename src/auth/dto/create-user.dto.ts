import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";


export class CreateUserDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { //Expresion regular para que cumpla el formato clasico de password
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    password: string;

    @IsString()
    @MinLength(1)
    fullname: string
}