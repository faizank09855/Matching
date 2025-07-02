import { Injectable } from '@nestjs/common';
import { errorResponse, successResponse } from 'src/common/response.service';

var ImageKit=require("imagekit");



@Injectable()
export class ImagekitService {
    private imagekit = new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
    });

    async uploadImage(file: Express.Multer.File) {
      try {
          const uploadResponse = await this.imagekit.upload({
            file: file.buffer,
            fileName: file.originalname,
            folder: "/uploads",
        });

        return successResponse("image uploaded successfully" , {
            url: uploadResponse.url,
            fileId: uploadResponse.fileId,
        });
      }catch(e){
        return errorResponse(e.toString());
      }
    }
}
