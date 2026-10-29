import { Injectable, BadGatewayException, Logger } from '@nestjs/common';

@Injectable()
export class ExternalApiService {
  // Adeus FakeStoreAPI e Proxy. Olá DummyJSON (Rápido e não bloqueia o Render)
  private readonly baseUrl = 'https://dummyjson.com/products';
  private readonly logger = new Logger(ExternalApiService.name);

  async searchItems(query?: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos é mais que suficiente agora

      // O DummyJSON tem busca nativa embutida
      const url = query && query.trim() !== '' 
        ? `${this.baseUrl}/search?q=${encodeURIComponent(query)}` 
        : this.baseUrl;

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Status HTTP retornado: ${response.status}`);
      }
      
      const data = await response.json();
      const items = data.products || [];

      // Mapeamos para o formato exato que o seu FrontEnd já espera do FakeStoreAPI
      return items.map((item: any) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        description: item.description,
        image: item.thumbnail || item.images[0], // Converte thumbnail para image
        category: item.category
      }));
      
    } catch (error:any) {
      this.logger.error(`Falha ao buscar dummyjson: ${error.message}`);
      throw new BadGatewayException('Falha ao buscar itens na API externa. Tente novamente.');
    }
  }

  async getItemById(id: string | number) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${this.baseUrl}/${id}`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Status HTTP retornado: ${response.status}`);
      }
      
      const item = await response.json();
      
      return {
        id: item.id,
        title: item.title,
        price: item.price,
        description: item.description,
        image: item.thumbnail || item.images[0],
        category: item.category
      };
    } catch (error:any) {
      this.logger.error(`Falha ao buscar item ${id} no dummyjson: ${error.message}`);
      throw new BadGatewayException('Item da API externa não encontrado.');
    }
  }
}