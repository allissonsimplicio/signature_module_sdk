import { AxiosInstance } from 'axios';
import { NotificationTemplate, NotificationLog, CreateNotificationTemplateDto, PreviewNotificationTemplateDto, NotificationHistoryFilters, NotificationTemplateFilters } from '../types/notification.types';
import { PaginatedResponse } from '../types/common.types';
/**
 * FASE 6: Serviço para Notificações Multi-Canal
 */
export declare class NotificationService {
    private http;
    constructor(http: AxiosInstance);
    /**
     * Cria template de notificação
     */
    createTemplate(dto: CreateNotificationTemplateDto): Promise<NotificationTemplate>;
    /**
     * 🆕 PROBLEMA 3: Lista templates com suporte a filtros
     * @param filters - Filtros opcionais (channel, name)
     * @returns Lista de templates
     */
    list(filters?: NotificationTemplateFilters): Promise<NotificationTemplate[]>;
    /**
     * Lista todos os templates
     * @deprecated Use list() ao invés deste método. findAllTemplates() será removido na v3.0
     * @see list
     */
    findAllTemplates(): Promise<NotificationTemplate[]>;
    /**
     * Busca template por ID
     */
    findTemplateById(id: string): Promise<NotificationTemplate>;
    /**
     * Preview de template com variáveis
     */
    previewTemplate(templateId: string, dto: PreviewNotificationTemplateDto): Promise<{
        rendered: string;
    }>;
    /**
     * Deleta template
     */
    deleteTemplate(templateId: string): Promise<void>;
    /**
     * Lista histórico de notificações de um envelope
     */
    getHistoryByEnvelope(envelopeId: string, filters?: NotificationHistoryFilters): Promise<PaginatedResponse<NotificationLog>>;
    /**
     * Lista histórico de notificações de um signatário
     */
    getHistoryBySigner(signerId: string, filters?: NotificationHistoryFilters): Promise<PaginatedResponse<NotificationLog>>;
    /**
     * Lista notificações falhadas
     */
    getFailedNotifications(filters?: NotificationHistoryFilters): Promise<PaginatedResponse<NotificationLog>>;
    /**
     * Reenviar notificação falhada
     */
    retry(notificationId: string): Promise<void>;
}
//# sourceMappingURL=NotificationService.d.ts.map