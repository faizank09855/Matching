import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { MongooseModule } from "@nestjs/mongoose";
import { UserSchema } from "./user.schemas";
import { JwtModule, } from "@nestjs/jwt";

import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./jwt.strategy";
import { PersonalDetailSchema } from "./personalDetail.schemas";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { LikeSchema } from "src/schemas/like.schema";
import { ImagekitModule } from "src/imagekit/imagekit.module";


@Module({
    controllers: [UserController],
    exports: [],
    providers: [UserService, JwtStrategy, JwtAuthGuard],
    imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }, { name: 'PersonalDetails', schema: PersonalDetailSchema }, { name: 'Likes', schema: LikeSchema }]),
        PassportModule,
    JwtModule.register({
        secret: 'kryupa', // move to .env in production
        signOptions: { expiresIn: '1d' },
    }),
    ImagekitModule
    ]
})

export class UserModule { }