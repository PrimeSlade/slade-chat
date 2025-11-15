import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Okok' })
  name: string;

  @ApiProperty({ example: 'okok@gmail.com' })
  email: string;
}
