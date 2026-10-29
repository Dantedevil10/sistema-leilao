import { Injectable, BadGatewayException, Logger } from '@nestjs/common';

@Injectable()
export class ExternalApiService {
  private readonly baseUrl = 'https://fakestoreapi.com/products';
  private readonly logger = new Logger(ExternalApiService.name);

  // Headers para disfarçar o Node.js de navegador e passar no firewall da API externa (Evita o erro 403)
  private readonly requestHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
  };

  async searchItems(query?: string) {
    try {
      // Timeout de 8 segundos para evitar que a requisição trave o servidor
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(this.baseUrl, { 
        signal: controller.signal,
        headers: this.requestHeaders 
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Status HTTP retornado: ${response.status}`);
      }
      
      const items = await response.json();

      if (query && query.trim() !== '') {
        return items.filter((item: any) =>
          item.title.toLowerCase().includes(query.toLowerCase()),
        );
      }
      return items;
    } catch (error:any) {
      // Registra o motivo real (timeout ou 403) no log interno do Render
      this.logger.error(`Falha ao buscar fakestoreapi: ${error.message}`);
      
      // DEVOLVE A SINALIZAÇÃO PARA O FRONTEND CONFORME O SEU CÓDIGO ORIGINAL
      throw new BadGatewayException(
        'Falha ao buscar itens na API externa. Tente novamente.',
      );
    }
  }

  async getItemById(id: string | number) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${this.baseUrl}/${id}`, { 
        signal: controller.signal,
        headers: this.requestHeaders 
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Status HTTP retornado: ${response.status}`);
      }
      
      return await response.json();
    } catch (error:any) {
      this.logger.error(`Falha ao buscar item ${id} na fakestoreapi: ${error.message}`);
      
      // DEVOLVE A SINALIZAÇÃO PARA O FRONTEND
      throw new BadGatewayException('Item da API externa não encontrado.');
    }
  }
}