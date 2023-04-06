import {ApiProperty} from "@nestjs/swagger";
import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity({name: "credentials"})
class CredentialsEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid", {name: "id"})
  public readonly id!: string;
  @ApiProperty()
  @Column({name: "email"})
  public readonly email!: string;
  @ApiProperty()
  @Column({name: "hash"})
  public readonly hash!: string;
}

export default CredentialsEntity;