import { AxiosInstance } from 'axios';
import {
  EventObserver,
  CreateEventObserverDto,
  UpdateEventObserverDto,
} from '../types/webhook.types';
import { ApiResponse } from '../types/common.types';

/**
 * WebhookService - Gerenciamento de Event Observers (Webhooks)
 *
 * Event Observers permitem receber notificações HTTP quando eventos
 * específicos ocorrem no sistema (ex: envelope completo, signer assinou, etc).
 */
export class WebhookService {
  constructor(private http: AxiosInstance) {}

  /**
   * Cria um novo Event Observer (webhook)
   * @param dto - Configuração do webhook (URL, eventos, secret, etc)
   * @returns Event Observer criado
   *
   * @example
   * ```typescript
   * const webhook = await client.webhooks.create({
   *   name: "Webhook de Produção",
   *   callbackUrl: "https://myapp.com/webhooks/signatures",
   *   eventTypes: ["ENVELOPE_COMPLETED", "SIGNER_SIGNED"],
   *   secret: "my-secret-key",
   *   isActive: true
   * });
   * ```
   */
  async create(dto: CreateEventObserverDto): Promise<EventObserver> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.post<EventObserver>(
      '/api/v1/event-observers',
      dto
    );
    return response.data;
  }

  /**
   * Lista todos os Event Observers da organização
   * @returns Lista de webhooks configurados
   */
  async findAll(): Promise<EventObserver[]> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.get<EventObserver[]>(
      '/api/v1/event-observers'
    );
    return response.data;
  }

  /**
   * Busca um Event Observer por ID
   * @param id - ID do event observer
   * @returns Event Observer encontrado
   */
  async findById(id: string): Promise<EventObserver> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.get<EventObserver>(
      `/api/v1/event-observers/${id}`
    );
    return response.data;
  }

  /**
   * Atualiza um Event Observer
   * @param id - ID do event observer
   * @param dto - Dados para atualizar (campos parciais)
   * @returns Event Observer atualizado
   *
   * @example
   * ```typescript
   * // Desativar webhook temporariamente
   * await client.webhooks.update(webhookId, {
   *   isActive: false
   * });
   *
   * // Adicionar mais eventos
   * await client.webhooks.update(webhookId, {
   *   eventTypes: [
   *     "ENVELOPE_COMPLETED",
   *     "SIGNER_SIGNED",
   *     "DOCUMENT_SIGNED"  // Novo
   *   ]
   * });
   * ```
   */
  async update(id: string, dto: UpdateEventObserverDto): Promise<EventObserver> {
    // ✅ v3.0: Direct type (no ApiResponse wrapper)
    const response = await this.http.patch<EventObserver>(
      `/api/v1/event-observers/${id}`,
      dto
    );
    return response.data;
  }

  /**
   * Deleta um Event Observer permanentemente
   * @param id - ID do event observer
   *
   * @example
   * ```typescript
   * await client.webhooks.delete(webhookId);
   * ```
   */
  async delete(id: string): Promise<void> {
    await this.http.delete(`/api/v1/event-observers/${id}`);
  }

  /**
   * Ativa um Event Observer
   * Atalho para update({ isActive: true })
   */
  async activate(id: string): Promise<EventObserver> {
    return this.update(id, { isActive: true });
  }

  /**
   * Desativa um Event Observer
   * Atalho para update({ isActive: false })
   */
  async deactivate(id: string): Promise<EventObserver> {
    return this.update(id, { isActive: false });
  }
}
