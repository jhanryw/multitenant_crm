'use client';


import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface Contact {
  id: string;
  name: string;
  avatar: string;
  alt: string;
  platform: 'whatsapp' | 'instagram';
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  sector: string;
  tags: string[];
  slaStatus: 'normal' | 'warning' | 'critical';
}

interface ConversationListProps {
  conversations: Contact[];
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
  currentTier: 'general' | 'sector' | 'individual';
  searchQuery: string;
}

export default function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  currentTier,
  searchQuery,
}: ConversationListProps) {
  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSLAColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-error';
      case 'warning':
        return 'bg-warning';
      default:
        return 'bg-success';
    }
  };

  const getPlatformIcon = (platform: string) => {
    return platform === 'whatsapp' ? 'ChatBubbleLeftRightIcon' : 'PhotoIcon';
  };

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            Conversas
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-caption text-muted-foreground">
              {currentTier === 'general' && 'Geral'}
              {currentTier === 'sector' && 'Setor'}
              {currentTier === 'individual' && 'Individual'}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="font-caption text-muted-foreground">
              {filteredConversations.filter((c) => c.unreadCount > 0).length} não lidas
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-error" />
            <span className="font-caption text-muted-foreground">
              {filteredConversations.filter((c) => c.slaStatus === 'critical').length} críticas
            </span>
          </div>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto scrollbar-custom">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Icon name="InboxIcon" size={48} className="text-muted-foreground mb-4" />
            <p className="text-sm font-caption text-muted-foreground">
              Nenhuma conversa encontrada
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full p-4 text-left transition-smooth hover:bg-muted ${
                  selectedConversation === conversation.id ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                      <AppImage
                        src={conversation.avatar}
                        alt={conversation.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-card rounded-full flex items-center justify-center">
                      <Icon
                        name={getPlatformIcon(conversation.platform) as any}
                        size={12}
                        className={
                          conversation.platform === 'whatsapp' ?'text-success' :'text-accent'
                        }
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-sm font-medium text-foreground truncate">
                        {conversation.name}
                      </h3>
                      <span className="text-xs font-caption text-muted-foreground flex-shrink-0 ml-2">
                        {conversation.timestamp}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground truncate mb-2">
                      {conversation.lastMessage}
                    </p>

                    {/* Tags and Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {conversation.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs font-caption px-2 py-0.5 rounded bg-primary/10 text-primary"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {conversation.unreadCount > 0 && (
                          <span className="w-5 h-5 bg-primary text-primary-foreground text-xs font-caption font-medium rounded-full flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                        <div
                          className={`w-2 h-2 rounded-full ${getSLAColor(
                            conversation.slaStatus
                          )}`}
                          title={`SLA: ${conversation.slaStatus}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}