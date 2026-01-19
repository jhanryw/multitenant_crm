'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Icon from '@/components/ui/AppIcon';
import { whatsAppWebService, WhatsAppWebSession } from '@/services/whatsapp-web.service';

export default function WhatsAppWebConfig() {
  const [sessions, setSessions] = useState<WhatsAppWebSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const companyId = 'demo-company-id'; // Replace with actual company ID
      const sessionsData = await whatsAppWebService.getAllSessions(companyId);
      setSessions(sessionsData);
    } catch (error: any) {
      console.error('Error loading WhatsApp sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) return;

    try {
      setIsCreatingSession(true);
      const companyId = 'demo-company-id'; // Replace with actual company ID
      await whatsAppWebService.createSession({
        company_id: companyId,
        session_name: newSessionName
      });
      setShowNewSessionModal(false);
      setNewSessionName('');
      await loadSessions();
    } catch (error: any) {
      console.error('Error creating session:', error);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleGenerateQR = async (sessionId: string) => {
    try {
      const qrCode = `whatsapp://session/${sessionId}/${Date.now()}`;
      await whatsAppWebService.updateSessionQRCode(sessionId, qrCode);
      await loadSessions();
    } catch (error: any) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleDisconnect = async (sessionId: string) => {
    try {
      await whatsAppWebService.disconnectSession(sessionId);
      await loadSessions();
    } catch (error: any) {
      console.error('Error disconnecting session:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta sessão?')) return;

    try {
      await whatsAppWebService.deleteSession(sessionId);
      await loadSessions();
    } catch (error: any) {
      console.error('Error deleting session:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-50';
      case 'qr_pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'qr_pending':
        return 'Aguardando QR Code';
      case 'error':
        return 'Erro';
      default:
        return 'Desconectado';
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-card rounded-lg" />
        <div className="h-32 bg-card rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-semibold text-foreground">
            WhatsApp Web - QR Code
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure sua conexão WhatsApp Web sem usar a API oficial
          </p>
        </div>
        <button
          onClick={() => setShowNewSessionModal(true)}
          className="flex items-center gap-2 px-4 h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-caption font-medium transition-smooth focus-ring"
        >
          <Icon name="PlusIcon" size={18} />
          Nova Sessão
        </button>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <Icon name="ChatBubbleLeftRightIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            Nenhuma sessão WhatsApp configurada
          </p>
          <button
            onClick={() => setShowNewSessionModal(true)}
            className="text-primary hover:underline font-caption"
          >
            Criar primeira sessão
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-card rounded-lg border border-border p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-caption font-semibold text-foreground">
                    {session.session_name}
                  </h3>
                  {session.phone_number && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {session.phone_number}
                    </p>
                  )}
                </div>
                <span
                  className={`text-xs font-caption px-3 py-1 rounded-full ${getStatusColor(session.connection_status)}`}
                >
                  {getStatusLabel(session.connection_status)}
                </span>
              </div>

              {/* QR Code Display */}
              {session.qr_code && session.connection_status === 'qr_pending' && (
                <div className="flex justify-center p-4 bg-white rounded-lg mb-4">
                  <QRCodeSVG value={session.qr_code} size={200} />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {session.connection_status === 'disconnected' && (
                  <button
                    onClick={() => handleGenerateQR(session.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-caption transition-smooth focus-ring"
                  >
                    <Icon name="QrCodeIcon" size={18} />
                    Gerar QR Code
                  </button>
                )}

                {session.connection_status === 'connected' && (
                  <button
                    onClick={() => handleDisconnect(session.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 h-10 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 font-caption transition-smooth focus-ring"
                  >
                    <Icon name="LinkSlashIcon" size={18} />
                    Desconectar
                  </button>
                )}

                <button
                  onClick={() => handleDeleteSession(session.id)}
                  className="px-4 h-10 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 font-caption transition-smooth focus-ring"
                >
                  <Icon name="TrashIcon" size={18} />
                </button>
              </div>

              {session.last_connected_at && (
                <p className="text-xs text-muted-foreground mt-3">
                  Última conexão: {new Date(session.last_connected_at).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Session Modal */}
      {showNewSessionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-semibold text-foreground">
                Nova Sessão WhatsApp
              </h3>
              <button
                onClick={() => setShowNewSessionModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-smooth"
              >
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-caption font-medium text-foreground mb-2">
                  Nome da Sessão
                </label>
                <input
                  type="text"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="Ex: WhatsApp Principal"
                  className="w-full px-4 h-10 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewSessionModal(false)}
                  className="flex-1 px-4 h-10 rounded-lg border border-border text-foreground hover:bg-muted font-caption transition-smooth"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateSession}
                  disabled={isCreatingSession || !newSessionName.trim()}
                  className="flex-1 px-4 h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-caption font-medium transition-smooth focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingSession ? 'Criando...' : 'Criar Sessão'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}