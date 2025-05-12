import React, { useState } from 'react';
import { Layout, Menu, Button, Typography, Divider, Badge, message, Popconfirm } from 'antd';
import { 
  PlusOutlined, 
  MessageOutlined, 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  FileTextOutlined,
  FolderOutlined,
  StarOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Chat, FlashcardCollection } from '../context/ChatContext';

const { Sider } = Layout;
const { Title, Text } = Typography;

interface SidebarProps {
  chats: Chat[];
  collections?: FlashcardCollection[];
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onSaveCollection?: (chatId: string) => void;
  onCollectionSelect?: (collectionId: string) => void;
  onDeleteChat?: (chatId: string) => void;
  onDeleteCollection?: (collectionId: string) => void;
  selectedChatId: string | null;
  selectedCollectionId?: string | null;
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  headerContent?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  chats, 
  collections = [],
  onChatSelect, 
  onNewChat,
  onCollectionSelect = () => {},
  onDeleteChat = () => {},
  onDeleteCollection = () => {},
  selectedChatId,
  selectedCollectionId = null,
  collapsed,
  onCollapse,
  headerContent
}) => {
  // State to track which section is expanded
  const [expandedSections, setExpandedSections] = useState({
    chats: true,
    collections: true
  });

  const toggleSection = (section: 'chats' | 'collections') => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };


  const renderChatItem = (chat: Chat) => {
    const isSelected = chat.id === selectedChatId;
    
    return (
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          padding: '8px',
          background: isSelected ? '#1f1f1f' : 'transparent',
          borderRadius: '4px',
          marginBottom: '4px',
          cursor: 'pointer'
        }}
        onClick={() => onChatSelect(chat.id)}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', overflow: 'hidden', flex: 1 }}>
          <MessageOutlined style={{ fontSize: '16px', marginRight: '8px', marginTop: '3px', color: isSelected ? '#1677ff' : '#9CA3AF' }} />
          <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Text ellipsis style={{ color: 'white', fontSize: '14px' }}>{chat.title}</Text>
            <Text style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '2px' }}>{chat.date}</Text>
          </div>
        </div>
        <Popconfirm
          title="Delete this chat?"
          description="This will delete the chat and all its flashcards. This cannot be undone."
          onConfirm={(e) => {
            e?.stopPropagation();
            onDeleteChat(chat.id);
            message.success('Chat deleted successfully');
          }}
          onCancel={(e) => e?.stopPropagation()}
          okText="Yes"
          cancelText="No"
        >
          <Button 
            type="text" 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              color: '#ff4d4f', 
              opacity: 0.7, 
              visibility: isSelected ? 'visible' : 'hidden'
            }}
          />
        </Popconfirm>
      </div>
    );
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={280}
      collapsedWidth={80}
      trigger={null}
      style={{
        background: '#1a1a1a',
        borderRight: '1px solid #303030',
        overflow: 'auto',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        height: '100%'
      }}
    >
      {headerContent ? (
        <div style={{ padding: collapsed ? '10px 0' : '10px' }}>
          {headerContent}
        </div>
      ) : (
        <div 
          style={{ 
            padding: collapsed ? '20px 0' : '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: collapsed ? 'center' : 'space-between'
          }}
        >
          {!collapsed && (
            <Title level={4} style={{ color: 'white', margin: 0 }}>
              GST Flashcards
            </Title>
          )}
          {collapsed && (
            <MessageOutlined style={{ fontSize: '24px', color: 'white' }} />
          )}
        </div>
      )}
      
      <div style={{ position: 'absolute', top: collapsed ? '15px' : '20px', right: '16px' }}>
        <Button 
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => onCollapse(!collapsed)}
          style={{ color: 'white', fontSize: '16px' }}
        />
      </div>

      <Divider style={{ margin: '0 0 16px 0', borderColor: '#303030' }} />
      
      {/* New Chat Button */}
      <div style={{ padding: '0 16px', marginBottom: '20px' }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={onNewChat}
          style={{ 
            width: '100%', 
            background: '#1677ff', 
            borderColor: '#1677ff',
            height: '44px',
            fontSize: '16px'
          }}
        >
          {!collapsed && 'New Chat'}
        </Button>
      </div>
      
      {/* Chat History Section */}
      {!collapsed && (
        <div 
          className="sidebar-section-title"
          onClick={() => toggleSection('chats')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '8px 16px', 
            cursor: 'pointer',
            background: '#222',
            marginBottom: '4px'
          }}
        >
          <MessageOutlined style={{ marginRight: '8px', color: '#9CA3AF' }} />
          <Text style={{ color: '#9CA3AF', flex: 1 }}>Recent Chats</Text>
          <Text style={{ color: '#9CA3AF' }}>{expandedSections.chats ? '▼' : '►'}</Text>
        </div>
      )}
      
      {(collapsed || expandedSections.chats) && (
        <div style={{ maxHeight: '30vh', overflowY: 'auto', padding: '0 8px' }}>
          {collapsed ? (
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={selectedChatId ? [selectedChatId] : []}
              style={{ 
                background: 'transparent', 
                border: 'none'
              }}
              items={chats.map((chat) => ({
                key: chat.id,
                icon: <MessageOutlined style={{ fontSize: '16px' }} />,
                onClick: () => onChatSelect(chat.id)
              }))}
            />
          ) : (
            chats.map(chat => renderChatItem(chat))
          )}
        </div>
      )}
      
      {chats.length === 0 && !collapsed && expandedSections.chats && (
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Text style={{ color: '#9CA3AF' }}>No chats yet</Text>
        </div>
      )}

      {/* Collections Section */}
      {!collapsed && (
        <div 
          className="sidebar-section-title"
          onClick={() => toggleSection('collections')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '8px 16px', 
            cursor: 'pointer',
            background: '#222',
            marginTop: '16px',
            marginBottom: '4px'
          }}
        >
          <FolderOutlined style={{ marginRight: '8px', color: '#9CA3AF' }} />
          <Text style={{ color: '#9CA3AF', flex: 1 }}>Collections</Text>
          <Text style={{ color: '#9CA3AF' }}>{expandedSections.collections ? '▼' : '►'}</Text>
        </div>
      )}
      
      {(collapsed || expandedSections.collections) && (
        <div style={{ maxHeight: '30vh', overflowY: 'auto', padding: '0 8px' }}>
          {collapsed ? (
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={selectedCollectionId ? [selectedCollectionId] : []}
              style={{ 
                background: 'transparent', 
                border: 'none'
              }}
              items={collections.map((collection) => ({
                key: collection.id,
                icon: <FileTextOutlined style={{ fontSize: '16px' }} />,
                onClick: () => onCollectionSelect(collection.id)
              }))}
            />
          ) : (
            collections.map(collection => {
              const isSelected = collection.id === selectedCollectionId;
              return (
                <div 
                  key={collection.id}
                  style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '10px 8px',
                    background: isSelected ? '#1f1f1f' : 'transparent',
                    borderRadius: '4px',
                    marginBottom: '6px',
                    cursor: 'pointer'
                  }}
                  onClick={() => onCollectionSelect(collection.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', overflow: 'hidden', flex: 1 }}>
                    <FileTextOutlined style={{ 
                      fontSize: '16px', 
                      marginRight: '8px',
                      marginTop: '3px',
                      color: isSelected ? '#1677ff' : '#9CA3AF' 
                    }} />
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      overflow: 'hidden'
                    }}>
                      <Text ellipsis style={{ 
                        color: 'white', 
                        fontSize: '14px', 
                        marginBottom: '4px' 
                      }}>
                        {collection.title}
                      </Text>
                      <Text style={{ 
                        color: '#9CA3AF', 
                        fontSize: '12px' 
                      }}>
                        {collection.count} cards
                      </Text>
                      <Text style={{ 
                        color: '#9CA3AF', 
                        fontSize: '12px', 
                        marginTop: '4px' 
                      }}>
                        {collection.date}
                      </Text>
                    </div>
                  </div>
                  <Popconfirm
                    title="Delete this collection?"
                    description="This will delete the collection and all its flashcards. This cannot be undone."
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      onDeleteCollection(collection.id);
                      message.success('Collection deleted successfully');
                    }}
                    onCancel={(e) => e?.stopPropagation()}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button 
                      type="text" 
                      icon={<DeleteOutlined />} 
                      size="small"
                      onClick={(e) => e.stopPropagation()} 
                      style={{ 
                        color: '#ff4d4f', 
                        opacity: 0.7, 
                        visibility: isSelected ? 'visible' : 'hidden'
                      }}
                    />
                  </Popconfirm>
                </div>
              );
            })
          )}
        </div>
      )}
      
      {collections.length === 0 && !collapsed && expandedSections.collections && (
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Text style={{ color: '#9CA3AF' }}>No collections saved</Text>
        </div>
      )}
      
      <div style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, padding: '0 16px', textAlign: 'center' }}>
        {!collapsed && (
          <Badge count={<StarOutlined style={{ color: '#1677ff' }} />} offset={[-5, 5]}>
            <Text style={{ color: '#6B7280', fontSize: '12px' }}>
              AI Flashcard Generator
            </Text>
          </Badge>
        )}
      </div>
    </Sider>
  );
};

export default Sidebar; 