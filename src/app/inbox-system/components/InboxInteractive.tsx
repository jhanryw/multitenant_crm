'use client';

import { useState, useEffect } from 'react';
import ConversationList from './ConversationList';
import MessageThread from './MessageThread';
import InboxFilters from './InboxFilters';

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

interface InboxInteractiveProps {
  userRole: 'manager' | 'seller';
}

export default function InboxInteractive({ userRole }: InboxInteractiveProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentTier, setCurrentTier] = useState<'general' | 'sector' | 'individual'>('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState('all');
  const [showMobileList, setShowMobileList] = useState(true);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const sectors = ['Vendas', 'Suporte', 'Financeiro', 'Atendimento'];

  const mockConversations: Contact[] = [
    {
      id: '1',
      name: 'Maria Silva',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      alt: 'Mulher jovem de cabelos castanhos sorrindo em ambiente profissional',
      platform: 'whatsapp',
      lastMessage: 'Olá, gostaria de saber mais sobre os produtos',
      timestamp: '10:30',
      unreadCount: 3,
      sector: 'Vendas',
      tags: ['Novo Lead', 'Interessado'],
      slaStatus: 'normal',
    },
    {
      id: '2',
      name: 'João Santos',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
      alt: 'Homem de negócios em terno azul com expressão confiante',
      platform: 'instagram',
      lastMessage: 'Preciso de ajuda com meu pedido',
      timestamp: '09:45',
      unreadCount: 1,
      sector: 'Suporte',
      tags: ['Urgente'],
      slaStatus: 'warning',
    },
    {
      id: '3',
      name: 'Ana Costa',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
      alt: 'Mulher profissional com óculos e blazer preto em escritório moderno',
      platform: 'whatsapp',
      lastMessage: 'Quando posso receber o orçamento?',
      timestamp: '08:20',
      unreadCount: 5,
      sector: 'Vendas',
      tags: ['Orçamento', 'Follow-up'],
      slaStatus: 'critical',
    },
    {
      id: '4',
      name: 'Pedro Oliveira',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
      alt: 'Homem jovem de camisa branca sorrindo em ambiente corporativo',
      platform: 'whatsapp',
      lastMessage: 'Obrigado pelo atendimento!',
      timestamp: 'Ontem',
      unreadCount: 0,
      sector: 'Atendimento',
      tags: ['Satisfeito'],
      slaStatus: 'normal',
    },
    {
      id: '5',
      name: 'Carla Mendes',
      avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg',
      alt: 'Mulher executiva com cabelo loiro em ambiente de trabalho',
      platform: 'instagram',
      lastMessage: 'Vi seus produtos no Instagram',
      timestamp: 'Ontem',
      unreadCount: 2,
      sector: 'Vendas',
      tags: ['Instagram', 'Novo Lead'],
      slaStatus: 'normal',
    },
  ];

  const mockMessages: Message[] = [
    {
      id: '1',
      sender: 'customer',
      content: 'Olá, gostaria de saber mais sobre os produtos',
      timestamp: '10:25',
      status: 'read',
      type: 'text',
    },
    {
      id: '2',
      sender: 'agent',
      content: 'Olá Maria! Claro, ficarei feliz em ajudar. Temos uma linha completa de produtos. Qual categoria te interessa mais?',
      timestamp: '10:27',
      status: 'read',
      type: 'text',
    },
    {
      id: '3',
      sender: 'customer',
      content: 'Estou procurando produtos para revenda',
      timestamp: '10:28',
      status: 'read',
      type: 'text',
    },
    {
      id: '4',
      sender: 'agent',
      content: 'Perfeito! Temos condições especiais para revendedores. Posso te enviar nosso catálogo completo com preços atacado?',
      timestamp: '10:30',
      status: 'delivered',
      type: 'text',
    },
  ];

  const handleSendMessage = (message: string) => {
    console.log('Sending message:', message);
  };

  const handleLoadMore = () => {
    console.log('Loading more messages');
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id);
    setShowMobileList(false);
  };

  const selectedContact = mockConversations.find((c) => c.id === selectedConversation);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-caption text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-1">
        {/* Left Panel - Conversation List */}
        <div className="w-96 flex flex-col">
          <InboxFilters
            currentTier={currentTier}
            onTierChange={setCurrentTier}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            userRole={userRole}
            selectedSector={selectedSector}
            onSectorChange={setSelectedSector}
            sectors={sectors}
          />
          <ConversationList
            conversations={mockConversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            currentTier={currentTier}
            searchQuery={searchQuery}
          />
        </div>

        {/* Right Panel - Message Thread */}
        <div className="flex-1">
          <MessageThread
            conversationId={selectedConversation}
            contactName={selectedContact?.name || ''}
            contactAvatar={selectedContact?.avatar || ''}
            contactAlt={selectedContact?.alt || ''}
            platform={selectedContact?.platform || 'whatsapp'}
            messages={selectedConversation ? mockMessages : []}
            onSendMessage={handleSendMessage}
            onLoadMore={handleLoadMore}
            hasMore={true}
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex-1 flex flex-col">
        {showMobileList ? (
          <div className="flex flex-col h-full">
            <InboxFilters
              currentTier={currentTier}
              onTierChange={setCurrentTier}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              userRole={userRole}
              selectedSector={selectedSector}
              onSectorChange={setSelectedSector}
              sectors={sectors}
            />
            <ConversationList
              conversations={mockConversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              currentTier={currentTier}
              searchQuery={searchQuery}
            />
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-shrink-0 h-16 px-4 border-b border-border bg-card flex items-center">
              <button
                onClick={() => setShowMobileList(true)}
                className="p-2 rounded-lg hover:bg-muted transition-smooth focus-ring"
              >
                <svg
                  className="w-6 h-6 text-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <span className="ml-3 text-base font-heading font-semibold text-foreground">
                Voltar
              </span>
            </div>
            <MessageThread
              conversationId={selectedConversation}
              contactName={selectedContact?.name || ''}
              contactAvatar={selectedContact?.avatar || ''}
              contactAlt={selectedContact?.alt || ''}
              platform={selectedContact?.platform || 'whatsapp'}
              messages={selectedConversation ? mockMessages : []}
              onSendMessage={handleSendMessage}
              onLoadMore={handleLoadMore}
              hasMore={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}