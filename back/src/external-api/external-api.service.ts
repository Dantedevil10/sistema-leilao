import { Injectable, BadGatewayException, Logger } from '@nestjs/common';

@Injectable()
export class ExternalApiService {
  // Proxy para mascarar o IP do Render e burlar o bloqueio da FakeStoreAPI
  private readonly proxyUrl = 'https://api.allorigins.win/raw?url=';
  private readonly targetUrl = 'https://fakestoreapi.com/products';
  
  private readonly logger = new Logger(ExternalApiService.name);
  private readonly requestHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
  };

  async searchItems(query?: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      // Faz a requisição passando pelo proxy
      const finalUrl = `${this.proxyUrl}${encodeURIComponent(this.targetUrl)}`;
      const response = await fetch(finalUrl, { 
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
      this.logger.error(`Falha ao buscar fakestoreapi via proxy: ${error.message}`);
      
      // MANTÉM O SINAL DE ERRO PARA O FRONTEND
      throw new BadGatewayException(
        'Falha ao buscar itens na API externa. Tente novamente.',
      );
    }
  }

  async getItemById(id: string | number) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      // Faz a requisição do ID específico passando pelo proxy
      const targetEndpoint = `${this.targetUrl}/${id}`;
      const finalUrl = `${this.proxyUrl}${encodeURIComponent(targetEndpoint)}`;
      
      const response = await fetch(finalUrl, { 
        signal: controller.signal,
        headers: this.requestHeaders 
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Status HTTP retornado: ${response.status}`);
      }
      
      return await response.json();
    } catch (error:any) {
      this.logger.error(`Falha ao buscar item ${id} na fakestoreapi via proxy: ${error.message}`);
      
      // MANTÉM O SINAL DE ERRO PARA O FRONTEND
      throw new BadGatewayException('Item da API externa não encontrado.');
    }
  }
}