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
  Progress,
  Tag
} from 'antd';
import { 
  LeftOutlined, 
  RightOutlined,
  AudioOutlined,
  SaveOutlined,
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { seriesAPI, thoughtsAPI } from '../services/api';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface QuestionSeries {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  questionCount: number;
}

interface SeriesQuestion {
  id: string;
  seriesId: string;
  questionId: string;
  orderIndex: number;
  question: {
    id: string;
    title: string;
    description?: string;
    category?: string;
  };
}

interface ThoughtEntry {
  id: string;
  questionId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const SeriesThinking: React.FC = () => {
  const [series, setSeries] = useState<QuestionSeries[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<QuestionSeries | null>(null);
  const [seriesQuestions, setSeriesQuestions] = useState<SeriesQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [thoughts, setThoughts] = useState<ThoughtEntry[]>([]);
  const [currentThought, setCurrentThought] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingThought, setEditingThought] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  useEffect(() => {
    loadSeries();
  }, []);

  useEffect(() => {
    if (selectedSeries) {
      loadSeriesQuestions(selectedSeries.id);
    }
  }, [selectedSeries]);

  useEffect(() => {
    if (seriesQuestions.length > 0 && currentQuestionIndex < seriesQuestions.length) {
      loadThoughts(seriesQuestions[currentQuestionIndex].question.id);
    }
  }, [currentQuestionIndex, seriesQuestions]);

  const loadSeries = async () => {
    try {
      const data = await seriesAPI.getAll();
      setSeries(data);
      if (data.length > 0) {
        setSelectedSeries(data[0]);
      }
    } catch (error) {
      console.error('Failed to load series:', error);
      message.error('加载系列失败');
    } finally {
      setLoading(false);
    }
  };

  const loadSeriesQuestions = async (seriesId: string) => {
    try {
      const data = await seriesAPI.getQuestions(seriesId);
      setSeriesQuestions(data);
      setCurrentQuestionIndex(0);
    } catch (error) {
      console.error('Failed to load series questions:', error);
      message.error('加载系列问题失败');
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
      const questionId = seriesQuestions[currentQuestionIndex].question.id;
      
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
    if (currentQuestionIndex < seriesQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      message.info('已经是最后一个问题了');
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      message.info('已经是第一个问题了');
    }
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
      await loadThoughts(seriesQuestions[currentQuestionIndex].question.id);
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
      await loadThoughts(seriesQuestions[currentQuestionIndex].question.id);
      message.success('删除成功');
    } catch (error) {
      console.error('Failed to delete thought:', error);
      message.error('删除失败');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '50vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (series.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Empty 
          description="暂无系列问题，请在管理后台创建系列"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  if (!selectedSeries || seriesQuestions.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  const currentQuestion = seriesQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / seriesQuestions.length) * 100;

  return (
    <Content className="mobile-content" style={{ 
      padding: '32px 16px', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      width: '100%'
    }}>
      {/* 系列选择卡片 */}
      <Card 
        className="mobile-card" 
        style={{ 
          marginBottom: 16, 
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          border: 'none',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}
        bodyStyle={{ padding: '16px 20px 12px' }}
      >
        <Row gutter={[12, 8]}>
          {series.map(s => (
            <Col key={s.id} xs={12} sm={8} md={6} lg={4}>
              <Card
                hoverable
                size="small"
                onClick={() => setSelectedSeries(s)}
                style={{
                  borderRadius: 12,
                  backgroundColor: selectedSeries?.id === s.id ? 'rgba(0, 122, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)',
                  border: selectedSeries?.id === s.id ? '1px solid rgba(0, 122, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  cursor: 'pointer'
                }}
                bodyStyle={{ padding: '12px 8px', textAlign: 'center' }}
              >
                <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                <Title 
                  level={5} 
                  style={{ 
                    margin: 0, 
                    marginBottom: 2,
                    color: selectedSeries?.id === s.id ? '#007AFF' : '#1d1d1f',
                    fontWeight: 600,
                    fontSize: '13px',
                    lineHeight: 1.2
                  }}
                >
                  {s.name}
                </Title>
                <Text 
                  type="secondary" 
                  style={{ 
                    fontSize: 11,
                    color: selectedSeries?.id === s.id ? 'rgba(0, 122, 255, 0.8)' : '#86868b'
                  }}
                >
                  {s.questionCount} 题
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
        
        {selectedSeries && selectedSeries.description && (
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <Paragraph style={{ margin: 0, color: '#86868b', fontSize: '13px', lineHeight: 1.3 }}>
              {selectedSeries.description}
            </Paragraph>
          </div>
        )}
      </Card>

      <Row gutter={[16, 24]}>
        {/* 左侧：问题和输入区域 */}
        <Col xs={24} lg={12}>
          {/* 进度和导航卡片 */}
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
                disabled={currentQuestionIndex === 0}
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
              <div style={{ flex: 1, margin: '0 16px', textAlign: 'center' }}>
                <Progress 
                  percent={progress} 
                  showInfo={false}
                  strokeColor="#007AFF"
                  style={{ marginBottom: 8 }}
                />
                <Text strong style={{ fontSize: '16px', color: '#1d1d1f' }}>
                  {currentQuestionIndex + 1} / {seriesQuestions.length}
                </Text>
              </div>
              <Button 
                icon={<RightOutlined />} 
                onClick={nextQuestion}
                type="text"
                size="large"
                className="nav-button"
                disabled={currentQuestionIndex === seriesQuestions.length - 1}
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
          </Card>

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
            <div style={{ textAlign: 'center' }}>
              {currentQuestion.question.category && (
                <Tag 
                  color="blue" 
                  style={{ 
                    marginBottom: 16,
                    borderRadius: '12px',
                    padding: '4px 12px',
                    background: 'rgba(0, 122, 255, 0.1)',
                    border: '1px solid rgba(0, 122, 255, 0.2)',
                    color: '#007AFF'
                  }}
                >
                  {currentQuestion.question.category}
                </Tag>
              )}
              <Title level={2} style={{ marginBottom: 16, color: '#1d1d1f', fontWeight: 600, lineHeight: 1.2 }}>
                {currentQuestion.question.title}
              </Title>
              {currentQuestion.question.description && (
                <Paragraph style={{ fontSize: 17, color: '#86868b', lineHeight: 1.5, margin: 0 }}>
                  {currentQuestion.question.description}
                </Paragraph>
              )}
            </div>
          </Card>

          {/* 输入区域 */}
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
              WebkitBackdropFilter: 'blur(20px)'
            }}
            bodyStyle={{ padding: '24px 32px 32px' }}
          >
            <TextArea
              value={currentThought}
              onChange={(e) => setCurrentThought(e.target.value)}
              placeholder="在这里记录你的思考..."
              rows={8}
              style={{ 
                borderRadius: 16,
                fontSize: 17,
                lineHeight: 1.6,
                border: '1px solid rgba(0, 0, 0, 0.08)',
                background: 'rgba(255, 255, 255, 0.8)',
                padding: '16px'
              }}
            />
          </Card>
        </Col>

        {/* 右侧：思考历史 */}
        <Col xs={24} lg={12}>
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
                              <TextArea
                                value={editingContent}
                                onChange={(e) => setEditingContent(e.target.value)}
                                rows={3}
                                style={{ 
                                  marginBottom: 12,
                                  fontSize: 15,
                                  lineHeight: 1.6,
                                  borderRadius: 12,
                                  border: '1px solid rgba(0, 0, 0, 0.08)'
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
                              <Paragraph 
                                style={{ 
                                  margin: 0, 
                                  marginBottom: 12,
                                  fontSize: 15,
                                  lineHeight: 1.6,
                                  color: '#1d1d1f'
                                }}
                              >
                                {thought.content}
                              </Paragraph>
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
      </Row>
    </Content>
  );
};

export default SeriesThinking;