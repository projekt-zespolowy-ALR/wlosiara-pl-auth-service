import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({name: "user_credentials"})
export default class UserCredentialsEntity {
	@PrimaryGeneratedColumn("uuid", {name: "id"})
	public readonly id!: string;
	@Column({name: "email", type: "text", length: 255, unique: true})
	public email!: string;
	@Column({name: "hashed_password", type: "text", length: 255})
	public hashedPassword!: string;
	@Column({name: "user_id", type: "text", unique: true})
	public userId!: string;
}
