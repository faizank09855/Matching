import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
    @ApiProperty({ example: 'alice672@example.com' })
    email: String;
    @ApiProperty({ example: 'Test@123' })
    password: String;
}