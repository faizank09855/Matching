import { Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { JwtAuthGuard } from "src/user/jwt-auth.guard";


@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private chatService: ChatService) { }
    @Post('sendMessage')
    async sendMessage( @Request() req ,  @Body() body) {
        return this.chatService.sendMessage(req.user , body);
    }
    
    @Post('getMessage')
    async getMessage( @Request() req ,  @Body() body) {
        return this.chatService.getMessage(req.user , body);
    }

    @Get('getChat')
    async getChat(@Request() req){
        return this.chatService.getChatList(req.user); 

    }
}