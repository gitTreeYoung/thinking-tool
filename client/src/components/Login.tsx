import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined, BulbOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

interface LoginProps {
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const [form] = Form.useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (values: { username: string; password: string }) => {
    setError('');
    setLoading(true);

    try {
      await login(values);
    } catch (err: any) {
      console.error('登录错误:', err);
      setError(err.response?.data?.message || err.message || '登录失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 400,
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          border: 'none'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            marginBottom: 16
          }}>
            <BulbOutlined style={{ fontSize: 32, color: 'white' }} />
          </div>
          <Title level={2} style={{ margin: 0, color: '#1f2937' }}>
            思考工具
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            开始你的思考之旅
          </Text>
        </div>

        {error && (
          <Alert 
            message={error} 
            type="error" 
            style={{ marginBottom: 24 }}
            showIcon
          />
        )}

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="请输入用户名"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ 
                height: 48,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                fontSize: 16,
                fontWeight: 500
              }}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">还没有账号？</Text>
            <Button 
              type="link" 
              onClick={onSwitchToRegister}
              style={{ padding: '0 8px', fontWeight: 500 }}
            >
              立即注册
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;