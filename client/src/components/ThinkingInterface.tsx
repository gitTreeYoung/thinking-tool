import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Card, 
  Button, 
  Input, 
  Typography, 
  Space, 
  Avatar, 
  Dropdown, 
  Row,
  Col,
  Spin,
  Empty,
  message,
  Badge,
  Tag
} from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  LeftOutlined, 
  RightOutlined,
  AudioOutlined,
  SaveOutlined,
  BulbOutlined,
  EditOutlined,
  CalendarOutlined,
  TagsOutlined
} from '@ant-design/icons';
import { questionsAPI, thoughtsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface Question {
  id: string;
  title: string;
  description?: string;
  category?: string;
  createdAt: string;
}

interface ThoughtEntry {
  id: string;
  questionId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const ThinkingInterface: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [thoughts, setThoughts] = useState<ThoughtEntry[]>([]);
  const [currentThought, setCurrentThought] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { logout, user } = useAuth();

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      loadThoughts(questions[currentQuestionIndex].id);
    }
  }, [currentQuestionIndex, questions]);

  const loadQuestions = async () => {
    try {
      const data = await questionsAPI.getAll();
      setQuestions(data);
    } catch (error) {
      console.error('Failed to load questions:', error);
      message.error('加载问题失败');
    } finally {
      setLoading(false);
    }
  };

  const loadThoughts = async (questionId: string) => {
    try {
      const data = await thoughtsAPI.getByQuestion(questionId);
      setThoughts(data);
      setCurrentThought('');
    } catch (error) {
      console.error('Failed to load thoughts:', error);
    }
  };

  const saveThought = async () => {
    if (!currentThought.trim()) {
      message.warning('请输入思考内容');
      return;
    }

    setSaving(true);
    try {
      const questionId = questions[currentQuestionIndex].id;
      
      await thoughtsAPI.create({
        questionId,
        content: currentThought,
      });
      
      await loadThoughts(questionId);
      setCurrentThought('');
      message.success('思考保存成功');
    } catch (error) {
      console.error('Failed to save thought:', error);
      message.error('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCurrentQuestionIndex(0);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      setCurrentQuestionIndex(questions.length - 1);
    }
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'zh-CN';
      recognition.continuous = true;
      recognition.interimResults = true;

      setIsRecording(true);

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentThought(prev => prev + transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        message.error('语音识别出错');
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();

      setTimeout(() => {
        recognition.stop();
      }, 10000);
    } else {
      message.error('浏览器不支持语音识别功能');
    }
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: logout,
    },
  ];

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Empty description="暂无问题" />
        </Content>
      </Layout>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Space align="center">
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            marginRight: 12
          }}>
            <BulbOutlined style={{ fontSize: 20, color: 'white' }} />
          </div>
          <Title level={3} style={{ margin: 0, color: '#1f2937' }}>
            思考工具
          </Title>
        </Space>
        
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Button type="text" style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
            <Text>{user?.username}</Text>
          </Button>
        </Dropdown>
      </Header>

      <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <Row gutter={24}>
          {/* 问题卡片 */}
          <Col xs={24} lg={12}>
            <Card
              style={{ 
                marginBottom: 24, 
                borderRadius: 16,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: 'none'
              }}
              bodyStyle={{ padding: '32px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Button 
                  icon={<LeftOutlined />} 
                  onClick={previousQuestion}
                  type="text"
                  size="large"
                />
                <Badge 
                  count={`${currentQuestionIndex + 1} / ${questions.length}`}
                  style={{ backgroundColor: '#667eea' }}
                />
                <Button 
                  icon={<RightOutlined />} 
                  onClick={nextQuestion}
                  type="text"
                  size="large"
                />
              </div>
              
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                {currentQuestion.category && (
                  <Tag color="blue" style={{ marginBottom: 16 }}>
                    <TagsOutlined style={{ marginRight: 4 }} />
                    {currentQuestion.category}
                  </Tag>
                )}
                <Title level={2} style={{ marginBottom: 16, color: '#1f2937' }}>
                  {currentQuestion.title}
                </Title>
                {currentQuestion.description && (
                  <Paragraph style={{ fontSize: 16, color: '#6b7280' }}>
                    {currentQuestion.description}
                  </Paragraph>
                )}
              </div>
            </Card>

            {/* 输入区域 */}
            <Card
              title={
                <Space>
                  <EditOutlined />
                  <span>记录思考</span>
                </Space>
              }
              extra={
                <Space>
                  <Button 
                    icon={<AudioOutlined />}
                    onClick={startVoiceInput}
                    loading={isRecording}
                    style={{ borderRadius: 8 }}
                  >
                    {isRecording ? '录音中...' : '语音输入'}
                  </Button>
                  <Button 
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={saveThought}
                    loading={saving}
                    style={{ 
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none'
                    }}
                  >
                    {saving ? '保存中...' : '保存'}
                  </Button>
                </Space>
              }
              style={{ 
                borderRadius: 16,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: 'none'
              }}
            >
              <TextArea
                value={currentThought}
                onChange={(e) => setCurrentThought(e.target.value)}
                placeholder="在这里记录你的思考..."
                rows={8}
                style={{ 
                  borderRadius: 8,
                  fontSize: 16,
                  lineHeight: 1.6
                }}
              />
            </Card>
          </Col>

          {/* 思考历史卡片 */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <CalendarOutlined />
                  <span>思考历史</span>
                  <Badge count={thoughts.length} style={{ backgroundColor: '#52c41a' }} />
                </Space>
              }
              style={{ 
                borderRadius: 16,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: 'none',
                height: 'fit-content'
              }}
              bodyStyle={{ padding: thoughts.length === 0 ? '40px' : '16px' }}
            >
              {thoughts.length === 0 ? (
                <Empty 
                  description="还没有思考记录，快来记录第一个想法吧！"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  <Space direction="vertical" style={{ width: '100%' }} size={12}>
                    {thoughts.map((thought, index) => (
                      <Card
                        key={thought.id}
                        size="small"
                        style={{ 
                          borderRadius: 12,
                          backgroundColor: index === 0 ? '#f0f8ff' : '#fafafa',
                          border: index === 0 ? '2px solid #1890ff' : '1px solid #e8e8e8'
                        }}
                        bodyStyle={{ padding: '16px' }}
                      >
                        <Paragraph 
                          style={{ 
                            margin: 0, 
                            marginBottom: 8,
                            fontSize: 14,
                            lineHeight: 1.6,
                            color: '#262626'
                          }}
                        >
                          {thought.content}
                        </Paragraph>
                        <Text 
                          type="secondary" 
                          style={{ fontSize: 12 }}
                        >
                          <CalendarOutlined style={{ marginRight: 4 }} />
                          {new Date(thought.updatedAt).toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </Card>
                    ))}
                  </Space>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default ThinkingInterface;