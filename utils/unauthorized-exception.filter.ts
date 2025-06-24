// unauthorized-exception.filter.ts

import {
    ExceptionFilter,
    Catch,
    UnauthorizedException,
    ArgumentsHost,
  } from '@nestjs/common';
  import { Response } from 'express';
  
  @Catch(UnauthorizedException)
  export class UnauthorizedExceptionFilter implements ExceptionFilter {
    catch(exception: UnauthorizedException, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
  
      response.status(401).json({
        status: false,
        statusCode: 401,
        message: exception.message || 'Unauthorized',
      });
    }
  }
  