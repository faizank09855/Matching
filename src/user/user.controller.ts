import { Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./user.interface";
import { PersonalDetail } from "src/interface/personalDetails.interface";
import { AuthGuard } from "@nestjs/passport";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { Likes } from "src/interface/like.interface";

@Controller('user')
export class UserController {

    constructor(private userService: UserService) { }

    @Post('login')
    login(@Body() body: Object) {
        return this.userService.loginEmail(body)
    }


    @Post('signUp')
    signUp(@Body() body: User) {
        return this.userService.signUp(body)
    }

    @Post('savePersonalDetails')
    @UseGuards(JwtAuthGuard)
    savePersonalDetails(@Body() body: PersonalDetail, @Request() req) {
        return this.userService.savePersonalDetails(body, req.user)
    }


    @Get('getMyPersonalDetails')
    @UseGuards(JwtAuthGuard)
    getMyPersonalDetails(@Request() req) {
        return this.userService.getMyPersonalDetails(req.user)
    }


    @Get('getMatches')
    @UseGuards(JwtAuthGuard)
    getMatches(@Request() req) {
        return this.userService.getMatches(req.user)
    }


    @Post('likeUser')
    @UseGuards(JwtAuthGuard)
    likeUser(@Request() req  , @Body() body :any) {
        return this.userService.likeUser(req.user , body)
    }
  
    @Get('getLikedProfiles')
    @UseGuards(JwtAuthGuard)
    getLikedProfiles(@Request() req) {
        return this.userService.getLikedProfiles(req.user)
    }
} 