import { io } from 'socket.io-client';

// Usa a URL da API na nuvem (Vercel/Render) ou localhost quando estiver no seu PC
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Configura o socket para não conectar automaticamente (conectaremos ao entrar na sala)
const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'], // Adiciona suporte explícito para evitar bloqueios extras
});

export default socket;