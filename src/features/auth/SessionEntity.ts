import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity({name: "Session"})
class SessionEntity {
	@PrimaryGeneratedColumn("uuid", {name: "id"})
	public readonly id!: string;

	@Column({name: "credentialsId"})
	public readonly credentialsId!: string;

	@Column({name: "expiresAt"})
	public readonly expiresAt!: Date;
}

export default SessionEntity;
