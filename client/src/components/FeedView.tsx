import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Typography, Space, Empty, message, Input, Avatar, Divider, Layout } from 'antd';
import { EditOutlined, CalendarOutlined, CheckOutlined, CloseOutlined, PlusOutlined, SettingOutlined, LogoutOutlined, BulbOutlined } from '@ant-design/icons';
import MDEditor from '@uiw/react-md-editor';
import RichTextEditor from './RichTextEditor';
import { questionsAPI, thoughtsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { configService } from '../services/configService';

const { Header } = Layout;
const { Title, Text, Paragraph } = Typography;

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

interface QuestionWithThoughts extends Question {
  thoughts: ThoughtEntry[];
  isAddingThought?: boolean;
  newThoughtContent?: string;
}

const FeedView: React.FC = () => {
  const [feedData, setFeedData] = useState<QuestionWithThoughts[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [addingThoughts, setAddingThoughts] = useState<{ [key: string]: string }>({});
  const observerRef = useRef<IntersectionObserver>();
  const { user, logout } = useAuth();

  useEffect(() => {
    loadFeedData();
  }, []);

  const switchToSingleView = () => {
    configService.saveConfig({ viewMode: 'single' });
    window.location.reload(); // 简单的重新加载来切换视图
  };

  const loadFeedData = async (pageNum = 1, reset = true) => {
    try {
      setLoading(true);
      const questions = await questionsAPI.getAll();
      
      // 为每个问题加载思考历史
      const questionsWithThoughts = await Promise.all(
        questions.map(async (question) => {
          try {
            const thoughts = await thoughtsAPI.getByQuestion(question.id);
            return {
              ...question,
              thoughts: thoughts.slice(0, 3), // 只显示最新的3条思考
            };
          } catch (error) {
            return {
              ...question,
              thoughts: [],
            };
          }
        })
      );

      if (reset) {
        setFeedData(questionsWithThoughts);
      } else {
        setFeedData(prev => [...prev, ...questionsWithThoughts]);
      }
      
      // 模拟分页
      setHasMore(pageNum < 3);
    } catch (error) {
      console.error('Failed to load feed data:', error);
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddThought = (questionId: string) => {
    setFeedData(prev => prev.map(item => 
      item.id === questionId 
        ? { ...item, isAddingThought: true, newThoughtContent: '' }
        : item
    ));
  };

  const handleSaveThought = async (questionId: string) => {
    const question = feedData.find(q => q.id === questionId);
    const content = addingThoughts[questionId];
    
    if (!content?.trim()) {
      message.warning('请输入思考内容');
      return;
    }

    try {
      const newThought = await thoughtsAPI.create({
        questionId,
        content: content.trim(),
      });

      setFeedData(prev => prev.map(item => 
        item.id === questionId 
          ? { 
              ...item, 
              thoughts: [newThought, ...item.thoughts.slice(0, 2)],
              isAddingThought: false,
              newThoughtContent: ''
            }
          : item
      ));

      setAddingThoughts(prev => {
        const updated = { ...prev };
        delete updated[questionId];
        return updated;
      });

      message.success('思考保存成功');
    } catch (error) {
      console.error('Failed to save thought:', error);
      message.error('保存失败');
    }
  };

  const handleCancelAddThought = (questionId: string) => {
    setFeedData(prev => prev.map(item => 
      item.id === questionId 
        ? { ...item, isAddingThought: false, newThoughtContent: '' }
        : item
    ));
    
    setAddingThoughts(prev => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
  };

  const lastQuestionElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
        loadFeedData(page + 1, false);
      }
    });
    
    if (lastQuestionElementRef.current) {
      observerRef.current.observe(lastQuestionElementRef.current);
    }
  }, [loading, hasMore, page]);

  if (loading && feedData.length === 0) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#fafafa'
      }}>
        <Empty description="加载中..." />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#fafafa' }}>
      <Header style={{ 
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
            思考工具 - Feed流
          </Title>
        </div>
        
        <Space>
          <Text>{user?.username}</Text>
          <Button 
            type="text"
            icon={<SettingOutlined />}
            onClick={switchToSingleView}
          >
            切换视图
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

      <div style={{ 
        padding: '24px 16px',
        flex: 1
      }}>
        <div style={{ 
          maxWidth: '600px', 
          margin: '0 auto',
          padding: '0 16px'
        }}>
        {feedData.map((question, index) => (
          <Card
            key={question.id}
            ref={index === feedData.length - 1 ? lastQuestionElementRef : null}
            style={{
              marginBottom: 24,
              borderRadius: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            {/* 问题头部 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <Avatar 
                  style={{ 
                    backgroundColor: '#007AFF',
                    marginRight: 12
                  }}
                  size={40}
                >
                  {question.category?.[0] || '问'}
                </Avatar>
                <div style={{ flex: 1 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {question.category || '未分类'} • {new Date(question.createdAt).toLocaleDateString('zh-CN')}
                  </Text>
                </div>
              </div>
              
              <Title level={4} style={{ 
                margin: 0, 
                color: '#1d1d1f', 
                fontWeight: 600,
                lineHeight: 1.3
              }}>
                {question.title}
              </Title>
              
              {question.description && (
                <Text type="secondary" style={{ 
                  fontSize: 14, 
                  lineHeight: 1.5,
                  display: 'block',
                  marginTop: 8
                }}>
                  {question.description}
                </Text>
              )}
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* 思考历史 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 12
              }}>
                <Text style={{ fontWeight: 500, color: '#1d1d1f' }}>
                  💭 思考记录 ({question.thoughts.length})
                </Text>
                {!question.isAddingThought && (
                  <Button
                    type="text"
                    icon={<PlusOutlined />}
                    onClick={() => handleAddThought(question.id)}
                    style={{
                      borderRadius: 8,
                      color: '#007AFF',
                      fontWeight: 500
                    }}
                  >
                    添加思考
                  </Button>
                )}
              </div>

              {/* 新增思考输入框 */}
              {question.isAddingThought && (
                <div style={{
                  marginBottom: 16,
                  padding: 16,
                  borderRadius: 12,
                  background: 'rgba(0, 122, 255, 0.04)',
                  border: '1px solid rgba(0, 122, 255, 0.2)'
                }}>
                  <RichTextEditor
                    value={addingThoughts[question.id] || ''}
                    onChange={(value) => setAddingThoughts(prev => ({ ...prev, [question.id]: value }))}
                    onSave={() => handleSaveThought(question.id)}
                    placeholder="记录你此刻的思考..."
                    autoFocus={true}
                    style={{ marginBottom: 12 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Button
                      size="small"
                      icon={<CloseOutlined />}
                      onClick={() => handleCancelAddThought(question.id)}
                      style={{ borderRadius: 8 }}
                    >
                      取消
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={() => handleSaveThought(question.id)}
                      style={{ borderRadius: 8 }}
                    >
                      发布思考
                    </Button>
                  </div>
                </div>
              )}

              {/* 思考列表 */}
              {question.thoughts.length === 0 ? (
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="还没有思考记录"
                  style={{ 
                    padding: '24px 0',
                    background: 'rgba(0, 0, 0, 0.02)',
                    borderRadius: 8,
                    border: '1px dashed rgba(0, 0, 0, 0.1)'
                  }}
                />
              ) : (
                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                  {question.thoughts.map((thought, thoughtIndex) => (
                    <div
                      key={thought.id}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        background: thoughtIndex === 0 ? 'rgba(0, 122, 255, 0.06)' : 'rgba(0, 0, 0, 0.02)',
                        border: thoughtIndex === 0 ? '1px solid rgba(0, 122, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.06)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ marginBottom: 8 }}>
                        <MDEditor.Markdown 
                          source={thought.content} 
                          style={{ 
                            backgroundColor: 'transparent',
                            color: '#1d1d1f',
                            fontSize: 14,
                            lineHeight: 1.6
                          }} 
                        />
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                      }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <CalendarOutlined style={{ marginRight: 4 }} />
                          {new Date(thought.updatedAt).toLocaleString('zh-CN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                        {thoughtIndex === 0 && (
                          <Text style={{ 
                            fontSize: 12, 
                            color: '#007AFF',
                            fontWeight: 500
                          }}>
                            最新
                          </Text>
                        )}
                      </div>
                    </div>
                  ))}
                </Space>
              )}
            </div>
          </Card>
        ))}

        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '24px',
            color: '#86868b'
          }}>
            加载更多...
          </div>
        )}

        {!hasMore && feedData.length > 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '24px',
            color: '#86868b'
          }}>
            没有更多内容了
          </div>
        )}
        </div>
      </div>
    </Layout>
  );
};

export default FeedView;