import { io } from 'socket.io-client';

// Configura o socket para não conectar automaticamente (conectaremos ao entrar na sala)
const socket = io('http://localhost:3000', {
  autoConnect: false,
});

export default socket;