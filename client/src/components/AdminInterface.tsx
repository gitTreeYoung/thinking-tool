import React, { useState, useEffect } from 'react';
import './ThinkingInterface.css';
import { 
  Layout, 
  Card, 
  Button, 
  Input, 
  Typography, 
  Space, 
  Table, 
  Modal,
  Form,
  Select,
  message,
  Tabs,
  Row,
  Col,
  Popconfirm
} from 'antd';
import { 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ImportOutlined,
  RobotOutlined,
  QuestionCircleOutlined,
  BulbOutlined,
  ArrowLeftOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';
import { questionsAPI, adminAPI, seriesAPI } from '../services/api';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Question {
  id: string;
  title: string;
  description?: string;
  category?: string;
  createdAt: string;
}

interface QuestionSeries {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  questionCount: number;
  createdAt: string;
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

interface AdminInterfaceProps {
  onBack: () => void;
}

const AdminInterface: React.FC<AdminInterfaceProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('questions');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [series, setSeries] = useState<QuestionSeries[]>([]);
  const [seriesQuestions, setSeriesQuestions] = useState<SeriesQuestion[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<QuestionSeries | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [seriesModalVisible, setSeriesModalVisible] = useState(false);
  const [seriesQuestionModalVisible, setSeriesQuestionModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingSeries, setEditingSeries] = useState<QuestionSeries | null>(null);
  const [form] = Form.useForm();
  const [seriesForm] = Form.useForm();
  const [seriesQuestionForm] = Form.useForm();
  const [aiForm] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [importText, setImportText] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [editingSeriesQuestion, setEditingSeriesQuestion] = useState<SeriesQuestion | null>(null);
  const [editSeriesQuestionModalVisible, setEditSeriesQuestionModalVisible] = useState(false);

  useEffect(() => {
    loadQuestions();
    loadSeries();
  }, []);

  useEffect(() => {
    if (selectedSeries) {
      loadSeriesQuestions(selectedSeries.id);
    }
  }, [selectedSeries]);

  const loadQuestions = async () => {
    setLoading(true);
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

  const loadSeries = async () => {
    try {
      const data = await seriesAPI.getAll();
      setSeries(data);
    } catch (error: any) {
      console.error('Failed to load series:', error);
      message.error(`加载系列失败: ${error.response?.data?.message || error.message}`);
    }
  };

  const loadSeriesQuestions = async (seriesId: string) => {
    try {
      const data = await seriesAPI.getQuestions(seriesId);
      setSeriesQuestions(data);
    } catch (error) {
      console.error('Failed to load series questions:', error);
      message.error('加载系列问题失败');
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    form.setFieldsValue(question);
    setModalVisible(true);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await adminAPI.deleteQuestion(questionId);
      message.success('删除成功');
      loadQuestions();
    } catch (error) {
      console.error('Delete question error:', error);
      message.error('删除失败');
    }
  };

  const handleSaveQuestion = async (values: any) => {
    try {
      if (editingQuestion) {
        await adminAPI.updateQuestion(editingQuestion.id, values);
        message.success('更新成功');
      } else {
        await adminAPI.createQuestion(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadQuestions();
    } catch (error) {
      console.error('Save question error:', error);
      message.error('保存失败');
    }
  };

  const handleBatchImport = async () => {
    try {
      const lines = importText.split('\n').filter(line => line.trim());
      const questions = lines.map(line => {
        const parts = line.split('|');
        return {
          title: parts[0]?.trim() || line.trim(),
          description: parts[1]?.trim() || '',
          category: parts[2]?.trim() || '默认分类'
        };
      });

      const result = await adminAPI.batchImportQuestions(questions);
      message.success(result.message);
      setImportModalVisible(false);
      setImportText('');
      loadQuestions();
    } catch (error) {
      console.error('Batch import error:', error);
      message.error('批量导入失败');
    }
  };

  const handleAiGenerate = async (values: any) => {
    setAiGenerating(true);
    try {
      const { baseUrl, apiKey, modelName, prompt, count } = values;
      
      const result = await adminAPI.generateQuestionsWithAI({
        baseUrl,
        apiKey,
        modelName,
        prompt,
        count
      });
      
      message.success(result.message);
      setAiModalVisible(false);
      aiForm.resetFields();
      loadQuestions();
    } catch (error: any) {
      console.error('AI generate error:', error);
      message.error(error.response?.data?.message || 'AI生成失败');
    } finally {
      setAiGenerating(false);
    }
  };

  // 系列管理功能
  const handleAddSeries = () => {
    setEditingSeries(null);
    seriesForm.resetFields();
    setSeriesModalVisible(true);
  };

  const handleEditSeries = (series: QuestionSeries) => {
    setEditingSeries(series);
    seriesForm.setFieldsValue(series);
    setSeriesModalVisible(true);
  };

  const handleDeleteSeries = async (seriesId: string) => {
    try {
      await seriesAPI.delete(seriesId);
      message.success('删除成功');
      loadSeries();
      if (selectedSeries?.id === seriesId) {
        setSelectedSeries(null);
        setSeriesQuestions([]);
      }
    } catch (error) {
      console.error('Delete series error:', error);
      message.error('删除失败');
    }
  };

  const handleSaveSeries = async (values: any) => {
    try {
      if (editingSeries) {
        await seriesAPI.update(editingSeries.id, values);
        message.success('更新成功');
      } else {
        await seriesAPI.create(values);
        message.success('创建成功');
      }
      setSeriesModalVisible(false);
      loadSeries();
    } catch (error: any) {
      console.error('Save series error:', error);
      message.error(`保存失败: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleAddQuestionToSeries = async (values: any) => {
    if (!selectedSeries) return;
    
    try {
      await seriesAPI.addQuestion(selectedSeries.id, values);
      message.success('添加成功');
      setSeriesQuestionModalVisible(false);
      loadSeriesQuestions(selectedSeries.id);
      loadSeries();
    } catch (error) {
      console.error('Add question to series error:', error);
      message.error('添加失败');
    }
  };

  const handleRemoveQuestionFromSeries = async (questionId: string) => {
    if (!selectedSeries) return;
    
    try {
      await seriesAPI.removeQuestion(selectedSeries.id, questionId);
      message.success('移除成功');
      loadSeriesQuestions(selectedSeries.id);
      loadSeries();
    } catch (error) {
      console.error('Remove question from series error:', error);
      message.error('移除失败');
    }
  };

  const handleUpdateSeriesQuestion = async (values: any) => {
    if (!selectedSeries || !editingSeriesQuestion) return;
    
    try {
      await seriesAPI.updateQuestion(selectedSeries.id, editingSeriesQuestion.id, values);
      message.success('更新成功');
      setEditSeriesQuestionModalVisible(false);
      setEditingSeriesQuestion(null);
      loadSeriesQuestions(selectedSeries.id);
    } catch (error) {
      console.error('Update series question error:', error);
      message.error('更新失败');
    }
  };

  const categories = [...new Set(questions.map(q => q.category).filter(Boolean))] as string[];

  // 分类管理函数
  const handleAddCategory = () => {
    setEditingCategory(null);
    categoryForm.resetFields();
    setCategoryModalVisible(true);
  };

  const handleEditCategory = (category: string) => {
    setEditingCategory(category);
    categoryForm.setFieldsValue({ name: category });
    setCategoryModalVisible(true);
  };

  const handleDeleteCategory = async (category: string) => {
    // 检查该分类是否还有问题
    const questionsInCategory = questions.filter(q => q.category === category);
    if (questionsInCategory.length > 0) {
      message.error(`该分类下还有 ${questionsInCategory.length} 个问题，无法删除`);
      return;
    }
    message.success('分类删除成功');
    loadQuestions();
  };

  const handleSaveCategory = async () => {
    // 这里应该调用后端API保存分类，暂时模拟
    message.success(editingCategory ? '分类更新成功' : '分类创建成功');
    setCategoryModalVisible(false);
    loadQuestions();
  };

  // 过滤问题
  const filteredQuestions = questions.filter(q => 
    !searchText || 
    q.title.toLowerCase().includes(searchText.toLowerCase()) ||
    q.description?.toLowerCase().includes(searchText.toLowerCase()) ||
    q.category?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: '问题标题',
      dataIndex: 'title',
      key: 'title',
      width: '40%',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: '15%',
      render: (category: string) => category || '未分类',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: '30%',
      render: (description: string) => description ? description.substring(0, 50) + '...' : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: '15%',
      render: (_: any, record: Question) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEditQuestion(record)}
            style={{
              borderRadius: 8,
              background: 'rgba(0, 122, 255, 0.1)',
              color: '#007AFF',
              border: 'none'
            }}
          />
          <Popconfirm
            title="确定删除这个问题吗？"
            onConfirm={() => handleDeleteQuestion(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="text" 
              icon={<DeleteOutlined />}
              style={{
                borderRadius: 8,
                background: 'rgba(255, 59, 48, 0.1)',
                color: '#FF3B30',
                border: 'none'
              }}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

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
        <Space align="center">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            style={{ 
              marginRight: 16,
              borderRadius: 12,
              background: 'rgba(0, 0, 0, 0.04)'
            }}
          >
            返回
          </Button>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            borderRadius: '12px',
            background: 'rgba(0, 122, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            marginRight: 16,
            flexShrink: 0
          }}>
            <BulbOutlined style={{ fontSize: 22, color: '#007AFF' }} />
          </div>
          <Title level={3} style={{ margin: 0, color: '#1d1d1f', fontWeight: 600 }}>
            管理后台
          </Title>
        </Space>
      </Header>

      <Content className="mobile-content" style={{ padding: '32px 16px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          size="large"
          items={[
            {
              key: 'questions',
              label: (
                <Space size={8}>
                  <QuestionCircleOutlined />
                  <span style={{ fontWeight: 500 }}>问题管理</span>
                </Space>
              ),
              children: (
                <Card
                  className="mobile-card"
                  title={
                    <Space size={8}>
                      <QuestionCircleOutlined style={{ color: '#007AFF' }} />
                      <span style={{ fontWeight: 600, color: '#1d1d1f' }}>问题管理</span>
                    </Space>
                  }
                  extra={
                    <Space size={12}>
                      <Input.Search
                        placeholder="搜索问题..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ 
                          borderRadius: 12,
                          width: 200
                        }}
                      />
                      <Button 
                        icon={<ImportOutlined />}
                        onClick={() => setImportModalVisible(true)}
                        style={{ 
                          borderRadius: 12,
                          border: '1px solid rgba(0, 0, 0, 0.08)',
                          background: 'rgba(255, 255, 255, 0.8)',
                          fontWeight: 500
                        }}
                      >
                        批量导入
                      </Button>
                      <Button 
                        icon={<RobotOutlined />}
                        onClick={() => setAiModalVisible(true)}
                        style={{ 
                          borderRadius: 12,
                          border: '1px solid rgba(0, 0, 0, 0.08)',
                          background: 'rgba(255, 255, 255, 0.8)',
                          fontWeight: 500
                        }}
                      >
                        AI生成
                      </Button>
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={handleAddQuestion}
                        className="primary-button"
                        style={{ 
                          borderRadius: 12,
                          background: 'rgba(0, 122, 255, 0.1)',
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                          border: '1px solid rgba(0, 122, 255, 0.2)',
                          color: '#007AFF',
                          fontWeight: 600,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        添加问题
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
                  bodyStyle={{ padding: '24px 32px' }}
                >
                  <Tabs 
                    defaultActiveKey="all"
                    tabBarExtraContent={
                      <Button 
                        size="small"
                        onClick={handleAddCategory}
                        style={{ 
                          borderRadius: 8,
                          background: 'rgba(0, 122, 255, 0.1)',
                          border: '1px solid rgba(0, 122, 255, 0.2)',
                          color: '#007AFF',
                          fontWeight: 500
                        }}
                      >
                        管理分类
                      </Button>
                    }
                  >
                    <Tabs.TabPane tab="全部问题" key="all">
                      <Table
                        columns={columns}
                        dataSource={filteredQuestions}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          borderRadius: 16
                        }}
                      />
                    </Tabs.TabPane>
                    {categories.map(category => (
                      <Tabs.TabPane 
                        tab={
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span>{category}</span>
                            <Space size={4} style={{ marginLeft: 8 }}>
                              <Button 
                                type="text" 
                                size="small"
                                icon={<EditOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditCategory(category);
                                }}
                                style={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: 4,
                                  background: 'rgba(0, 122, 255, 0.1)',
                                  color: '#007AFF'
                                }}
                              />
                              <Popconfirm
                                title="确定删除这个分类吗？"
                                onConfirm={() => {
                                  handleDeleteCategory(category);
                                }}
                                okText="确定"
                                cancelText="取消"
                              >
                                <Button 
                                  type="text" 
                                  size="small"
                                  icon={<DeleteOutlined />}
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 4,
                                    background: 'rgba(255, 59, 48, 0.1)',
                                    color: '#FF3B30'
                                  }}
                                />
                              </Popconfirm>
                            </Space>
                          </div>
                        } 
                        key={category}
                      >
                        <Table
                          columns={columns}
                          dataSource={filteredQuestions.filter(q => q.category === category)}
                          rowKey="id"
                          loading={loading}
                          pagination={{ pageSize: 10 }}
                          style={{
                            background: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: 16
                          }}
                        />
                      </Tabs.TabPane>
                    ))}
                  </Tabs>
                </Card>
              )
            },
            {
              key: 'series',
              label: (
                <Space size={8}>
                  <UnorderedListOutlined />
                  <span style={{ fontWeight: 500 }}>系列管理</span>
                </Space>
              ),
              children: (
                <Row gutter={[16, 24]}>
                  <Col span={12}>
                    <Card
                      className="mobile-card"
                      title={
                        <Space size={8}>
                          <UnorderedListOutlined style={{ color: '#007AFF' }} />
                          <span style={{ fontWeight: 600, color: '#1d1d1f' }}>系列列表</span>
                        </Space>
                      }
                      extra={
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />}
                          onClick={handleAddSeries}
                          className="primary-button"
                          style={{ 
                            borderRadius: 12,
                            background: 'rgba(0, 122, 255, 0.1)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid rgba(0, 122, 255, 0.2)',
                            color: '#007AFF',
                            fontWeight: 600,
                            transition: 'all 0.2s ease'
                          }}
                        >
                          添加系列
                        </Button>
                      }
                      style={{ 
                        borderRadius: 20,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                        border: 'none',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)'
                      }}
                      bodyStyle={{ padding: '24px' }}
                    >
                      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        <Space direction="vertical" style={{ width: '100%' }} size={16}>
                          {series.map(s => (
                            <div key={s.id} className="thought-card">
                              <Card
                                size="small"
                                hoverable
                                onClick={() => setSelectedSeries(s)}
                                style={{
                                  borderRadius: 16,
                                  backgroundColor: selectedSeries?.id === s.id ? 'rgba(0, 122, 255, 0.08)' : 'rgba(255, 255, 255, 0.8)',
                                  border: selectedSeries?.id === s.id ? '1px solid rgba(0, 122, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.06)',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  backdropFilter: 'blur(10px)',
                                  WebkitBackdropFilter: 'blur(10px)'
                                }}
                                bodyStyle={{ padding: '16px 20px' }}
                              >
                                <div style={{ position: 'relative' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                      <span style={{ fontSize: 20, marginRight: 8 }}>{s.icon}</span>
                                      <Text strong style={{ color: selectedSeries?.id === s.id ? '#007AFF' : '#1d1d1f', fontWeight: 600 }}>{s.name}</Text>
                                      <Text type="secondary" style={{ marginLeft: 12, color: selectedSeries?.id === s.id ? 'rgba(0, 122, 255, 0.8)' : '#86868b' }}>({s.questionCount}题)</Text>
                                    </div>
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
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditSeries(s);
                                          }}
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
                                        <Popconfirm
                                          title="确定删除这个系列吗？"
                                          onConfirm={(e) => {
                                            e?.stopPropagation();
                                            handleDeleteSeries(s.id);
                                          }}
                                          okText="确定"
                                          cancelText="取消"
                                        >
                                          <Button 
                                            type="text" 
                                            size="small" 
                                            icon={<DeleteOutlined />}
                                            onClick={(e) => e.stopPropagation()}
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
                                        </Popconfirm>
                                      </Space>
                                    </div>
                                  </div>
                                  {s.description && (
                                    <Text type="secondary" style={{ fontSize: 12, color: selectedSeries?.id === s.id ? 'rgba(0, 122, 255, 0.8)' : '#86868b' }}>
                                      {s.description}
                                    </Text>
                                  )}
                                </div>
                              </Card>
                            </div>
                          ))}
                        </Space>
                      </div>
                    </Card>
                  </Col>
                  
                  <Col span={12}>
                    <Card
                      className="mobile-card"
                      title={
                        <Space size={8}>
                          <span style={{ fontWeight: 600, color: '#1d1d1f' }}>系列问题</span>
                          {selectedSeries && (
                            <Text type="secondary" style={{ color: '#86868b' }}>({selectedSeries.name})</Text>
                          )}
                        </Space>
                      }
                      extra={
                        selectedSeries && (
                          <Button 
                            type="primary" 
                            icon={<PlusOutlined />}
                            onClick={() => {
                              seriesQuestionForm.resetFields();
                              setSeriesQuestionModalVisible(true);
                            }}
                            size="small"
                            style={{ 
                              borderRadius: 8,
                              background: 'rgba(0, 122, 255, 0.1)',
                              border: '1px solid rgba(0, 122, 255, 0.2)',
                              color: '#007AFF',
                              fontWeight: 500
                            }}
                          >
                            添加问题
                          </Button>
                        )
                      }
                      style={{ 
                        borderRadius: 20,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                        border: 'none',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)'
                      }}
                      bodyStyle={{ padding: '24px' }}
                    >
                      {!selectedSeries ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#86868b' }}>
                          请选择一个系列查看问题
                        </div>
                      ) : (
                        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                          <Space direction="vertical" style={{ width: '100%' }} size={12}>
                            {seriesQuestions.map((sq) => (
                              <div key={sq.id} className="thought-card">
                                <Card
                                  size="small"
                                  style={{
                                    borderRadius: 12,
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    border: '1px solid rgba(0, 0, 0, 0.06)',
                                    transition: 'all 0.2s ease',
                                    backdropFilter: 'blur(10px)',
                                    WebkitBackdropFilter: 'blur(10px)'
                                  }}
                                  bodyStyle={{ padding: '12px 16px' }}
                                >
                                  <div style={{ position: 'relative' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <Text strong style={{ marginRight: 8, color: '#007AFF', fontWeight: 600 }}>#{sq.orderIndex}</Text>
                                        <div style={{ flex: 1 }}>
                                          <Text style={{ color: '#1d1d1f', fontWeight: 500 }}>{sq.question.title}</Text>
                                          {sq.question.description && (
                                            <div>
                                              <Text type="secondary" style={{ fontSize: 12, color: '#86868b' }}>
                                                {sq.question.description.substring(0, 60)}...
                                              </Text>
                                            </div>
                                          )}
                                        </div>
                                      </div>
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
                                            onClick={() => {
                                              setEditingSeriesQuestion(sq);
                                              setEditSeriesQuestionModalVisible(true);
                                            }}
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
                                          <Popconfirm
                                            title="确定移除这个问题吗？"
                                            onConfirm={() => handleRemoveQuestionFromSeries(sq.question.id)}
                                            okText="确定"
                                            cancelText="取消"
                                          >
                                            <Button 
                                              type="text" 
                                              size="small" 
                                              icon={<DeleteOutlined />}
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
                                          </Popconfirm>
                                        </Space>
                                      </div>
                                    </div>
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
              )
            }
          ]}
        />

        {/* 添加/编辑问题模态框 */}
        <Modal
          title={editingQuestion ? '编辑问题' : '添加问题'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={600}
          style={{ borderRadius: 20 }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveQuestion}
          >
            <Form.Item
              name="title"
              label={<span style={{ fontWeight: 600, color: '#1d1d1f' }}>问题标题</span>}
              rules={[{ required: true, message: '请输入问题标题' }]}
            >
              <Input 
                placeholder="请输入问题标题" 
                style={{
                  borderRadius: 12,
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  padding: '12px 16px'
                }}
              />
            </Form.Item>

            <Form.Item
              name="category"
              label={<span style={{ fontWeight: 600, color: '#1d1d1f' }}>分类</span>}
              rules={[{ required: true, message: '请选择分类' }]}
            >
              <Select placeholder="请选择分类" allowClear style={{ borderRadius: 12 }}>
                {categories.map(cat => (
                  <Option key={cat} value={cat}>{cat}</Option>
                ))}
                <Option value="日常思考">日常思考</Option>
                <Option value="价值观">价值观</Option>
                <Option value="生活愿景">生活愿景</Option>
                <Option value="学习成长">学习成长</Option>
                <Option value="感恩">感恩</Option>
                <Option value="梦想目标">梦想目标</Option>
                <Option value="自我认知">自我认知</Option>
                <Option value="困惑思考">困惑思考</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="description"
              label={<span style={{ fontWeight: 600, color: '#1d1d1f' }}>问题描述</span>}
            >
              <TextArea 
                rows={4} 
                placeholder="请输入问题描述（可选）" 
                style={{
                  borderRadius: 12,
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  padding: '12px 16px'
                }}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button 
                  onClick={() => setModalVisible(false)}
                  style={{
                    borderRadius: 12,
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    background: 'rgba(255, 255, 255, 0.8)',
                    fontWeight: 500
                  }}
                >
                  取消
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  className="primary-button"
                  style={{
                    borderRadius: 12,
                    background: 'rgba(0, 122, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(0, 122, 255, 0.2)',
                    color: '#007AFF',
                    fontWeight: 600,
                    transition: 'all 0.2s ease'
                  }}
                >
                  保存
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* 批量导入模态框 */}
        <Modal
          title="批量导入问题"
          open={importModalVisible}
          onCancel={() => setImportModalVisible(false)}
          footer={null}
          width={700}
          style={{ borderRadius: 20 }}
        >
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              格式说明：每行一个问题，可用 | 分隔标题、描述和分类<br/>
              例如：问题标题|问题描述|分类名称
            </Text>
          </div>
          <TextArea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={10}
            style={{ borderRadius: 12, border: '1px solid rgba(0, 0, 0, 0.08)' }}
            placeholder={`示例：
今天最让你印象深刻的事情是什么？|可以是一个人、一件事、一个想法，或者任何触动你的瞬间。|日常思考
如果你可以改变世界上的一件事，你会选择什么？|思考一下你认为最重要的社会、环境或个人问题。|价值观
描述一下你理想中的一天是什么样的？|从早晨醒来到晚上入睡，你希望如何度过完美的一天？|生活愿景`}
          />
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Space>
              <Button 
                onClick={() => setImportModalVisible(false)}
                style={{ borderRadius: 12, border: '1px solid rgba(0, 0, 0, 0.08)' }}
              >
                取消
              </Button>
              <Button 
                type="primary" 
                onClick={handleBatchImport}
                disabled={!importText.trim()}
                style={{
                  borderRadius: 12,
                  background: 'rgba(0, 122, 255, 0.1)',
                  border: '1px solid rgba(0, 122, 255, 0.2)',
                  color: '#007AFF'
                }}
              >
                导入
              </Button>
            </Space>
          </div>
        </Modal>

        {/* AI生成模态框 */}
        <Modal
          title="AI生成问题"
          open={aiModalVisible}
          onCancel={() => setAiModalVisible(false)}
          footer={null}
          width={700}
          style={{ borderRadius: 20 }}
        >
          <Form
            form={aiForm}
            layout="vertical"
            onFinish={handleAiGenerate}
            initialValues={{
              baseUrl: 'https://api.openai.com/v1',
              modelName: 'gpt-3.5-turbo',
              count: 5,
              prompt: '请生成一些有深度的哲学思考问题，这些问题应该能够引导人们进行深入的自我反思和思考。'
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="baseUrl"
                  label="API Base URL"
                  rules={[{ required: true, message: '请输入API Base URL' }]}
                >
                  <Input placeholder="https://api.openai.com/v1" style={{ borderRadius: 12 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="modelName"
                  label="模型名称"
                  rules={[{ required: true, message: '请输入模型名称' }]}
                >
                  <Input placeholder="gpt-3.5-turbo" style={{ borderRadius: 12 }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="apiKey"
              label="API Key"
              rules={[{ required: true, message: '请输入API Key' }]}
            >
              <Input.Password placeholder="请输入您的API Key" style={{ borderRadius: 12 }} />
            </Form.Item>

            <Form.Item
              name="prompt"
              label="生成提示词"
              rules={[{ required: true, message: '请输入生成提示词' }]}
            >
              <TextArea 
                rows={4} 
                placeholder="请描述您希望生成什么类型的问题"
                style={{ borderRadius: 12 }}
              />
            </Form.Item>

            <Form.Item
              name="count"
              label="生成数量"
              rules={[{ required: true, message: '请输入生成数量' }]}
            >
              <Select style={{ borderRadius: 12 }}>
                <Option value={3}>3个</Option>
                <Option value={5}>5个</Option>
                <Option value={10}>10个</Option>
                <Option value={20}>20个</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button onClick={() => setAiModalVisible(false)} style={{ borderRadius: 12 }}>
                  取消
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={aiGenerating}
                  style={{
                    borderRadius: 12,
                    background: 'rgba(0, 122, 255, 0.1)',
                    border: '1px solid rgba(0, 122, 255, 0.2)',
                    color: '#007AFF'
                  }}
                >
                  {aiGenerating ? '生成中...' : '开始生成'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* 添加/编辑系列模态框 */}
        <Modal
          title={editingSeries ? '编辑系列' : '添加系列'}
          open={seriesModalVisible}
          onCancel={() => setSeriesModalVisible(false)}
          footer={null}
          width={600}
          style={{ borderRadius: 20 }}
        >
          <Form
            form={seriesForm}
            layout="vertical"
            onFinish={handleSaveSeries}
          >
            <Form.Item
              name="name"
              label="系列名称"
              rules={[{ required: true, message: '请输入系列名称' }]}
            >
              <Input placeholder="请输入系列名称" style={{ borderRadius: 12 }} />
            </Form.Item>

            <Form.Item
              name="description"
              label="系列描述"
            >
              <TextArea 
                rows={3} 
                placeholder="请输入系列描述（可选）" 
                style={{ borderRadius: 12 }}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="icon"
                  label="图标"
                >
                  <Select placeholder="选择图标" style={{ borderRadius: 12 }}>
                    <Option value="🌙">🌙 晚安</Option>
                    <Option value="☀️">☀️ 早安</Option>
                    <Option value="💭">💭 思考</Option>
                    <Option value="📚">📚 学习</Option>
                    <Option value="❤️">❤️ 情感</Option>
                    <Option value="🎯">🎯 目标</Option>
                    <Option value="🌱">🌱 成长</Option>
                    <Option value="🎨">🎨 创意</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="color"
                  label="主题色"
                >
                  <Select placeholder="选择主题色" style={{ borderRadius: 12 }}>
                    <Option value="#4f46e5">🟣 紫色</Option>
                    <Option value="#f59e0b">🟡 黄色</Option>
                    <Option value="#10b981">🟢 绿色</Option>
                    <Option value="#3b82f6">🔵 蓝色</Option>
                    <Option value="#ef4444">🔴 红色</Option>
                    <Option value="#8b5cf6">🟣 紫罗兰</Option>
                    <Option value="#06b6d4">🟦 青色</Option>
                    <Option value="#f97316">🟠 橙色</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Space>
                <Button onClick={() => setSeriesModalVisible(false)} style={{ borderRadius: 12 }}>
                  取消
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  style={{
                    borderRadius: 12,
                    background: 'rgba(0, 122, 255, 0.1)',
                    border: '1px solid rgba(0, 122, 255, 0.2)',
                    color: '#007AFF'
                  }}
                >
                  保存
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* 添加问题到系列模态框 */}
        <Modal
          title="添加问题到系列"
          open={seriesQuestionModalVisible}
          onCancel={() => setSeriesQuestionModalVisible(false)}
          footer={null}
          width={600}
          style={{ borderRadius: 20 }}
        >
          <Form
            form={seriesQuestionForm}
            layout="vertical"
            onFinish={handleAddQuestionToSeries}
          >
            <Form.Item
              name="questionId"
              label="选择问题"
              rules={[{ required: true, message: '请选择问题' }]}
            >
              <Select 
                placeholder="请选择要添加的问题"
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
                style={{ borderRadius: 12 }}
              >
                {questions.filter(q => 
                  !seriesQuestions.some(sq => sq.question.id === q.id)
                ).map(question => (
                  <Option key={question.id} value={question.id}>
                    {question.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="orderIndex"
              label="排序位置"
            >
              <Select placeholder="选择位置（默认添加到最后）" style={{ borderRadius: 12 }}>
                {Array.from({ length: seriesQuestions.length + 1 }, (_, i) => (
                  <Option key={i + 1} value={i + 1}>
                    第 {i + 1} 位
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button onClick={() => setSeriesQuestionModalVisible(false)} style={{ borderRadius: 12 }}>
                  取消
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  style={{
                    borderRadius: 12,
                    background: 'rgba(0, 122, 255, 0.1)',
                    border: '1px solid rgba(0, 122, 255, 0.2)',
                    color: '#007AFF'
                  }}
                >
                  添加
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* 分类管理模态框 */}
        <Modal
          title={editingCategory ? '编辑分类' : '添加分类'}
          open={categoryModalVisible}
          onCancel={() => setCategoryModalVisible(false)}
          footer={null}
          width={400}
          style={{ borderRadius: 20 }}
        >
          <Form
            form={categoryForm}
            layout="vertical"
            onFinish={handleSaveCategory}
          >
            <Form.Item
              name="name"
              label="分类名称"
              rules={[{ required: true, message: '请输入分类名称' }]}
            >
              <Input 
                placeholder="请输入分类名称" 
                style={{ borderRadius: 12 }}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button 
                  onClick={() => setCategoryModalVisible(false)}
                  style={{ borderRadius: 12 }}
                >
                  取消
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  style={{
                    borderRadius: 12,
                    background: 'rgba(0, 122, 255, 0.1)',
                    border: '1px solid rgba(0, 122, 255, 0.2)',
                    color: '#007AFF'
                  }}
                >
                  保存
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* 编辑系列问题模态框 */}
        <Modal
          title="编辑系列问题"
          open={editSeriesQuestionModalVisible}
          onCancel={() => {
            setEditSeriesQuestionModalVisible(false);
            setEditingSeriesQuestion(null);
          }}
          footer={null}
          width={600}
          style={{ borderRadius: 20 }}
        >
          {editingSeriesQuestion && (
            <Form
              layout="vertical"
              onFinish={handleUpdateSeriesQuestion}
              initialValues={{
                orderIndex: editingSeriesQuestion.orderIndex,
                questionId: editingSeriesQuestion.question.id
              }}
            >
              <Form.Item
                name="questionId"
                label="选择问题"
                rules={[{ required: true, message: '请选择问题' }]}
              >
                <Select 
                  placeholder="请选择问题"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ borderRadius: 12 }}
                >
                  {questions.map(question => (
                    <Option key={question.id} value={question.id}>
                      {question.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="orderIndex"
                label="排序位置"
                rules={[{ required: true, message: '请选择排序位置' }]}
              >
                <Select placeholder="选择位置" style={{ borderRadius: 12 }}>
                  {Array.from({ length: seriesQuestions.length }, (_, i) => (
                    <Option key={i + 1} value={i + 1}>
                      第 {i + 1} 位
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button 
                    onClick={() => {
                      setEditSeriesQuestionModalVisible(false);
                      setEditingSeriesQuestion(null);
                    }}
                    style={{ borderRadius: 12 }}
                  >
                    取消
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    style={{
                      borderRadius: 12,
                      background: 'rgba(0, 122, 255, 0.1)',
                      border: '1px solid rgba(0, 122, 255, 0.2)',
                      color: '#007AFF'
                    }}
                  >
                    保存
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          )}
        </Modal>
      </Content>
    </Layout>
  );
};

export default AdminInterface;