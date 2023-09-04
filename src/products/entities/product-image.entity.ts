import { Column, PrimaryGeneratedColumn } from "typeorm";


export class ProductImage{
@PrimaryGeneratedColumn()
id:number;

@Column('text')
url:string;


}