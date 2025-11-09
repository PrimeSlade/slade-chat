import { ApiProperty } from '@nestjs/swagger';

export class User {
  name: string;

  @ApiProperty({ example: 'ok@email.com', description: 'email' })
  email: string;

  @ApiProperty({ example: 11111, description: "user's password" })
  password: string;
}
