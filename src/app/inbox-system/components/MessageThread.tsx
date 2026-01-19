'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface Message {
  id: string;
  sender: 'customer' | 'agent';
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'audio';
  mediaUrl?: string;
  mediaAlt?: string;
}

interface MessageThreadProps {
  conversationId: string | null;
  contactName: string;
  contactAvatar: string;
  contactAlt: string;
  platform: 'whatsapp' | 'instagram';
  messages: Message[];
  onSendMessage: (message: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

export default function MessageThread({
  conversationId,
  contactName,
  contactAvatar,
  contactAlt,
  platform,
  messages,
  onSendMessage,
  onLoadMore,
  hasMore,
}: MessageThreadProps) {
  const [messageInput, setMessageInput] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const quickTemplates = [
    'Olá! Como posso ajudar?',
    'Obrigado pelo contato. Vou verificar e retorno em breve.',
    'Seu pedido foi recebido e está sendo processado.',
    'Estamos à disposição para qualquer dúvida.',
  ];

  const handleSend = () => {
    if (messageInput.trim()) {
      onSendMessage(messageInput);
      setMessageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'read':
        return 'CheckIcon';
      case 'delivered':
        return 'CheckIcon';
      default:
        return 'ClockIcon';
    }
  };

  if (!conversationId) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background">
        <Icon name="ChatBubbleLeftRightIcon" size={64} className="text-muted-foreground mb-4" />
        <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
          Selecione uma conversa
        </h3>
        <p className="text-sm font-caption text-muted-foreground text-center max-w-sm">
          Escolha uma conversa da lista para visualizar e responder mensagens
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex-shrink-0 h-20 px-6 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
              <AppImage
                src={contactAvatar}
                alt={contactAlt}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-card rounded-full flex items-center justify-center">
              <Icon
                name={platform === 'whatsapp' ? 'ChatBubbleLeftRightIcon' : 'PhotoIcon'}
                size={12}
                className={platform === 'whatsapp' ? 'text-success' : 'text-accent'}
              />
            </div>
          </div>
          <div>
            <h2 className="text-base font-heading font-semibold text-foreground">
              {contactName}
            </h2>
            <p className="text-sm font-caption text-muted-foreground">
              {platform === 'whatsapp' ? 'WhatsApp' : 'Instagram'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-lg hover:bg-muted transition-smooth focus-ring"
            title="Informações do contato"
          >
            <Icon name="InformationCircleIcon" size={20} className="text-muted-foreground" />
          </button>
          <button
            className="p-2 rounded-lg hover:bg-muted transition-smooth focus-ring"
            title="Mais opções"
          >
            <Icon name="EllipsisVerticalIcon" size={20} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-custom p-6">
        {hasMore && (
          <button
            onClick={onLoadMore}
            className="w-full py-2 text-sm font-caption text-primary hover:text-primary/80 transition-smooth mb-4"
          >
            Carregar mensagens anteriores
          </button>
        )}

        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] ${
                  message.sender === 'agent' ?'bg-primary text-primary-foreground' :'bg-card text-foreground border border-border'
                } rounded-lg p-4 shadow-warm-sm`}
              >
                {message.type === 'image' && message.mediaUrl && (
                  <div className="mb-2 rounded-lg overflow-hidden">
                    <AppImage
                      src={message.mediaUrl}
                      alt={message.mediaAlt || 'Imagem enviada na conversa'}
                      className="w-full h-auto"
                    />
                  </div>
                )}

                {message.type === 'audio' && (
                  <div className="flex items-center gap-3 mb-2">
                    <button className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon name="PlayIcon" size={20} className="text-primary" />
                    </button>
                    <div className="flex-1 h-1 bg-primary/20 rounded-full">
                      <div className="w-1/3 h-full bg-primary rounded-full" />
                    </div>
                    <span className="text-xs font-caption">0:45</span>
                  </div>
                )}

                <p className="text-sm font-caption whitespace-pre-wrap">{message.content}</p>

                <div className="flex items-center justify-end gap-2 mt-2">
                  <span className="text-xs font-caption opacity-70">{message.timestamp}</span>
                  {message.sender === 'agent' && (
                    <Icon
                      name={getStatusIcon(message.status) as any}
                      size={14}
                      className="opacity-70"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-border bg-card p-4">
        {/* Quick Templates */}
        {showTemplates && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-caption font-medium text-foreground">
                Respostas Rápidas
              </span>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-muted-foreground hover:text-foreground transition-smooth"
              >
                <Icon name="XMarkIcon" size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {quickTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setMessageInput(template);
                    setShowTemplates(false);
                  }}
                  className="text-left text-sm font-caption text-foreground p-2 rounded hover:bg-background transition-smooth"
                >
                  {template}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Controls */}
        <div className="flex items-end gap-2">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="p-3 rounded-lg hover:bg-muted transition-smooth focus-ring"
            title="Respostas rápidas"
          >
            <Icon name="BoltIcon" size={20} className="text-muted-foreground" />
          </button>

          <button
            className="p-3 rounded-lg hover:bg-muted transition-smooth focus-ring"
            title="Anexar arquivo"
          >
            <Icon name="PaperClipIcon" size={20} className="text-muted-foreground" />
          </button>

          <div className="flex-1 relative">
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              rows={1}
              className="w-full px-4 py-3 bg-muted border border-input rounded-lg text-sm font-caption text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-smooth resize-none"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!messageInput.trim()}
            className="p-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-smooth focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
            title="Enviar mensagem"
          >
            <Icon name="PaperAirplaneIcon" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}