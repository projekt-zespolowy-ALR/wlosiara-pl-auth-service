import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity({name: "cats"})
class CatEntity {
	@PrimaryGeneratedColumn("uuid", {name: "id"})
	public readonly id!: string;

	@Column({name: "name"})
	public readonly name!: string;

	@Column({name: "age"})
	public readonly age!: number;

	@Column({name: "breed"})
	public readonly breed!: string;
}

export default CatEntity;
