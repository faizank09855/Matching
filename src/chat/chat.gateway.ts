import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*', // For dev; restrict in production
  },
})

export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly chatService: ChatService) {}

  afterInit(server: Server) {
    console.log('Socket Server Initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Handle incoming chat message from client
   */
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() payload: { sender: string; receiver: string; message: string },
    @ConnectedSocket() client: Socket
  ) {
    const savedChat = await this.chatService.sendMessage({ sub: payload.sender }, payload);

    // Broadcast message to receiver
    this.server.to(payload.receiver).emit('receive_message', savedChat['data']);

    return savedChat;
  }

  /**
   * Allow users to join a room (their user ID)
   */
  @SubscribeMessage('join')
  handleJoin(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    client.join(userId); // Join personal room
    console.log(`User ${userId} joined room`);
  }
}
