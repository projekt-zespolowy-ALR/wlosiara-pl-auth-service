import {ApiProperty} from "@nestjs/swagger";
import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity({name: "cats"})
class CatEntity {
	@ApiProperty()
	@PrimaryGeneratedColumn("uuid", {name: "id"})
	public readonly id!: string;
	@ApiProperty()
	@Column({name: "name"})
	public readonly name!: string;
	@ApiProperty()
	@Column({name: "age"})
	public readonly age!: number;
	@ApiProperty()
	@Column({name: "breed"})
	public readonly breed!: string;
}

export default CatEntity;
