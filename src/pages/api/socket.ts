import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function SocketHandler(req: NextApiRequest, res: any) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.io server...');
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
    });
    
    res.socket.server.io = io;
    (global as any).io = io;

    io.on('connection', (socket) => {
      socket.on('join', (room: string) => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room ${room}`);
      });
      socket.on('leave', (room: string) => {
        socket.leave(room);
      });
    });
  }
  res.end();
}
