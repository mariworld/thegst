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
  CloseOutlined,
  LeftOutlined
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
  mobileOpen?: boolean;
  isMobile?: boolean;
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
  headerContent,
  mobileOpen = false,
  isMobile = false
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
          padding: isMobile ? '10px' : '8px',
          background: isSelected ? '#1f1f1f' : 'transparent',
          borderRadius: '4px',
          marginBottom: isMobile ? '4px' : '4px',
          cursor: 'pointer'
        }}
        onClick={() => onChatSelect(chat.id)}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', overflow: 'hidden', flex: 1 }}>
          <MessageOutlined style={{ 
            fontSize: isMobile ? '16px' : '16px', 
            marginRight: '8px', 
            marginTop: '3px', 
            color: isSelected ? '#1677ff' : '#9CA3AF' 
          }} />
          <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Text ellipsis style={{ 
              color: 'white', 
              fontSize: isMobile ? '14px' : '14px'
            }}>
              {chat.title}
            </Text>
            <Text style={{ 
              color: '#9CA3AF', 
              fontSize: isMobile ? '12px' : '12px', 
              marginTop: '2px'
            }}>
              {chat.date}
            </Text>
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
            size={isMobile ? 'small' : 'small'}
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              color: '#ff4d4f', 
              opacity: 0.7, 
              visibility: isSelected || isMobile ? 'visible' : 'hidden'
            }}
          />
        </Popconfirm>
      </div>
    );
  };

  return (
    <Sider
      collapsible={!isMobile}
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={isMobile ? 280 : 280}
      collapsedWidth={80}
      trigger={null}
      style={{
        background: '#1a1a1a',
        borderRight: '1px solid #303030',
        overflow: 'auto',
        position: 'fixed',
        left: isMobile && !mobileOpen ? '-300px' : 0,
        top: 0,
        bottom: 0,
        zIndex: 1000,
        height: '100%',
        transition: 'left 0.3s ease',
        boxShadow: isMobile ? '2px 0 8px rgba(0, 0, 0, 0.3)' : 'none'
      }}
      className={mobileOpen ? 'mobile-open' : ''}
    >
      {/* Mobile-only close button */}
      {isMobile && (
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={() => onCollapse(!collapsed)}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            color: 'white',
            fontSize: '16px',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px 8px',
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '4px'
          }}
        >
          <span style={{ marginLeft: '4px', fontSize: '14px' }}>Close</span>
        </Button>
      )}
      
      {headerContent ? (
        <div style={{ padding: collapsed && !isMobile ? '10px 0' : '10px' }}>
          {headerContent}
        </div>
      ) : (
        <div 
          style={{ 
            padding: collapsed && !isMobile ? '20px 0' : '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: collapsed && !isMobile ? 'center' : 'space-between'
          }}
        >
          {(!collapsed || isMobile) && (
            <Title level={4} style={{ color: 'white', margin: 0 }}>
              GST Flashcards
            </Title>
          )}
          {collapsed && !isMobile && (
            <MessageOutlined style={{ fontSize: '24px', color: 'white' }} />
          )}
        </div>
      )}
      
      {!isMobile && (
        <div style={{ position: 'absolute', top: collapsed ? '15px' : '20px', right: '16px' }}>
          <Button 
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => onCollapse(!collapsed)}
            style={{ color: 'white', fontSize: '16px' }}
          />
        </div>
      )}

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
            height: isMobile ? '40px' : '44px',
            fontSize: isMobile ? '14px' : '16px'
          }}
        >
          {(!collapsed || isMobile) && 'New Chat'}
        </Button>
      </div>
      
      {/* Chat History Section */}
      {(!collapsed || isMobile) && (
        <div 
          className="sidebar-section-title"
          onClick={() => toggleSection('chats')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: isMobile ? '10px 16px' : '8px 16px', 
            cursor: 'pointer',
            background: '#222',
            marginBottom: '4px'
          }}
        >
          <MessageOutlined style={{ 
            marginRight: '8px', 
            color: '#9CA3AF',
            fontSize: isMobile ? '16px' : '16px'
          }} />
          <Text style={{ 
            color: '#9CA3AF', 
            flex: 1,
            fontSize: isMobile ? '14px' : '14px'
          }}>
            Recent Chats
          </Text>
          <Text style={{ color: '#9CA3AF', fontSize: isMobile ? '14px' : '14px' }}>
            {expandedSections.chats ? '▼' : '►'}
          </Text>
        </div>
      )}
      
      {/* List of chats */}
      {(collapsed || expandedSections.chats || isMobile) && (
        <div style={{ 
          maxHeight: isMobile ? '35vh' : '30vh', 
          overflowY: 'auto', 
          padding: '0 8px' 
        }}>
          {collapsed && !isMobile ? (
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
      
      {chats.length === 0 && (!collapsed || isMobile) && expandedSections.chats && (
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Text style={{ color: '#9CA3AF', fontSize: isMobile ? '14px' : '14px' }}>
            No chats yet
          </Text>
        </div>
      )}

      {/* Collections Section */}
      {(!collapsed || isMobile) && (
        <div 
          className="sidebar-section-title"
          onClick={() => toggleSection('collections')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: isMobile ? '10px 16px' : '8px 16px', 
            cursor: 'pointer',
            background: '#222',
            marginTop: '16px',
            marginBottom: '4px'
          }}
        >
          <FolderOutlined style={{ 
            marginRight: '8px', 
            color: '#9CA3AF',
            fontSize: isMobile ? '16px' : '16px'
          }} />
          <Text style={{ 
            color: '#9CA3AF', 
            flex: 1,
            fontSize: isMobile ? '14px' : '14px'
          }}>
            Collections
          </Text>
          <Text style={{ color: '#9CA3AF', fontSize: isMobile ? '14px' : '14px' }}>
            {expandedSections.collections ? '▼' : '►'}
          </Text>
        </div>
      )}
      
      {/* List of collections */}
      {(collapsed || expandedSections.collections || isMobile) && (
        <div style={{ 
          maxHeight: isMobile ? '35vh' : '30vh', 
          overflowY: 'auto', 
          padding: '0 8px'
        }}>
          {collapsed && !isMobile ? (
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
                    padding: isMobile ? '10px 8px' : '10px 8px',
                    background: isSelected ? '#1f1f1f' : 'transparent',
                    borderRadius: '4px',
                    marginBottom: isMobile ? '4px' : '6px',
                    cursor: 'pointer'
                  }}
                  onClick={() => onCollectionSelect(collection.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', overflow: 'hidden', flex: 1 }}>
                    <FileTextOutlined style={{ 
                      fontSize: isMobile ? '16px' : '16px', 
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
                        fontSize: isMobile ? '14px' : '14px', 
                        marginBottom: '4px' 
                      }}>
                        {collection.title}
                      </Text>
                      <Text style={{ 
                        color: '#9CA3AF', 
                        fontSize: isMobile ? '12px' : '12px' 
                      }}>
                        {collection.count} cards
                      </Text>
                      <Text style={{ 
                        color: '#9CA3AF', 
                        fontSize: isMobile ? '12px' : '12px', 
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
                      size={isMobile ? 'small' : 'small'}
                      onClick={(e) => e.stopPropagation()} 
                      style={{ 
                        color: '#ff4d4f', 
                        opacity: 0.7, 
                        visibility: isSelected || isMobile ? 'visible' : 'hidden'
                      }}
                    />
                  </Popconfirm>
                </div>
              );
            })
          )}
        </div>
      )}
      
      {collections.length === 0 && (!collapsed || isMobile) && expandedSections.collections && (
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Text style={{ color: '#9CA3AF', fontSize: isMobile ? '14px' : '14px' }}>No collections saved</Text>
        </div>
      )}
      
      {(!isMobile || !mobileOpen) && (
        <div style={{ 
          position: 'absolute', 
          bottom: '20px', 
          left: 0, 
          right: 0, 
          padding: '0 16px', 
          textAlign: 'center',
          backgroundColor: '#1a1a1a',
          paddingBottom: '8px' 
        }}>
          {(!collapsed || isMobile) && (
            <Badge count={<StarOutlined style={{ color: '#1677ff' }} />} offset={[-5, 5]}>
              <Text style={{ color: '#6B7280', fontSize: isMobile ? '12px' : '12px' }}>
                AI Flashcard Generator
              </Text>
            </Badge>
          )}
        </div>
      )}
    </Sider>
  );
};

export default Sidebar; 