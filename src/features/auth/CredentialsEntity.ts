import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity({name: "credentials"})
class CredentialsEntity {
	@PrimaryGeneratedColumn("uuid", {name: "id"})
	public readonly id!: string;

	@Column({name: "email"})
	public readonly email!: string;

	@Column({name: "hash"})
	public readonly hash!: string;
}

export default CredentialsEntity;
