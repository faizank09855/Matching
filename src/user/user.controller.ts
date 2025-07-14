import { Body, Controller, Get, Post, Request, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./user.interface";
import { PersonalDetail } from "src/interface/personalDetails.interface";
import { AuthGuard } from "@nestjs/passport";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { Likes } from "src/interface/like.interface";
import { FileInterceptor } from "@nestjs/platform-express";
import { ImagekitService } from "src/imagekit/imagekit.service";
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserDto } from "src/interface/user.dto";

@ApiTags('users')
@Controller('user')
export class UserController {

    constructor(private userService: UserService, private imagekitService: ImagekitService) { }

    @ApiOperation({ summary: 'Create user' })
    @ApiResponse({ status: 201, description: 'User created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Post('login')
    login(@Body() body: UserDto) {
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


    
    @Post('updatePersonalDetails')
    @UseGuards(JwtAuthGuard)
    updatePersonalDetails(@Body() body: PersonalDetail, @Request() req) {
        return this.userService.updatePersonalDetails(body, req.user)
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
    likeUser(@Request() req, @Body() body: any) {
        return this.userService.likeUser(req.user, body)
    }

    @Get('getLikedProfiles')
    @UseGuards(JwtAuthGuard)
    getLikedProfiles(@Request() req) {
        return this.userService.getLikedProfiles(req.user)
    }

    @Post('upload_image')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        const uploaded = await this.imagekitService.uploadImage(file);
        return uploaded;
    }

    @Post('change_profile_pic')
    @UseGuards(JwtAuthGuard)
    uploadProfilePic(@Request() req , @Body() body) {
        return this.userService.changeProfilePic(req.user , body)
    }
   
    @Get('get_requests')
    @UseGuards(JwtAuthGuard)
    getRequests(@Request() req, ) {
        return this.userService.getRequest(req.user)
    }


    @Post('accept_request')
    @UseGuards(JwtAuthGuard)
    acceptRequest(@Request() req, @Body() body ) {
        return this.userService.acceptRequest(req.user , body)
    }
} 