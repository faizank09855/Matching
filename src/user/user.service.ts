import { Body, Injectable, UseGuards } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from './user.interface';
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';
import { PersonalDetail } from "src/interface/personalDetails.interface";
import { JwtAuthGuard } from "./jwt-auth.guard";


@Injectable()
export class UserService {
    constructor(@InjectModel('User') private UserSchema: Model<User>, @InjectModel('PersonalDetails') private personalDetailsSchema: Model<PersonalDetail>, private jwtService: JwtService) { }
    async loginEmail(@Body() body: Object) {
        const user = await this.UserSchema.findOne({ email: body['email'] }).exec();
        if (!user) {
            return {
                status: false,
                message: "user not found"
            }
        } else {
            const decryptPassword = user['password']
            const textPassword = body['password']

            const isPasswordValid = await bcrypt.compare(textPassword, decryptPassword);
            if (!isPasswordValid) {
                return {
                    status: false,
                    message: "Wrong Password"
                }
            } else {
                return {
                    status: true,
                    message: "successful",
                    data: {
                        accessToken: this.jwtService.sign({
                            sub: user._id,
                            name: user.name,
                        })
                    }
                }
            }
        }
    }


    async findByEmail(email: String) {
        const user = await this.UserSchema.findOne({ email }).exec();
        return user;
    }

    signUp(user: User) {
       try{ 
        const userSchema = new this.UserSchema(user);
        return {
            status : true , 
            message : "data added successfully" , 
            data : userSchema.save()
        }
    }catch(e){
           console.log(e.toString());
            return e
        }
    }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.findByEmail(email);
        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user.toObject();
            return result;
        }
        return null;
    }

    async savePersonalDetails(personalDetails: PersonalDetail) {
        const personalDetail = new this.personalDetailsSchema(personalDetails);
        return personalDetail.save()
    }

    async getMyPersonalDetails(user : Object){
       const response =  await this.UserSchema.findById(user['userId'])
       return response
    }
}