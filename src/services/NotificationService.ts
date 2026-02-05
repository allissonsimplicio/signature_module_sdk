import { AxiosInstance } from 'axios';
import {
  NotificationTemplate,
  NotificationLog,
  CreateNotificationTemplateDto,
  PreviewNotificationTemplateDto,
  NotificationHistoryFilters,
  NotificationTemplateFilters,
} from '../types/notification.types';
import { PaginatedResponse } from '../types/common.types';

/**
 * FASE 6: Serviço para Notificações Multi-Canal
 */
export class NotificationService {
  constructor(private http: AxiosInstance) {}

  // ========== Templates ==========

  /**
   * Cria template de notificação
   */
  async createTemplate(dto: CreateNotificationTemplateDto): Promise<NotificationTemplate> {
    const response = await this.http.post<NotificationTemplate>(
      '/api/v1/notification-templates',
      dto
    );
    return response.data;
  }

  /**
   * 🆕 PROBLEMA 3: Lista templates com suporte a filtros
   * @param filters - Filtros opcionais (channel, name)
   * @returns Lista de templates
   */
  async list(filters?: NotificationTemplateFilters): Promise<NotificationTemplate[]> {
    const params = new URLSearchParams();

    if (filters?.channel) {
      params.append('channel', filters.channel);
    }

    if (filters?.name) {
      params.append('name', filters.name);
    }

    const queryString = params.toString();
    const url = queryString
      ? `/api/v1/notification-templates?${queryString}`
      : '/api/v1/notification-templates';

    const response = await this.http.get<NotificationTemplate[]>(url);
    return response.data;
  }

  /**
   * Lista todos os templates
   * @deprecated Use list() ao invés deste método. findAllTemplates() será removido na v3.0
   * @see list
   */
  async findAllTemplates(): Promise<NotificationTemplate[]> {
    return this.list();
  }

  /**
   * Busca template por ID
   */
  async findTemplateById(id: string): Promise<NotificationTemplate> {
    const response = await this.http.get<NotificationTemplate>(
      `/api/v1/notification-templates/${id}`
    );
    return response.data;
  }

  /**
   * Preview de template com variáveis
   */
  async previewTemplate(
    templateId: string,
    dto: PreviewNotificationTemplateDto
  ): Promise<{ rendered: string }> {
    const response = await this.http.post<{ rendered: string }>(
      `/api/v1/notification-templates/${templateId}/preview`,
      dto
    );
    return response.data;
  }

  /**
   * Deleta template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    await this.http.delete(`/api/v1/notification-templates/${templateId}`);
  }

  // ========== Histórico de Notificações ==========

  /**
   * Lista histórico de notificações de um envelope
   */
  async getHistoryByEnvelope(
    envelopeId: string,
    filters?: NotificationHistoryFilters
  ): Promise<PaginatedResponse<NotificationLog>> {
    const response = await this.http.get<PaginatedResponse<NotificationLog>>(
      `/api/v1/notifications/history/envelope/${envelopeId}`,
      { params: filters }
    );
    return response.data;
  }

  /**
   * Lista histórico de notificações de um signatário
   */
  async getHistoryBySigner(
    signerId: string,
    filters?: NotificationHistoryFilters
  ): Promise<PaginatedResponse<NotificationLog>> {
    const response = await this.http.get<PaginatedResponse<NotificationLog>>(
      `/api/v1/notifications/history/signer/${signerId}`,
      { params: filters }
    );
    return response.data;
  }

  /**
   * Lista notificações falhadas
   */
  async getFailedNotifications(
    filters?: NotificationHistoryFilters
  ): Promise<PaginatedResponse<NotificationLog>> {
    const response = await this.http.get<PaginatedResponse<NotificationLog>>(
      '/api/v1/notifications/history/failed',
      { params: filters }
    );
    return response.data;
  }

  /**
   * Reenviar notificação falhada
   */
  async retry(notificationId: string): Promise<void> {
    await this.http.post(`/api/v1/notifications/${notificationId}/retry`);
  }
}
