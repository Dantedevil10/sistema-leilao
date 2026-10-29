import { Injectable, BadGatewayException, Logger } from '@nestjs/common';

@Injectable()
export class ExternalApiService {
  private readonly baseUrl = 'https://fakestoreapi.com/products';
  private readonly logger = new Logger(ExternalApiService.name);

  async searchItems(query?: string) {
    try {
      // Trava de segurança: Aborta se a FakeStoreAPI demorar mais de 8 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(this.baseUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`A API externa retornou status HTTP: ${response.status}`);
      }
      
      const items = await response.json();

      if (query && query.trim() !== '') {
        return items.filter((item: any) =>
          item.title.toLowerCase().includes(query.toLowerCase()),
        );
      }
      return items;
    } catch (error:any) {
      // AGORA SIM O ERRO VAI APARECER NO LOG DO RENDER
      this.logger.error(`Falha ao buscar fakestoreapi: ${error.message}`);
      
      // Retorna array vazio em vez de explodir a tela do usuário com erro 502
      return []; 
    }
  }

  async getItemById(id: string | number) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${this.baseUrl}/${id}`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Status HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error:any) {
      this.logger.error(`Falha ao buscar item ${id} na fakestoreapi: ${error.message}`);
      
      // Lança exceção controlada apenas se a busca por ID específico falhar
      throw new BadGatewayException('Item da API externa indisponível no momento.');
    }
  }
}