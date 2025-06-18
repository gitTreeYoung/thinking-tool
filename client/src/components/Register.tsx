import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, BulbOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const [form] = Form.useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (values: { username: string; email: string; password: string }) => {
    setError('');
    setLoading(true);

    try {
      await register(values);
    } catch (err: any) {
      console.error('注册错误:', err);
      setError(err.response?.data?.message || err.message || '注册失败，请检查网络连接');
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
            注册账号
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            创建你的思考空间
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
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="请输入邮箱地址"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码长度至少6位' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码（至少6位）"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不匹配'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请再次输入密码"
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
              {loading ? '注册中...' : '注册'}
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">已有账号？</Text>
            <Button 
              type="link" 
              onClick={onSwitchToLogin}
              style={{ padding: '0 8px', fontWeight: 500 }}
            >
              立即登录
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;