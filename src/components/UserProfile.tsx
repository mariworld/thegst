import React from 'react';
import { Typography, Button, Card, Avatar, Space, Dropdown, Menu } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

interface UserProfileProps {
  collapsed?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ collapsed = false }) => {
  const { user, signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
  };

  // If sidebar is collapsed, show only the avatar with dropdown
  if (collapsed) {
    const menu = (
      <Menu
        items={[
          {
            key: '1',
            label: <span>{user?.email}</span>,
            disabled: true,
          },
          {
            key: '2',
            label: 'Sign Out',
            icon: <LogoutOutlined />,
            onClick: handleSignOut,
          },
        ]}
      />
    );

    return (
      <div className="user-profile-collapsed">
        <Dropdown overlay={menu} trigger={['click']} placement="topRight">
          <Avatar
            style={{ cursor: 'pointer', backgroundColor: '#1890ff' }}
            icon={<UserOutlined />}
            src={user?.user_metadata?.avatar_url}
          />
        </Dropdown>
      </div>
    );
  }

  // Full profile display for expanded sidebar
  return (
    <Card className="user-profile-card" bordered={false}>
      <Space direction="vertical" align="center" style={{ width: '100%' }}>
        <Avatar
          size={64}
          icon={<UserOutlined />}
          src={user?.user_metadata?.avatar_url}
          style={{ backgroundColor: '#1890ff' }}
        />
        <Title level={5} style={{ margin: '8px 0 0', textAlign: 'center' }}>
          {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
        </Title>
        <Text type="secondary" style={{ fontSize: '12px', textAlign: 'center' }}>
          {user?.email}
        </Text>
        <Button
          type="default"
          icon={<LogoutOutlined />}
          onClick={handleSignOut}
          size="small"
          style={{ marginTop: '8px' }}
        >
          Sign Out
        </Button>
      </Space>
    </Card>
  );
};

export default UserProfile; 