import { Module } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { Mongoose } from "mongoose";
import { MongooseModule } from "@nestjs/mongoose";
import { ChatSchema } from "src/schemas/chat.schema";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ChatGateway } from "./chat.gateway";

@Module({
    controllers: [ChatController],
    exports: [],
    imports: [
        MongooseModule.forFeature([{ name: 'chat', schema: ChatSchema }]),
        PassportModule,
        JwtModule.register({
            secret: 'kryupa',
            signOptions: { expiresIn: '1d' },
        }),
    ],
    providers: [ChatService , ChatGateway],
})


export class ChatModule { }