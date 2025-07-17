import * as dotenv from 'dotenv';
import { SignatureClient, ApiError } from '../src';

// Carrega variáveis de ambiente
dotenv.config();

/**
 * Exemplo de monitoramento de eventos
 * 
 * Este exemplo demonstra:
 * 1. Consulta de eventos de um envelope específico
 * 2. Listagem de todos os eventos com filtros
 * 3. Monitoramento em tempo real de eventos
 * 4. Análise de estatísticas de eventos
 * 5. Tratamento de diferentes tipos de eventos
 */
async function eventMonitoringExample() {
  try {
    console.log('📊 Iniciando exemplo de monitoramento de eventos...\n');

    // Configuração do cliente
    const client = new SignatureClient({
      baseURL: process.env.API_BASE_URL || 'https://api.assinatura-digital.com/v1',
      apiToken: process.env.API_TOKEN || '',
    });

    // Teste de conectividade
    console.log('📡 Testando conectividade com a API...');
    const healthCheck = await client.healthCheck();
    console.log(`✅ API Status: ${healthCheck.status} (${healthCheck.timestamp})\n`);

    // 1. Consultar eventos de um envelope específico
    console.log('📋 Consultando eventos de envelope específico...');
    
    const envelopeId = process.env.EXAMPLE_ENVELOPE_ID || 'env_example123';
    
    try {
      const envelopeEvents = await client.getEnvelopeEvents(envelopeId, {
        sort_by: 'occurred_at',
        sort_order: 'desc',
        per_page: 20,
      });

      console.log(`📄 Encontrados ${envelopeEvents.length} eventos para o envelope ${envelopeId}:`);
      
      envelopeEvents.forEach((event, index) => {
        console.log(`  ${index + 1}. [${event.type}] ${event.description}`);
        console.log(`     Ocorrido em: ${new Date(event.occurred_at).toLocaleString('pt-BR')}`);
        console.log(`     Severidade: ${event.severity}`);
        if (event.metadata) {
          console.log(`     Metadados: ${JSON.stringify(event.metadata, null, 2)}`);
        }
        console.log('');
      });

    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        console.log('⚠️  Envelope não encontrado. Criando um envelope de exemplo...');
        
        // Criar envelope de exemplo para demonstração
        const envelope = await client.createEnvelope({
          name: 'Envelope de Exemplo para Monitoramento',
          description: 'Envelope criado para demonstrar monitoramento de eventos',
        });
        
        console.log(`✅ Envelope criado: ${envelope.id}`);
        console.log('📝 Use este ID para monitorar eventos: ' + envelope.id);
      } else {
        throw error;
      }
    }

    // 2. Listar todos os eventos com filtros
    console.log('\n📊 Listando eventos com filtros...');
    
    const allEvents = await client.listEvents({
      type: 'envelope.created',
      severity: 'info',
      page: 1,
      per_page: 10,
      sort_by: 'occurred_at',
      sort_order: 'desc',
    });

    console.log(`📈 Total de eventos encontrados: ${allEvents.meta?.total || 0}`);
    console.log(`📄 Página atual: ${allEvents.meta?.current_page || 1} de ${allEvents.meta?.total_pages || 1}`);
    
    if (allEvents.data && allEvents.data.length > 0) {
      console.log('\n🔍 Últimos eventos de criação de envelope:');
      allEvents.data.forEach((event, index) => {
        console.log(`  ${index + 1}. Envelope: ${event.envelope_id}`);
        console.log(`     Criado em: ${new Date(event.occurred_at).toLocaleString('pt-BR')}`);
        console.log(`     Usuário: ${event.user_id || 'Sistema'}`);
        console.log('');
      });
    }

    // 3. Monitoramento de diferentes tipos de eventos
    console.log('🔍 Analisando diferentes tipos de eventos...\n');
    
    const eventTypes = [
      'envelope.created',
      'envelope.activated',
      'document.added',
      'signer.added',
      'signature.completed',
      'envelope.completed',
    ];

    const eventStats: Record<string, number> = {};

    for (const eventType of eventTypes) {
      try {
        const events = await client.listEvents({
          type: eventType,
          per_page: 1, // Só queremos contar
        });
        
        eventStats[eventType] = events.meta?.total || 0;
        console.log(`📊 ${eventType}: ${eventStats[eventType]} eventos`);
        
      } catch (error) {
        console.log(`⚠️  Erro ao consultar eventos do tipo ${eventType}:`, error);
        eventStats[eventType] = 0;
      }
    }

    // 4. Análise de estatísticas
    console.log('\n📈 Análise de estatísticas de eventos:');
    
    const totalEvents = Object.values(eventStats).reduce((sum, count) => sum + count, 0);
    console.log(`📊 Total de eventos: ${totalEvents}`);
    
    if (totalEvents > 0) {
      console.log('\n📋 Distribuição por tipo:');
      Object.entries(eventStats).forEach(([type, count]) => {
        const percentage = ((count / totalEvents) * 100).toFixed(1);
        console.log(`  ${type}: ${count} (${percentage}%)`);
      });
    }

    // 5. Monitoramento de eventos recentes
    console.log('\n⏰ Consultando eventos das últimas 24 horas...');
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    try {
      const recentEvents = await client.listEvents({
        occurred_after: yesterday.toISOString(),
        sort_by: 'occurred_at',
        sort_order: 'desc',
        per_page: 50,
      });

      console.log(`🕐 Eventos das últimas 24h: ${recentEvents.data?.length || 0}`);
      
      if (recentEvents.data && recentEvents.data.length > 0) {
        // Agrupar por tipo
        const eventsByType: Record<string, number> = {};
        recentEvents.data.forEach(event => {
          eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
        });

        console.log('\n📊 Atividade recente por tipo:');
        Object.entries(eventsByType)
          .sort(([,a], [,b]) => b - a)
          .forEach(([type, count]) => {
            console.log(`  ${type}: ${count} eventos`);
          });

        // Mostrar eventos mais recentes
        console.log('\n🔔 Últimos 5 eventos:');
        recentEvents.data.slice(0, 5).forEach((event, index) => {
          const timeAgo = getTimeAgo(new Date(event.occurred_at));
          console.log(`  ${index + 1}. [${event.type}] ${event.description}`);
          console.log(`     ${timeAgo} - Envelope: ${event.envelope_id}`);
          console.log('');
        });
      }

    } catch (error) {
      console.log('⚠️  Erro ao consultar eventos recentes:', error);
    }

    // 6. Exemplo de webhook simulation (demonstração)
    console.log('🔗 Simulação de processamento de webhook...\n');
    
    const webhookPayload = {
      event_type: 'signature.completed',
      envelope_id: 'env_example123',
      signer_id: 'signer_example456',
      occurred_at: new Date().toISOString(),
      data: {
        signer_name: 'João da Silva',
        document_name: 'Contrato de Prestação de Serviços',
        signature_method: 'advanced_electronic_signature',
        authentication_methods: ['email_token', 'geolocation'],
      },
    };

    console.log('📨 Payload do webhook recebido:');
    console.log(JSON.stringify(webhookPayload, null, 2));
    
    // Processar webhook
    await processWebhookEvent(webhookPayload);

    console.log('\n✅ Exemplo de monitoramento de eventos concluído!');
    console.log('\n💡 Dicas para implementação:');
    console.log('   • Configure webhooks para receber eventos em tempo real');
    console.log('   • Implemente retry logic para consultas de eventos');
    console.log('   • Use filtros para otimizar consultas grandes');
    console.log('   • Monitore eventos de erro para detectar problemas');
    console.log('   • Mantenha logs locais para auditoria');

  } catch (error) {
    console.error('❌ Erro no exemplo de monitoramento de eventos:', error);
    
    if (error instanceof ApiError) {
      console.error(`   Status: ${error.status}`);
      console.error(`   Mensagem: ${error.message}`);
      if (error.errors) {
        console.error(`   Detalhes: ${error.errors.join(', ')}`);
      }
    }
    
    process.exit(1);
  }
}

/**
 * Função auxiliar para calcular tempo decorrido
 */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
  } else if (diffHours > 0) {
    return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''} atrás`;
  } else {
    return 'Agora mesmo';
  }
}

/**
 * Função para processar eventos de webhook
 */
async function processWebhookEvent(payload: any): Promise<void> {
  console.log(`🔄 Processando evento: ${payload.event_type}`);
  
  switch (payload.event_type) {
    case 'signature.completed':
      console.log(`✍️  Assinatura eletrônica avançada concluída por: ${payload.data.signer_name}`);
      console.log(`📄 Documento: ${payload.data.document_name}`);
      console.log(`🔐 Método: ${payload.data.signature_method}`);
      console.log(`🔒 Autenticação: ${payload.data.authentication_methods?.join(', ')}`);
      
      // Aqui você implementaria a lógica específica
      // Por exemplo: enviar notificação, atualizar banco de dados, etc.
      break;
      
    case 'envelope.completed':
      console.log('📋 Envelope totalmente concluído!');
      // Lógica para envelope concluído
      break;
      
    case 'envelope.expired':
      console.log('⏰ Envelope expirado');
      // Lógica para envelope expirado
      break;
      
    case 'signer.rejected':
      console.log('❌ Assinatura rejeitada');
      // Lógica para rejeição
      break;
      
    default:
      console.log(`ℹ️  Evento não tratado: ${payload.event_type}`);
  }
  
  console.log('✅ Evento processado com sucesso\n');
}

// Executar exemplo se chamado diretamente
if (require.main === module) {
  eventMonitoringExample().catch(console.error);
}

export { eventMonitoringExample };

