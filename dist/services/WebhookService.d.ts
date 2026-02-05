import { AxiosInstance } from 'axios';
import { EventObserver, CreateEventObserverDto, UpdateEventObserverDto } from '../types/webhook.types';
/**
 * WebhookService - Gerenciamento de Event Observers (Webhooks)
 *
 * Event Observers permitem receber notificações HTTP quando eventos
 * específicos ocorrem no sistema (ex: envelope completo, signer assinou, etc).
 */
export declare class WebhookService {
    private http;
    constructor(http: AxiosInstance);
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
    create(dto: CreateEventObserverDto): Promise<EventObserver>;
    /**
     * Lista todos os Event Observers da organização
     * @returns Lista de webhooks configurados
     */
    findAll(): Promise<EventObserver[]>;
    /**
     * Busca um Event Observer por ID
     * @param id - ID do event observer
     * @returns Event Observer encontrado
     */
    findById(id: string): Promise<EventObserver>;
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
    update(id: string, dto: UpdateEventObserverDto): Promise<EventObserver>;
    /**
     * Deleta um Event Observer permanentemente
     * @param id - ID do event observer
     *
     * @example
     * ```typescript
     * await client.webhooks.delete(webhookId);
     * ```
     */
    delete(id: string): Promise<void>;
    /**
     * Ativa um Event Observer
     * Atalho para update({ isActive: true })
     */
    activate(id: string): Promise<EventObserver>;
    /**
     * Desativa um Event Observer
     * Atalho para update({ isActive: false })
     */
    deactivate(id: string): Promise<EventObserver>;
}
//# sourceMappingURL=WebhookService.d.ts.map