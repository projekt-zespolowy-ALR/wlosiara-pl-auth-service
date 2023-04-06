import {ApiProperty} from "@nestjs/swagger";
import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity({name: "Session"})
class SessionEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid", {name: "id"})
  public readonly id!: string;
  @ApiProperty()
  @Column({name: "credentialsId"})
  public readonly credentialsId!: string;
  @ApiProperty()
  @Column({name: "expiresAt"})
  public readonly expiresAt!: Date;
}

export default SessionEntity;