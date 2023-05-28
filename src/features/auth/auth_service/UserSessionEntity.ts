import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({name: "user_sessions"})
export default class UserSessionEntity {
	@PrimaryGeneratedColumn("uuid", {name: "id"})
	public readonly id!: string;
	@Column({name: "token", type: "text", unique: true})
	public token!: string;
	@Column({name: "user_id", type: "text", unique: true})
	public userId!: string;
}
