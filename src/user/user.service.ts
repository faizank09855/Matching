import { Body, HttpException, HttpStatus, Injectable, UseGuards } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { User } from './user.interface';
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';
import { PersonalDetail } from "src/interface/personalDetails.interface";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { errorResponse, successResponse } from "src/common/response.service";
import { Likes } from "src/interface/like.interface";
import { ImagekitService } from "src/imagekit/imagekit.service";
import { userInfo } from "os";
import { lookup } from "dns";


@Injectable()
export class UserService {
    constructor(@InjectModel('User') private UserSchema: Model<User>, @InjectModel('PersonalDetails') private personalDetailsSchema: Model<PersonalDetail>,
        @InjectModel('Likes') private likeSchema: Model<Likes>,

        private jwtService: JwtService) { }


    async loginEmail(@Body() body: any) {
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
                            email: user.email
                        }),
                        onboardingStatus: user['onboardingStatus']
                    }
                }
            }
        }
    }

    async findByEmail(email: String) {
        const user = await this.UserSchema.findOne({ email }).exec();
        return user;
    }

    async signUp(user: User) {
        try {
            // Check if user with the email already exists
            const existingUser = await this.UserSchema.findOne({ email: user.email });

            if (existingUser) {
                return {
                    status: false,
                    message: "Email already registered",
                    data: null,
                };
            }

            // Create and save new user
            const userSchema = new this.UserSchema({ ...user, onboardingStatus: "Onboarding" });
            const savedUser = await userSchema.save();

            const accessToken = this.jwtService.sign({
                sub: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
            });

            return {
                status: true,
                message: "User created successfully",
                data: {
                    ...savedUser.toObject(),
                    accessToken,
                },
            };
        } catch (e) {
            console.error(e);
            return {
                status: false,
                message: "An error occurred during sign-up",
                error: e.message,
            };
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

    async savePersonalDetails(personalDetails: PersonalDetail, user: any) {
        try {
            const userData = await this.UserSchema.findOneAndUpdate({ _id: user['sub'] }, { onboardingStatus: "Done" },).exec();
            const newData = Object.assign({ ...personalDetails }, { userId: user['sub'] });
            const personalDetail = await new this.personalDetailsSchema(newData);
            return {
                status: true,
                data: personalDetail.save()
            }
        } catch (e) {
            return e;
        }
    }

    async updatePersonalDetails(personalDetails: PersonalDetail, user: any) {
        try {
            const result = await this.personalDetailsSchema.findOneAndUpdate({ userId: user['sub'] }, personalDetails);
            return successResponse("data updated successfull", result);
        } catch (e) {
            return errorResponse(e.toString());
        }
    }

    async getMyPersonalDetails(user: Object) {
        try {
            const response = await this.personalDetailsSchema.aggregate([{
                $match: { userId: user['sub'] }
            }, {
                $lookup: {
                    from: 'users',
                    let: { userIdStr: '$userId' }, // userId is string
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', { $toObjectId: '$$userIdStr' }]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                name: 1,
                                email: 1
                            }
                        },

                    ],
                    as: 'users'
                }


            },

            {
                $unwind: {
                    path: '$users',
                    preserveNullAndEmptyArrays: false // set to false to exclude unmatched users
                }
            },
            {
                $project: {
                    _id: 0,
                    city: 1,
                    userId: 1,
                    age: 1,
                    gender: 1,
                    bio: 1,
                    dob: 1,
                    work: 1,
                    education: 1,
                    height: 1,
                    creativity: 1,
                    sportType: 1,
                    filmType: 1,
                    name: '$users.name',
                    email: '$users.email',
                    profilePic: 1,
                    smoke: 1
                }
            },
            { $limit: 1 }
            ])
            if (response) {
                return successResponse(' ', response[0])
            }
            else {
                return errorResponse('', '')
            }

        }
        catch (e) {
            return errorResponse('', e)
        }

    }

    async getMatches(user: any) {
        try {
            if (!user?.sub) {
                throw new HttpException('Invalid user input', HttpStatus.BAD_REQUEST);
            }
            const userId = new mongoose.Types.ObjectId(user["sub"]);
            console.log(userId);
            const stringId = userId.toString();
            console.log(stringId);

            // Step 1: Get user's personal details
            const userData = await this.personalDetailsSchema.findOne({ userId: stringId });
            if (!userData) {
                throw new HttpException('User personal details not found', HttpStatus.NOT_FOUND);
            }
            // Step 2: Aggregate matching users based on city
            const matches = await this.personalDetailsSchema.aggregate([
                {
                    $match: { city: userData['city'] }
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { userIdStr: '$userId' }, // userId is string
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$_id', { $toObjectId: '$$userIdStr' }]
                                    }
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    name: 1,
                                    email: 1
                                }
                            }
                        ],
                        as: 'users'
                    }
                },
                {
                    $unwind: {
                        path: '$users',
                        preserveNullAndEmptyArrays: false // set to false to exclude unmatched users
                    }
                },
                {
                    $project: {
                        _id: 0,
                        city: 1,
                        userId: 1,
                        age: 1,
                        gender: 1,
                        bio: 1,
                        dob: 1,
                        height: 1,
                        creativity: 1,
                        sportType: 1,
                        filmType: 1,
                        name: '$users.name',
                        email: '$users.email',
                        profilePic: 1
                    }
                }
            ]);
            return successResponse('Matches fetched successfully ✅', matches);
        } catch (error) {
            return errorResponse('Matches Not Found ❌', error)
        }
    }

    async likeUser(user: any, body: Likes) {
        try {
            const likedData = new this.likeSchema({ likedId: body['userId'], userId: user['sub'], status: "Pending" });
            likedData.save();
        } catch (e) {
            return errorResponse('Failed ❌', e);
        }
    }

    async getLikedProfiles(user: any) {
        try {
            // Step 1: Get liked user IDs
            const liked = await this.likeSchema.findOne({ userId: user['sub'] });

            if (!liked || !liked.likedId || liked.likedId.length === 0) {
                return successResponse("No liked users found!", []);
            }

            // Step 2: Fetch full user details from User collection
            const likedUsers = await this.UserSchema.find(
                { _id: { $in: liked.likedId } },
                { name: 1, email: 1 } // only return these fields
            );

            return successResponse("Data found successfully ✅", likedUsers);

        } catch (error) {
            return errorResponse("Failed to fetch liked profiles ❌", error);
        }
    }

    async changeProfilePic(user: any, body: any) {
        const userData = await this.personalDetailsSchema.findOneAndUpdate({ userId: user['sub'] }, { profilePic: body['profilePic'] }).exec();
        return successResponse("Profile pic updated")

    }

    async getRequest(user: any) {
        try {
            const response = await this.likeSchema.aggregate([
                {
                    $match: {
                        likedId: user['sub'],
                        status: "Pending"
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { userIdStr: "$userId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$_id', { $toObjectId: '$$userIdStr' }]
                                    }
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    name: 1,
                                    email: 1
                                }
                            }
                        ],
                        as: 'users'
                    }
                },
                {
                    $lookup: {
                        from: "personaldetails",
                        let: { userIdStr: "$userId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$userId', "$$userIdStr"]
                                    }
                                }
                            },
                            {
                                $project: {
                                    profilePic: 1,
                                    _id: 0
                                }
                            }
                        ],
                        as: "PersonalDetails"
                    }
                },
                {
                    $unwind: {
                        path: '$users',
                        preserveNullAndEmptyArrays: false
                    }
                },
                {
                    $unwind: {
                        path: '$PersonalDetails',
                        preserveNullAndEmptyArrays: true // use true to allow empty profilePic
                    }
                },
                {
                    $project: {
                        _id: 0,
                        userId: 1,
                        name: '$users.name',
                        email: '$users.email',
                        profilePic: "$PersonalDetails.profilePic"
                    }
                }
            ]);

            return successResponse("Data Found", response);
        } catch (e) {
            return errorResponse(e);
        }
    }

    async acceptRequest(user: any, body: any) {
        const result = await this.likeSchema.findOneAndUpdate({ likedId: user['sub'], userId: body['userId'] }, { status: "Accepted" })
        return successResponse("request accepted", result)
    }

}