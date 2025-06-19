import React, { useState, useEffect } from 'react';
import './ThinkingInterface.css';
import { 
  Layout, 
  Card, 
  Button, 
  Input, 
  Typography, 
  Space, 
  Spin,
  Empty,
  message,
  Row,
  Col,
  Select
} from 'antd';
import RichTextEditor from './RichTextEditor';
import MDEditor from '@uiw/react-md-editor';
import { 
  LeftOutlined, 
  RightOutlined,
  AudioOutlined,
  SaveOutlined,
  BulbOutlined,
  EditOutlined,
  CalendarOutlined,
  LogoutOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
  FilterOutlined
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

interface ThinkingInterfaceProps {
  onNavigateToAdmin?: () => void;
}

const ThinkingInterface: React.FC<ThinkingInterfaceProps> = ({ onNavigateToAdmin }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [thoughts, setThoughts] = useState<ThoughtEntry[]>([]);
  const [currentThought, setCurrentThought] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingThought, setEditingThought] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const { logout, user } = useAuth();

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      loadThoughts(questions[currentQuestionIndex].id);
    }
  }, [currentQuestionIndex, questions]);

  // 处理分类变化
  useEffect(() => {
    filterQuestionsByCategory();
  }, [selectedCategory, allQuestions]);

  const filterQuestionsByCategory = () => {
    if (selectedCategory === '全部') {
      setQuestions(allQuestions);
    } else {
      const filtered = allQuestions.filter(q => q.category === selectedCategory);
      setQuestions(filtered);
    }
    setCurrentQuestionIndex(0);
  };

  // 获取所有分类
  const getCategories = () => {
    const categories = ['全部', ...new Set(allQuestions.map(q => q.category).filter(Boolean))];
    return categories;
  };

  // 添加全局快捷键支持
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 检查是否在输入框中，如果是则不响应快捷键
      const target = event.target as HTMLElement;
      const isInInput = target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.isContentEditable;
      
      if (isInInput) return;

      // Cmd + ← : 上一个问题
      if ((event.metaKey || event.ctrlKey) && event.key === 'ArrowLeft') {
        event.preventDefault();
        previousQuestion();
        return;
      }

      // Cmd + → : 下一个问题
      if ((event.metaKey || event.ctrlKey) && event.key === 'ArrowRight') {
        event.preventDefault();
        nextQuestion();
        return;
      }

      // Cmd + R : 随机问题
      if ((event.metaKey || event.ctrlKey) && event.key === 'r') {
        event.preventDefault();
        randomQuestion();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentQuestionIndex, questions.length]);

  const loadQuestions = async () => {
    try {
      const data = await questionsAPI.getAll();
      setAllQuestions(data);
      setQuestions(data); // 默认显示全部问题
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
      
      const newThought = await thoughtsAPI.create({
        questionId,
        content: currentThought,
      });
      
      console.log('Thought saved:', newThought);
      
      // 重新加载思考历史
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

  const saveAndNextThought = async () => {
    if (!currentThought.trim()) {
      message.warning('请输入思考内容');
      return;
    }

    setSaving(true);
    try {
      const questionId = questions[currentQuestionIndex].id;
      
      const newThought = await thoughtsAPI.create({
        questionId,
        content: currentThought,
      });
      
      console.log('Thought saved:', newThought);
      
      // 重新加载思考历史
      await loadThoughts(questionId);
      setCurrentThought('');
      
      // 跳转到下一题
      nextQuestion();
      
      message.success('思考已保存，已跳转到下一题');
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

  const randomQuestion = () => {
    const randomIndex = Math.floor(Math.random() * questions.length);
    setCurrentQuestionIndex(randomIndex);
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'zh-CN';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentThought(prev => prev + transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        message.error('语音识别出错');
      };

      recognition.start();

      setTimeout(() => {
        recognition.stop();
      }, 10000);
    } else {
      message.error('浏览器不支持语音识别功能');
    }
  };

  const startEditThought = (thought: ThoughtEntry) => {
    setEditingThought(thought.id);
    setEditingContent(thought.content);
  };

  const cancelEditThought = () => {
    setEditingThought(null);
    setEditingContent('');
  };

  const saveEditThought = async (thoughtId: string) => {
    if (!editingContent.trim()) {
      message.warning('请输入思考内容');
      return;
    }

    try {
      await thoughtsAPI.update(thoughtId, editingContent);
      await loadThoughts(questions[currentQuestionIndex].id);
      setEditingThought(null);
      setEditingContent('');
      message.success('修改保存成功');
    } catch (error) {
      console.error('Failed to update thought:', error);
      message.error('修改保存失败');
    }
  };

  const deleteThought = async (thoughtId: string) => {
    try {
      await thoughtsAPI.delete(thoughtId);
      await loadThoughts(questions[currentQuestionIndex].id);
      message.success('删除成功');
    } catch (error) {
      console.error('Failed to delete thought:', error);
      message.error('删除失败');
    }
  };

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
    <Layout style={{ minHeight: '100vh', background: '#fafafa' }}>
      <Header className="mobile-header" style={{ 
        background: 'rgba(255, 255, 255, 0.8)', 
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '12px',
            background: 'rgba(0, 122, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            marginRight: 12,
            flexShrink: 0
          }}>
            <BulbOutlined style={{ fontSize: 20, color: '#007AFF' }} />
          </div>
          <Title level={3} style={{ 
            margin: 0, 
            color: '#1d1d1f', 
            fontWeight: 600,
            whiteSpace: 'nowrap',
            marginRight: 24
          }}>
            思考工具
          </Title>
          
          <Space size={16}>
            <Space size={8}>
              <FilterOutlined style={{ color: '#007AFF', fontSize: 16 }} />
              <Text style={{ fontWeight: 500, color: '#1d1d1f' }}>分类筛选：</Text>
            </Space>
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              style={{ 
                minWidth: 120,
                borderRadius: 12
              }}
              size="middle"
              options={getCategories().map(category => ({
                value: category,
                label: category
              }))}
            />
          </Space>
        </div>
        
        <Space>
          <Text>{user?.username}</Text>
          <Button 
            type="text" 
            onClick={() => {
              if (onNavigateToAdmin) {
                onNavigateToAdmin();
              } else {
                window.location.href = '/admin';
              }
            }}
          >
            管理后台
          </Button>
          <Button 
            type="text" 
            icon={<LogoutOutlined />}
            onClick={logout}
          >
            退出
          </Button>
        </Space>
      </Header>

      <Content className="mobile-content" style={{ 
        padding: '32px 16px', 
        maxWidth: '1200px', 
        margin: '0 auto', 
        width: '100%'
      }}>
        <Row gutter={[16, 24]}>
            {/* 左侧：问题卡片 + 思考历史卡片 */}
            <Col xs={24} lg={12}>
              {/* 问题卡片 */}
              <Card
                className="mobile-card"
                style={{ 
                  marginBottom: 24, 
                  borderRadius: 20,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)'
                }}
                bodyStyle={{ padding: '32px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                  <Button 
                    icon={<LeftOutlined />} 
                    onClick={previousQuestion}
                    type="text"
                    size="large"
                    className="nav-button"
                    style={{
                      borderRadius: '12px',
                      width: '48px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0, 0, 0, 0.04)',
                      transition: 'all 0.2s ease'
                    }}
                  />
                  <Space direction="vertical" align="center" size={8}>
                    <Text strong style={{ fontSize: '16px', color: '#1d1d1f' }}>{currentQuestionIndex + 1} / {questions.length}</Text>
                    <Button 
                      icon={<ReloadOutlined />}
                      onClick={randomQuestion}
                      type="text"
                      size="middle"
                      className="random-button"
                      style={{
                        borderRadius: '20px',
                        padding: '4px 16px',
                        background: 'rgba(0, 122, 255, 0.1)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        color: '#007AFF',
                        border: '1px solid rgba(0, 122, 255, 0.2)',
                        fontWeight: 600,
                        boxShadow: '0 2px 8px rgba(0, 122, 255, 0.1)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      随机问题
                    </Button>
                  </Space>
                  <Button 
                    icon={<RightOutlined />} 
                    onClick={nextQuestion}
                    type="text"
                    size="large"
                    className="nav-button"
                    style={{
                      borderRadius: '12px',
                      width: '48px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0, 0, 0, 0.04)',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <Title level={2} style={{ marginBottom: 16, color: '#1d1d1f', fontWeight: 600, lineHeight: 1.2 }}>
                    {currentQuestion.title}
                  </Title>
                  {currentQuestion.description && (
                    <Paragraph style={{ fontSize: 17, color: '#86868b', lineHeight: 1.5, margin: 0 }}>
                      {currentQuestion.description}
                    </Paragraph>
                  )}
                </div>
              </Card>

              {/* 思考历史卡片 */}
              <Card
                className="mobile-card"
                title={
                  <Space size={8}>
                    <CalendarOutlined style={{ color: '#007AFF' }} />
                    <span style={{ fontWeight: 600, color: '#1d1d1f' }}>思考历史 ({thoughts.length})</span>
                  </Space>
                }
                style={{ 
                  borderRadius: 20,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                  border: 'none',
                  height: 'fit-content',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)'
                }}
                bodyStyle={{ padding: '24px' }}
              >
                {thoughts.length === 0 ? (
                  <Empty 
                    description="还没有思考记录，快来记录第一个想法吧！"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '4px' }}>
                    <Space direction="vertical" style={{ width: '100%' }} size={16}>
                      {thoughts.map((thought, index) => (
                        <div key={thought.id} className="thought-card">
                          <Card
                            size="small"
                            style={{ 
                              borderRadius: 16,
                              backgroundColor: index === 0 ? 'rgba(0, 122, 255, 0.08)' : 'rgba(255, 255, 255, 0.8)',
                              border: index === 0 ? '1px solid rgba(0, 122, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.06)',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                              transition: 'all 0.2s ease',
                              backdropFilter: 'blur(10px)',
                              WebkitBackdropFilter: 'blur(10px)'
                            }}
                            bodyStyle={{ padding: '16px 20px' }}
                          >
                            <div style={{ position: 'relative' }}>
                              {editingThought === thought.id ? (
                                <>
                                  <RichTextEditor
                                    value={editingContent}
                                    onChange={setEditingContent}
                                    onSave={() => saveEditThought(thought.id)}
                                    placeholder="修改思考内容..."
                                    style={{ 
                                      marginBottom: 12,
                                      borderRadius: 12
                                    }}
                                  />
                                  <Space size={8}>
                                    <Button 
                                      type="primary"
                                      size="small" 
                                      icon={<CheckOutlined />}
                                      onClick={() => saveEditThought(thought.id)}
                                      style={{
                                        borderRadius: 8,
                                        background: '#34C759',
                                        border: 'none',
                                        fontSize: '12px',
                                        fontWeight: 500
                                      }}
                                    >
                                      保存
                                    </Button>
                                    <Button 
                                      size="small" 
                                      icon={<CloseOutlined />}
                                      onClick={cancelEditThought}
                                      style={{
                                        borderRadius: 8,
                                        border: '1px solid rgba(0, 0, 0, 0.08)',
                                        fontSize: '12px'
                                      }}
                                    >
                                      取消
                                    </Button>
                                  </Space>
                                </>
                              ) : (
                                <>
                                  <div style={{ 
                                    margin: 0, 
                                    marginBottom: 12,
                                    fontSize: 15,
                                    lineHeight: 1.6,
                                    color: '#1d1d1f'
                                  }}>
                                    <MDEditor.Markdown 
                                      source={thought.content} 
                                      style={{ 
                                        backgroundColor: 'transparent',
                                        color: 'inherit'
                                      }} 
                                    />
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text 
                                      type="secondary" 
                                      style={{ fontSize: 13, color: '#86868b' }}
                                    >
                                      <CalendarOutlined style={{ marginRight: 6 }} />
                                      {new Date(thought.updatedAt).toLocaleString('zh-CN', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </Text>
                                    <div 
                                      style={{ 
                                        opacity: 0,
                                        transition: 'opacity 0.2s ease'
                                      }}
                                      className="thought-actions"
                                    >
                                      <Space size={4}>
                                        <Button 
                                          type="text" 
                                          size="small" 
                                          icon={<EditOutlined />}
                                          onClick={() => startEditThought(thought)}
                                          className="action-button"
                                          style={{
                                            borderRadius: 8,
                                            width: '28px',
                                            height: '28px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'rgba(0, 122, 255, 0.1)',
                                            color: '#007AFF',
                                            border: 'none',
                                            transition: 'all 0.2s ease'
                                          }}
                                        />
                                        <Button 
                                          type="text" 
                                          size="small" 
                                          icon={<DeleteOutlined />}
                                          onClick={() => deleteThought(thought.id)}
                                          className="action-button"
                                          style={{
                                            borderRadius: 8,
                                            width: '28px',
                                            height: '28px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'rgba(255, 59, 48, 0.1)',
                                            color: '#FF3B30',
                                            border: 'none',
                                            transition: 'all 0.2s ease'
                                          }}
                                        />
                                      </Space>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </Card>
                        </div>
                      ))}
                    </Space>
                  </div>
                )}
              </Card>
            </Col>

            {/* 右侧：输入区域 */}
            <Col xs={24} lg={12}>
              <Card
                className="mobile-spacing"
                title={
                  <Space size={8}>
                    <EditOutlined style={{ color: '#007AFF' }} />
                    <span style={{ fontWeight: 600, color: '#1d1d1f' }}>记录思考</span>
                  </Space>
                }
                extra={
                  <Space size={12}>
                    <Button 
                      icon={<AudioOutlined />}
                      onClick={startVoiceInput}
                      style={{ 
                        borderRadius: 12,
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        background: 'rgba(255, 255, 255, 0.8)',
                        fontWeight: 500
                      }}
                    >
                      语音输入
                    </Button>
                    <Button 
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={saveThought}
                      loading={saving}
                      className="primary-button"
                      style={{ 
                        borderRadius: 12,
                        background: 'rgba(0, 122, 255, 0.1)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(0, 122, 255, 0.2)',
                        color: '#007AFF',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(0, 122, 255, 0.1)',
                        padding: '8px 20px',
                        height: 'auto',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {saving ? '保存中...' : '保存'}
                    </Button>
                  </Space>
                }
                style={{ 
                  borderRadius: 20,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  height: 'fit-content'
                }}
                bodyStyle={{ padding: '24px 32px 32px' }}
              >
                <RichTextEditor
                  value={currentThought}
                  onChange={setCurrentThought}
                  onSave={saveThought}
                  onSaveAndNext={saveAndNextThought}
                  placeholder="在这里记录你的思考..."
                  autoFocus={true}
                  style={{ 
                    borderRadius: 16,
                    background: 'rgba(255, 255, 255, 0.8)'
                  }}
                />
                
                {/* 快捷键提示和分类信息 */}
                <div style={{
                  marginTop: 16,
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(0, 122, 255, 0.04)',
                  border: '1px solid rgba(0, 122, 255, 0.1)'
                }}>
                  <div style={{ marginBottom: 8 }}>
                    <Text style={{ fontSize: 12, color: '#1d1d1f', fontWeight: 600 }}>
                      📂 当前分类：{selectedCategory} ({questions.length} 题)
                    </Text>
                  </div>
                  <Text style={{ fontSize: 12, color: '#86868b', fontWeight: 500 }}>
                    💡 快捷键：⌘ + ← 上一题  |  ⌘ + → 下一题  |  ⌘ + R 随机
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>
      </Content>
    </Layout>
  );
};

export default ThinkingInterface;