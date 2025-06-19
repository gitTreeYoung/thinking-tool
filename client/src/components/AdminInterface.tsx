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
  message,
  Tooltip,
  Select,
  Row,
  Col,
  Divider,
  Tag,
  Popconfirm
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  QuestionCircleOutlined,
  BulbOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
  FileTextOutlined,
  RobotOutlined,
  CheckOutlined,
  CloseOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { questionsAPI, adminAPI } from '../services/api';

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

interface AdminInterfaceProps {
  onBack: () => void;
}

const AdminInterface: React.FC<AdminInterfaceProps> = ({ onBack }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [form] = Form.useForm();
  const [aiForm] = Form.useForm();
  const [importText, setImportText] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    description: '',
    category: ''
  });

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await questionsAPI.getAll();
      setQuestions(data);
    } catch (error) {
      console.error('Failed to load questions:', error);
      message.error('加载问题失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setIsAddingNew(true);
    setNewQuestion({
      title: '',
      description: '',
      category: selectedCategory !== '全部' ? selectedCategory : ''
    });
  };

  const handleSaveNewQuestion = async () => {
    if (!newQuestion.title.trim()) {
      message.error('请输入问题标题');
      return;
    }

    try {
      await adminAPI.createQuestion(newQuestion);
      message.success('创建成功');
      setIsAddingNew(false);
      setNewQuestion({ title: '', description: '', category: '' });
      loadQuestions();
    } catch (error) {
      console.error('Failed to save question:', error);
      message.error('保存失败');
    }
  };

  const handleCancelNewQuestion = () => {
    setIsAddingNew(false);
    setNewQuestion({ title: '', description: '', category: '' });
  };

  const handleEditQuestion = (question: Question) => {
    setEditingRowId(question.id);
  };

  const handleSaveEdit = async (questionId: string, values: any) => {
    try {
      await adminAPI.updateQuestion(questionId, values);
      message.success('更新成功');
      setEditingRowId(null);
      loadQuestions();
    } catch (error) {
      console.error('Failed to update question:', error);
      message.error('更新失败');
    }
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await adminAPI.deleteQuestion(questionId);
      message.success('删除成功');
      loadQuestions();
    } catch (error) {
      console.error('Failed to delete question:', error);
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
      console.error('Failed to save question:', error);
      message.error('保存失败');
    }
  };

  const handleBatchImport = async () => {
    try {
      const lines = importText.trim().split('\n').filter(line => line.trim());
      const questions = lines.map(line => {
        const parts = line.split('|').map(p => p.trim());
        return {
          title: parts[0] || '',
          description: parts[1] || '',
          category: parts[2] || ''
        };
      }).filter(q => q.title);

      if (questions.length === 0) {
        message.error('请输入有效的问题数据');
        return;
      }

      await adminAPI.batchImportQuestions(questions);
      message.success(`成功导入 ${questions.length} 个问题`);
      setImportModalVisible(false);
      setImportText('');
      loadQuestions();
    } catch (error) {
      console.error('Failed to import questions:', error);
      message.error('批量导入失败');
    }
  };

  const handleAIGenerate = async (values: any) => {
    try {
      setAiGenerating(true);
      await adminAPI.generateQuestionsWithAI(values);
      message.success('AI生成问题成功');
      setAiModalVisible(false);
      aiForm.resetFields();
      loadQuestions();
    } catch (error) {
      console.error('Failed to generate questions with AI:', error);
      message.error('AI生成失败');
    } finally {
      setAiGenerating(false);
    }
  };

  // 获取所有分类
  const getCategories = () => {
    const categories = [...new Set(questions.map(q => q.category).filter(Boolean))];
    return categories.sort();
  };

  // 过滤问题
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchText.toLowerCase()) ||
      (question.description && question.description.toLowerCase().includes(searchText.toLowerCase())) ||
      (question.category && question.category.toLowerCase().includes(searchText.toLowerCase()));
    
    const matchesCategory = selectedCategory === '全部' || question.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const EditableCell = ({ editing, dataIndex, title, record, children, ...restProps }: any) => {
    const [value, setValue] = useState(record?.[dataIndex] || '');
    const isNewRow = record?.isNewRow;

    useEffect(() => {
      if (isNewRow) {
        setValue(newQuestion[dataIndex as keyof typeof newQuestion] || '');
      } else {
        setValue(record?.[dataIndex] || '');
      }
    }, [record, dataIndex, editing, isNewRow, newQuestion]);

    const handleSave = () => {
      if (isNewRow) {
        const updatedNewQuestion = { ...newQuestion, [dataIndex]: value };
        setNewQuestion(updatedNewQuestion);
        if (updatedNewQuestion.title.trim()) {
          handleSaveNewQuestion();
        }
      } else {
        const values = { ...record, [dataIndex]: value };
        handleSaveEdit(record.id, values);
      }
    };

    const handleCancel = () => {
      if (isNewRow) {
        handleCancelNewQuestion();
      } else {
        handleCancelEdit();
      }
    };

    const handleChange = (newValue: string) => {
      setValue(newValue);
      if (isNewRow) {
        setNewQuestion(prev => ({ ...prev, [dataIndex]: newValue }));
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSave();
      }
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    const shouldShowAsEditable = editing || isNewRow;

    if (shouldShowAsEditable) {
      if (dataIndex === 'category') {
        return (
          <td {...restProps}>
            <Select
              value={value}
              onChange={handleChange}
              onPressEnter={handleSave}
              onBlur={handleSave}
              style={{ width: '100%' }}
              placeholder="选择分类"
              allowClear
              showSearch
              mode="combobox"
              autoFocus={isNewRow}
            >
              {getCategories().filter(c => c !== '全部').map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </td>
        );
      } else {
        return (
          <td {...restProps}>
            <Input
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              onPressEnter={handleSave}
              onBlur={isNewRow ? undefined : handleSave}
              onKeyDown={handleKeyPress}
              autoFocus={isNewRow && dataIndex === 'title'}
              placeholder={isNewRow ? (dataIndex === 'title' ? '输入问题标题...' : dataIndex === 'description' ? '输入问题描述...' : '') : ''}
              style={{ borderRadius: 8 }}
            />
          </td>
        );
      }
    }

    return <td {...restProps}>{children}</td>;
  };

  const columns = [
    {
      title: '问题',
      dataIndex: 'title',
      key: 'title',
      onCell: (record: Question) => ({
        record,
        dataIndex: 'title',
        title: '问题',
        editing: editingRowId === record.id,
      }),
      render: (text: string, record: any) => {
        if (editingRowId === record.id || record.isNewRow) return text;
        return (
          <div>
            <Text strong style={{ fontSize: 14 }}>{text}</Text>
            {record.description && (
              <div style={{ marginTop: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      onCell: (record: Question) => ({
        record,
        dataIndex: 'description',
        title: '描述',
        editing: editingRowId === record.id,
      }),
      render: (text: string, record: any) => {
        if (editingRowId === record.id || record.isNewRow) return text;
        return text ? (
          <Text type="secondary" style={{ fontSize: 12 }}>{text}</Text>
        ) : (
          <Text type="secondary" style={{ fontSize: 12, fontStyle: 'italic' }}>无描述</Text>
        );
      },
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      onCell: (record: Question) => ({
        record,
        dataIndex: 'category',
        title: '分类',
        editing: editingRowId === record.id,
      }),
      render: (category: string, record: any) => {
        if (editingRowId === record.id || record.isNewRow) return category;
        return category ? (
          <Tag color="blue" style={{ borderRadius: 8 }}>{category}</Tag>
        ) : (
          <Text type="secondary">未分类</Text>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string, record: any) => record.isNewRow ? '新增中...' : new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_: any, record: any) => {
        const editing = editingRowId === record.id;
        const isNewRow = record.isNewRow;
        
        if (isNewRow) {
          return (
            <Space>
              <Tooltip title="保存 (Enter)">
                <Button 
                  type="text" 
                  icon={<CheckOutlined />} 
                  onClick={handleSaveNewQuestion}
                  style={{ borderRadius: 8, color: '#52c41a' }}
                />
              </Tooltip>
              <Tooltip title="取消 (Esc)">
                <Button 
                  type="text" 
                  icon={<CloseOutlined />} 
                  onClick={handleCancelNewQuestion}
                  style={{ borderRadius: 8 }}
                />
              </Tooltip>
            </Space>
          );
        }
        
        return editing ? (
          <Space>
            <Tooltip title="保存 (Enter)">
              <Button 
                type="text" 
                icon={<CheckOutlined />} 
                onClick={() => handleSaveEdit(record.id, record)}
                style={{ borderRadius: 8, color: '#52c41a' }}
              />
            </Tooltip>
            <Tooltip title="取消 (Esc)">
              <Button 
                type="text" 
                icon={<CloseOutlined />} 
                onClick={handleCancelEdit}
                style={{ borderRadius: 8 }}
              />
            </Tooltip>
          </Space>
        ) : (
          <Space>
            <Tooltip title="编辑">
              <Button 
                type="text" 
                icon={<EditOutlined />} 
                onClick={() => handleEditQuestion(record)}
                style={{ borderRadius: 8 }}
              />
            </Tooltip>
            <Tooltip title="删除">
              <Popconfirm
                title="确定删除这个问题吗？"
                onConfirm={() => handleDeleteQuestion(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />}
                  style={{ borderRadius: 8 }}
                />
              </Popconfirm>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

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
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={onBack}
            style={{ marginRight: 16, borderRadius: 12 }}
          >
            返回
          </Button>
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
            fontWeight: 600
          }}>
            问题管理
          </Title>
        </div>

        <Space>
          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            style={{ width: 150, borderRadius: 12 }}
            placeholder="筛选分类"
            prefix={<FilterOutlined />}
          >
            <Option value="全部">全部分类</Option>
            {getCategories().map(category => (
              <Option key={category} value={category}>{category}</Option>
            ))}
          </Select>
          <Input
            placeholder="搜索问题..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200, borderRadius: 12 }}
          />
        </Space>
      </Header>

      <Content style={{ 
        padding: '32px', 
        maxWidth: '1200px', 
        margin: '0 auto', 
        width: '100%'
      }}>
        <Card
          style={{ 
            borderRadius: 20,
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
          bodyStyle={{ padding: '32px' }}
        >
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={4} style={{ margin: 0, color: '#1d1d1f' }}>
                问题库管理
              </Title>
              <Text type="secondary">
                共 {filteredQuestions.length} 个问题，{getCategories().length} 个分类
              </Text>
            </div>
            <Space>
              <Button 
                icon={<FileTextOutlined />}
                onClick={() => setImportModalVisible(true)}
                style={{ borderRadius: 12 }}
              >
                批量导入
              </Button>
              <Button 
                icon={<RobotOutlined />}
                onClick={() => setAiModalVisible(true)}
                style={{ borderRadius: 12 }}
              >
                AI生成
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleAddQuestion}
                style={{ borderRadius: 12 }}
              >
                添加问题
              </Button>
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={isAddingNew ? [
              {
                id: 'new-row',
                title: '',
                description: '',
                category: '',
                createdAt: new Date().toISOString(),
                isNewRow: true
              },
              ...filteredQuestions
            ] : filteredQuestions}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            }}
            style={{ borderRadius: 16 }}
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            rowClassName={(record) => record.isNewRow ? 'new-row' : ''}
          />
        </Card>

        {/* 问题编辑Modal */}
        <Modal
          title={editingQuestion ? "编辑问题" : "添加问题"}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={600}
          style={{ borderRadius: 16 }}
        >
          <Form form={form} layout="vertical" onFinish={handleSaveQuestion}>
            <Form.Item
              name="title"
              label="问题标题"
              rules={[{ required: true, message: '请输入问题标题' }]}
            >
              <Input placeholder="输入问题标题" style={{ borderRadius: 12 }} />
            </Form.Item>
            
            <Form.Item name="description" label="问题描述">
              <TextArea 
                rows={3} 
                placeholder="输入问题描述（可选）" 
                style={{ borderRadius: 12 }}
              />
            </Form.Item>
            
            <Form.Item name="category" label="分类">
              <Select 
                placeholder="选择或输入分类"
                allowClear
                showSearch
                style={{ borderRadius: 12 }}
                mode="combobox"
              >
                {getCategories().map(category => (
                  <Option key={category} value={category}>{category}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <Button onClick={() => setModalVisible(false)} style={{ borderRadius: 12 }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" style={{ borderRadius: 12 }}>
                {editingQuestion ? '更新' : '创建'}
              </Button>
            </div>
          </Form>
        </Modal>

        {/* 批量导入Modal */}
        <Modal
          title="批量导入问题"
          open={importModalVisible}
          onCancel={() => setImportModalVisible(false)}
          footer={null}
          width={700}
        >
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              请按以下格式输入，每行一个问题：<br/>
              问题标题 | 问题描述 | 分类<br/>
              例如：今天你学到了什么？ | 反思今天的学习收获 | 学习成长
            </Text>
          </div>
          <TextArea
            rows={10}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="请输入问题数据..."
            style={{ borderRadius: 12 }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
            <Button onClick={() => setImportModalVisible(false)} style={{ borderRadius: 12 }}>
              取消
            </Button>
            <Button type="primary" onClick={handleBatchImport} style={{ borderRadius: 12 }}>
              导入
            </Button>
          </div>
        </Modal>

        {/* AI生成Modal */}
        <Modal
          title="AI生成问题"
          open={aiModalVisible}
          onCancel={() => setAiModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form form={aiForm} layout="vertical" onFinish={handleAIGenerate}>
            <Form.Item
              name="baseUrl"
              label="API Base URL"
              rules={[{ required: true, message: '请输入API Base URL' }]}
            >
              <Input placeholder="例如: https://api.openai.com/v1" style={{ borderRadius: 12 }} />
            </Form.Item>
            
            <Form.Item
              name="apiKey"
              label="API Key"
              rules={[{ required: true, message: '请输入API Key' }]}
            >
              <Input.Password placeholder="输入你的API Key" style={{ borderRadius: 12 }} />
            </Form.Item>
            
            <Form.Item
              name="modelName"
              label="模型名称"
              rules={[{ required: true, message: '请输入模型名称' }]}
            >
              <Input placeholder="例如: gpt-3.5-turbo" style={{ borderRadius: 12 }} />
            </Form.Item>
            
            <Form.Item
              name="prompt"
              label="生成提示"
              rules={[{ required: true, message: '请输入生成提示' }]}
            >
              <TextArea 
                rows={4} 
                placeholder="描述你想要生成的问题类型和风格..."
                style={{ borderRadius: 12 }}
              />
            </Form.Item>
            
            <Form.Item
              name="count"
              label="生成数量"
              rules={[{ required: true, message: '请输入生成数量' }]}
              initialValue={10}
            >
              <Input type="number" min={1} max={50} style={{ borderRadius: 12 }} />
            </Form.Item>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <Button onClick={() => setAiModalVisible(false)} style={{ borderRadius: 12 }}>
                取消
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={aiGenerating}
                style={{ borderRadius: 12 }}
              >
                {aiGenerating ? '生成中...' : '生成'}
              </Button>
            </div>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default AdminInterface;

// 添加样式
const style = document.createElement('style');
style.textContent = `
  .new-row {
    background-color: rgba(0, 122, 255, 0.04) !important;
    border: 1px solid rgba(0, 122, 255, 0.2) !important;
  }
  .new-row:hover {
    background-color: rgba(0, 122, 255, 0.08) !important;
  }
`;
document.head.appendChild(style);