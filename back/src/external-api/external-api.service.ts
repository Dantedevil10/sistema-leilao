import { Injectable, BadGatewayException } from '@nestjs/common';

@Injectable()
export class ExternalApiService {
  private readonly baseUrl = 'https://fakestoreapi.com/products';

  async searchItems(query?: string) {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) throw new Error();
      const items = await response.json();

      if (query) {
        return items.filter((item: any) =>
          item.title.toLowerCase().includes(query.toLowerCase()),
        );
      }
      return items;
    } catch (error) {
      throw new BadGatewayException(
        'Falha ao buscar itens na API externa. Tente novamente.',
      );
    }
  }

  async getItemById(id: string | number) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      if (!response.ok) throw new Error();
      return await response.json();
    } catch (error) {
      throw new BadGatewayException('Item da API externa não encontrado.');
    }
  }
}