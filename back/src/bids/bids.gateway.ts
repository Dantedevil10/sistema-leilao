import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BidsService } from './bids.service.js';
import { PlaceBidDto } from './dto/place-bid.dto.js';

@WebSocketGateway({ cors: { origin: '*' } })
export class BidsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly bidsService: BidsService) {}

  @SubscribeMessage('joinLot')
  handleJoinLot(@MessageBody('lotId') lotId: string, @ConnectedSocket() client: Socket) {
    client.join(`lot-${lotId}`);
    return { event: 'joinedRoom', lotId };
  }

  @SubscribeMessage('leaveLot')
  handleLeaveLot(@MessageBody('lotId') lotId: string, @ConnectedSocket() client: Socket) {
    client.leave(`lot-${lotId}`);
    return { event: 'leftRoom', lotId };
  }

  @SubscribeMessage('sendBid')
  async handleBid(
    @MessageBody() data: PlaceBidDto & { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const result = await this.bidsService.placeBid(data.userId, data.lotId, data.amount);

      // Transmite atualização em tempo real para todos conectados na sala do lote
      this.server.to(`lot-${data.lotId}`).emit('bidUpdated', {
        bid: {
          id: result.bid.id,
          amount: Number(result.bid.amount),
          createdAt: result.bid.createdAt,
          userId: result.bid.userId,
        },
        lot: result.lot,
        timeExtended: result.timeExtended,
      });

      return { status: 'SUCCESS', data: result };
    } catch (error: any) {
      return { status: 'ERROR', message: error.message };
    }
  }

  // Notificação global disparada no encerramento pelo Worker do BullMQ
  notifyLotEnded(lotId: string, winnerId: string | null, finalPrice: number) {
    this.server.to(`lot-${lotId}`).emit('lotEnded', {
      lotId,
      winnerId,
      finalPrice,
    });
  }
}