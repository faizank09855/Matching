import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from 'src/interface/chat.interface';
import { errorResponse, successResponse } from 'src/common/response.service';
import * as mongoose from 'mongoose';

@Injectable()
export class ChatService {
  constructor(@InjectModel('chat') private readonly chatModel: Model<Chat>) {}

  /**
   * Send a new message
   */
  async sendMessage(user: any, body: { receiver: string; message: string }) {
    try {
      const newChat = new this.chatModel({
        ...body,
        sender: user['sub'],
        createdAt: new Date().toISOString() // ISO date format
      });

      const savedChat = await newChat.save();
      return successResponse('Message sent successfully', savedChat);
    } catch (error) {
      return errorResponse(error);
    }
  }

  /**
   * Get full message history where user is sender or receiver
   */
  async getMessage(user: any , body : any) {
    try {
      const userId = user['sub'];

      const messages = await this.chatModel.find({
        $or: [{ sender: userId  , receiver: body['receiver'] }, { sender: body['receiver'] ,  receiver: userId }]
      }).sort({ createdAt: 1 });

      return successResponse('Message history fetched', messages);
    } catch (error) {
      return errorResponse(error);
    }
  }

  /**
   * Get list of users the current user has chatted with, with last message preview
   */
  async getChatList(user: any) {
    const currentUserIdStr = user['sub'];

    try {
      const chatList = await this.chatModel.aggregate([
        {
          $match: {
            $or: [
              { sender: currentUserIdStr },
              { receiver: currentUserIdStr }
            ]
          }
        },
        {
          $addFields: {
            chatWith: {
              $cond: [
                { $eq: ['$sender', currentUserIdStr] },
                '$receiver',
                '$sender'
              ]
            }
          }
        },
        {
          $addFields: {
            chatWithObjectId: {
              $cond: [
                { $eq: [{ $strLenCP: '$chatWith' }, 24] },
                { $toObjectId: '$chatWith' },
                null
              ]
            }
          }
        },
        {
          $match: {
            chatWithObjectId: { $ne: null }
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $group: {
            _id: '$chatWithObjectId',
            lastMessage: { $first: '$message' },
            createdAt: { $first: '$createdAt' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        {
          $unwind: '$userInfo'
        },
        {
          $project: {
            _id: 0,
            userId: '$_id',
            username: '$userInfo.name',
            lastMessage: 1,
            createdAt: 1
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ]);

      return successResponse('Chat list fetched', chatList);
    } catch (error) {
      return errorResponse(error);
    }
  }
}
