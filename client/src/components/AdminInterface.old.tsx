import React, { useState, useEffect } from 'react';
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
  const [importText, setImportText] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

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
      console.log('Loading series...');
      const data = await seriesAPI.getAll();
      console.log('Series loaded:', data);
      setSeries(data);
    } catch (error: any) {
      console.error('Failed to load series:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
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
      console.log('Saving series with values:', values);
      if (editingSeries) {
        const result = await seriesAPI.update(editingSeries.id, values);
        console.log('Update result:', result);
        message.success('更新成功');
      } else {
        const result = await seriesAPI.create(values);
        console.log('Create result:', result);
        message.success('创建成功');
      }
      setSeriesModalVisible(false);
      loadSeries();
    } catch (error: any) {
      console.error('Save series error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
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
      loadSeries(); // 刷新系列列表以更新问题数量
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
      loadSeries(); // 刷新系列列表以更新问题数量
    } catch (error) {
      console.error('Remove question from series error:', error);
      message.error('移除失败');
    }
  };

  const categories = [...new Set(questions.map(q => q.category).filter(Boolean))];

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
          />
          <Popconfirm
            title="确定删除这个问题吗？"
            onConfirm={() => handleDeleteQuestion(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

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
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            style={{ marginRight: 16 }}
          >
            返回
          </Button>
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
            管理后台
          </Title>
        </Space>
      </Header>

      <Content style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'questions',
              label: (
                <Space>
                  <QuestionCircleOutlined />
                  <span>问题管理</span>
                </Space>
              ),
              children: (
                <Card
                  title={
                    <Space>
                      <QuestionCircleOutlined />
                      <span>问题管理</span>
                    </Space>
                  }
                  extra={
                    <Space>
                      <Button 
                        icon={<ImportOutlined />}
                        onClick={() => setImportModalVisible(true)}
                      >
                        批量导入
                      </Button>
                      <Button 
                        icon={<RobotOutlined />}
                        onClick={() => setAiModalVisible(true)}
                      >
                        AI生成
                      </Button>
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={handleAddQuestion}
                        style={{ 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: 'none'
                        }}
                      >
                        添加问题
                      </Button>
                    </Space>
                  }
                  style={{ 
                    borderRadius: 16,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: 'none'
                  }}
                >
                  <Tabs defaultActiveKey="all">
                    <Tabs.TabPane tab="全部问题" key="all">
                      <Table
                        columns={columns}
                        dataSource={questions}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                      />
                    </Tabs.TabPane>
                    {categories.map(category => (
                      <Tabs.TabPane tab={category} key={category}>
                        <Table
                          columns={columns}
                          dataSource={questions.filter(q => q.category === category)}
                          rowKey="id"
                          loading={loading}
                          pagination={{ pageSize: 10 }}
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
                <Space>
                  <UnorderedListOutlined />
                  <span>系列管理</span>
                </Space>
              ),
              children: (
                <Row gutter={24}>
                  <Col span={12}>
                    <Card
                      title={
                        <Space>
                          <UnorderedListOutlined />
                          <span>系列列表</span>
                        </Space>
                      }
                      extra={
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />}
                          onClick={handleAddSeries}
                          style={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none'
                          }}
                        >
                          添加系列
                        </Button>
                      }
                      style={{ 
                        borderRadius: 16,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        border: 'none'
                      }}
                    >
                      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        <Space direction="vertical" style={{ width: '100%' }} size={12}>
                          {series.map(s => (
                            <Card
                              key={s.id}
                              size="small"
                              hoverable
                              onClick={() => setSelectedSeries(s)}
                              style={{
                                borderRadius: 12,
                                backgroundColor: selectedSeries?.id === s.id ? '#f0f8ff' : '#fafafa',
                                border: selectedSeries?.id === s.id ? '2px solid #1890ff' : '1px solid #e8e8e8',
                                cursor: 'pointer'
                              }}
                              actions={[
                                <Button 
                                  key="edit" 
                                  type="text" 
                                  size="small" 
                                  icon={<EditOutlined />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditSeries(s);
                                  }}
                                />,
                                <Popconfirm
                                  key="delete"
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
                                    danger
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </Popconfirm>
                              ]}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                <span style={{ fontSize: 20, marginRight: 8 }}>{s.icon}</span>
                                <Text strong>{s.name}</Text>
                                <Text type="secondary" style={{ marginLeft: 'auto' }}>({s.questionCount}题)</Text>
                              </div>
                              {s.description && (
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {s.description}
                                </Text>
                              )}
                            </Card>
                          ))}
                        </Space>
                      </div>
                    </Card>
                  </Col>
                  
                  <Col span={12}>
                    <Card
                      title={
                        <Space>
                          <span>系列问题</span>
                          {selectedSeries && (
                            <Text type="secondary">({selectedSeries.name})</Text>
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
                          >
                            添加问题
                          </Button>
                        )
                      }
                      style={{ 
                        borderRadius: 16,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        border: 'none'
                      }}
                    >
                      {!selectedSeries ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                          请选择一个系列查看问题
                        </div>
                      ) : (
                        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                          <Space direction="vertical" style={{ width: '100%' }} size={8}>
                            {seriesQuestions.map((sq) => (
                              <Card
                                key={sq.id}
                                size="small"
                                style={{
                                  borderRadius: 8,
                                  backgroundColor: '#fafafa',
                                  border: '1px solid #e8e8e8'
                                }}
                                actions={[
                                  <Popconfirm
                                    key="remove"
                                    title="确定移除这个问题吗？"
                                    onConfirm={() => handleRemoveQuestionFromSeries(sq.question.id)}
                                    okText="确定"
                                    cancelText="取消"
                                  >
                                    <Button 
                                      type="text" 
                                      size="small" 
                                      icon={<DeleteOutlined />}
                                      danger
                                    />
                                  </Popconfirm>
                                ]}
                              >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <Text strong style={{ marginRight: 8 }}>#{sq.orderIndex}</Text>
                                  <div style={{ flex: 1 }}>
                                    <Text>{sq.question.title}</Text>
                                    {sq.question.description && (
                                      <div>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                          {sq.question.description.substring(0, 60)}...
                                        </Text>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Card>
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
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveQuestion}
          >
            <Form.Item
              name="title"
              label="问题标题"
              rules={[{ required: true, message: '请输入问题标题' }]}
            >
              <Input placeholder="请输入问题标题" />
            </Form.Item>

            <Form.Item
              name="category"
              label="分类"
              rules={[{ required: true, message: '请选择分类' }]}
            >
              <Select placeholder="请选择分类" allowClear>
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
              label="问题描述"
            >
              <TextArea 
                rows={4} 
                placeholder="请输入问题描述（可选）" 
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button onClick={() => setModalVisible(false)}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit">
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
            placeholder={`示例：
今天最让你印象深刻的事情是什么？|可以是一个人、一件事、一个想法，或者任何触动你的瞬间。|日常思考
如果你可以改变世界上的一件事，你会选择什么？|思考一下你认为最重要的社会、环境或个人问题。|价值观
描述一下你理想中的一天是什么样的？|从早晨醒来到晚上入睡，你希望如何度过完美的一天？|生活愿景`}
          />
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setImportModalVisible(false)}>
                取消
              </Button>
              <Button 
                type="primary" 
                onClick={handleBatchImport}
                disabled={!importText.trim()}
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
                  <Input placeholder="https://api.openai.com/v1" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="modelName"
                  label="模型名称"
                  rules={[{ required: true, message: '请输入模型名称' }]}
                >
                  <Input placeholder="gpt-3.5-turbo" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="apiKey"
              label="API Key"
              rules={[{ required: true, message: '请输入API Key' }]}
            >
              <Input.Password placeholder="请输入您的API Key" />
            </Form.Item>

            <Form.Item
              name="prompt"
              label="生成提示词"
              rules={[{ required: true, message: '请输入生成提示词' }]}
            >
              <TextArea 
                rows={4} 
                placeholder="请描述您希望生成什么类型的问题"
              />
            </Form.Item>

            <Form.Item
              name="count"
              label="生成数量"
              rules={[{ required: true, message: '请输入生成数量' }]}
            >
              <Select>
                <Option value={3}>3个</Option>
                <Option value={5}>5个</Option>
                <Option value={10}>10个</Option>
                <Option value={20}>20个</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button onClick={() => setAiModalVisible(false)}>
                  取消
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={aiGenerating}
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
              <Input placeholder="请输入系列名称" />
            </Form.Item>

            <Form.Item
              name="description"
              label="系列描述"
            >
              <TextArea 
                rows={3} 
                placeholder="请输入系列描述（可选）" 
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="icon"
                  label="图标"
                >
                  <Select placeholder="选择图标">
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
                  <Select placeholder="选择主题色">
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
                <Button onClick={() => setSeriesModalVisible(false)}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit">
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
              <Select placeholder="选择位置（默认添加到最后）">
                {Array.from({ length: seriesQuestions.length + 1 }, (_, i) => (
                  <Option key={i + 1} value={i + 1}>
                    第 {i + 1} 位
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button onClick={() => setSeriesQuestionModalVisible(false)}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit">
                  添加
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default AdminInterface;