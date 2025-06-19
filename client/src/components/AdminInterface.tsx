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
  Popconfirm,
  Checkbox,
  List,
  Tabs
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
  FilterOutlined,
  SettingOutlined,
  TagOutlined
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
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [showGeneratedResults, setShowGeneratedResults] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [activeTab, setActiveTab] = useState<string>('全部');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryForm] = Form.useForm();
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
      category: activeTab !== '全部' ? activeTab : ''
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
      const result = await adminAPI.generateQuestionsWithAI(values);
      setGeneratedQuestions(result.questions || []);
      setSelectedQuestionIds(result.questions?.map((q: any) => q.id) || []);
      setShowGeneratedResults(true);
      message.success(result.message || 'AI生成问题成功');
    } catch (error: any) {
      console.error('Failed to generate questions with AI:', error);
      message.error(error.message || 'AI生成失败，请检查配置参数');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleImportSelected = async () => {
    try {
      const selectedQuestions = generatedQuestions.filter(q => selectedQuestionIds.includes(q.id));
      if (selectedQuestions.length === 0) {
        message.warning('请至少选择一个问题');
        return;
      }
      
      await adminAPI.importSelectedQuestions(selectedQuestions);
      message.success(`成功导入 ${selectedQuestions.length} 个问题`);
      setAiModalVisible(false);
      setShowGeneratedResults(false);
      setGeneratedQuestions([]);
      setSelectedQuestionIds([]);
      aiForm.resetFields();
      loadQuestions();
    } catch (error: any) {
      console.error('Failed to import selected questions:', error);
      message.error('导入失败');
    }
  };

  const handleSelectAllQuestions = (checked: boolean) => {
    if (checked) {
      setSelectedQuestionIds(generatedQuestions.map(q => q.id));
    } else {
      setSelectedQuestionIds([]);
    }
  };

  const handleQuestionSelect = (questionId: string, checked: boolean) => {
    if (checked) {
      setSelectedQuestionIds(prev => [...prev, questionId]);
    } else {
      setSelectedQuestionIds(prev => prev.filter(id => id !== questionId));
    }
  };

  // 获取所有分类
  const getCategories = () => {
    const categories = [...new Set(questions.map(q => q.category).filter(Boolean))];
    return categories.sort();
  };

  // 分类管理函数
  const handleCreateCategory = async (values: { name: string }) => {
    try {
      // 检查分类是否已存在
      const existingCategories = getCategories();
      if (existingCategories.includes(values.name)) {
        message.error('分类已存在');
        return;
      }
      
      // 创建一个默认问题在新分类下
      await adminAPI.createQuestion({
        title: `${values.name}示例问题`,
        description: `这是${values.name}分类下的示例问题，您可以编辑或删除它。`,
        category: values.name
      });
      
      message.success('分类创建成功');
      setCategoryModalVisible(false);
      categoryForm.resetFields();
      loadQuestions();
    } catch (error) {
      console.error('Failed to create category:', error);
      message.error('创建分类失败');
    }
  };

  const handleRenameCategory = async (values: { name: string }) => {
    try {
      if (!editingCategory) return;
      
      const questionsToUpdate = questions.filter(q => q.category === editingCategory);
      
      // 批量更新所有该分类下的问题
      for (const question of questionsToUpdate) {
        await adminAPI.updateQuestion(question.id, { 
          ...question, 
          category: values.name 
        });
      }
      
      message.success('分类重命名成功');
      setCategoryModalVisible(false);
      categoryForm.resetFields();
      setEditingCategory(null);
      loadQuestions();
    } catch (error) {
      console.error('Failed to rename category:', error);
      message.error('重命名分类失败');
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    try {
      const questionsInCategory = questions.filter(q => q.category === categoryName);
      
      // 删除该分类下的所有问题
      for (const question of questionsInCategory) {
        await adminAPI.deleteQuestion(question.id);
      }
      
      message.success('分类删除成功');
      loadQuestions();
    } catch (error) {
      console.error('Failed to delete category:', error);
      message.error('删除分类失败');
    }
  };

  // 过滤问题
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchText.toLowerCase()) ||
      (question.description && question.description.toLowerCase().includes(searchText.toLowerCase())) ||
      (question.category && question.category.toLowerCase().includes(searchText.toLowerCase()));
    
    const matchesCategory = activeTab === '全部' || question.category === activeTab;
    
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
                icon={<SettingOutlined />}
                onClick={() => setCategoryModalVisible(true)}
                style={{ borderRadius: 12 }}
              >
                管理分类
              </Button>
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

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            type="card"
            style={{ marginBottom: 16 }}
            items={[
              {
                key: '全部',
                label: (
                  <span>
                    <TagOutlined />
                    全部 ({questions.length})
                  </span>
                ),
              },
              ...getCategories().map(category => ({
                key: category,
                label: (
                  <span>
                    <TagOutlined />
                    {category} ({questions.filter(q => q.category === category).length})
                  </span>
                ),
              }))
            ]}
          />

          <Table
            columns={columns}
            dataSource={isAddingNew ? [
              {
                id: 'new-row',
                title: '',
                description: '',
                category: activeTab !== '全部' ? activeTab : '',
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
          title={showGeneratedResults ? "选择要导入的问题" : "AI生成问题"}
          open={aiModalVisible}
          onCancel={() => {
            setAiModalVisible(false);
            setShowGeneratedResults(false);
            setGeneratedQuestions([]);
            setSelectedQuestionIds([]);
          }}
          footer={null}
          width={showGeneratedResults ? 800 : 600}
        >
          {showGeneratedResults ? (
            // 显示生成结果选择界面
            <div>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>生成了 {generatedQuestions.length} 个问题</Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    已选择 {selectedQuestionIds.length} 个
                  </Text>
                </div>
                <Checkbox
                  checked={selectedQuestionIds.length === generatedQuestions.length && generatedQuestions.length > 0}
                  indeterminate={selectedQuestionIds.length > 0 && selectedQuestionIds.length < generatedQuestions.length}
                  onChange={(e) => handleSelectAllQuestions(e.target.checked)}
                >
                  全选
                </Checkbox>
              </div>
              
              <div style={{ maxHeight: '500px', overflowY: 'auto', marginBottom: 16 }}>
                <List
                  dataSource={generatedQuestions}
                  renderItem={(question: any) => (
                    <List.Item
                      style={{
                        border: '1px solid #f0f0f0',
                        borderRadius: 8,
                        marginBottom: 8,
                        padding: 16,
                        background: selectedQuestionIds.includes(question.id) ? 'rgba(0, 122, 255, 0.04)' : '#fff'
                      }}
                    >
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                          <Checkbox
                            checked={selectedQuestionIds.includes(question.id)}
                            onChange={(e) => handleQuestionSelect(question.id, e.target.checked)}
                            style={{ marginTop: 4 }}
                          />
                          <div style={{ flex: 1 }}>
                            <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>
                              {question.title}
                            </Text>
                            {question.description && (
                              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                                {question.description}
                              </Text>
                            )}
                            {question.category && (
                              <Tag color="blue" style={{ borderRadius: 4 }}>
                                {question.category}
                              </Tag>
                            )}
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <Button 
                  onClick={() => {
                    setShowGeneratedResults(false);
                    setGeneratedQuestions([]);
                    setSelectedQuestionIds([]);
                  }}
                  style={{ borderRadius: 12 }}
                >
                  重新生成
                </Button>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Button 
                    onClick={() => {
                      setAiModalVisible(false);
                      setShowGeneratedResults(false);
                      setGeneratedQuestions([]);
                      setSelectedQuestionIds([]);
                    }}
                    style={{ borderRadius: 12 }}
                  >
                    取消
                  </Button>
                  <Button 
                    type="primary" 
                    onClick={handleImportSelected}
                    disabled={selectedQuestionIds.length === 0}
                    style={{ borderRadius: 12 }}
                  >
                    导入选中问题 ({selectedQuestionIds.length})
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // 显示AI配置界面
            <Form form={aiForm} layout="vertical" onFinish={handleAIGenerate} initialValues={{
              baseUrl: 'https://api.openai.com/v1',
              modelName: 'gpt-3.5-turbo',
              count: 10,
              prompt: '请生成一些关于个人成长和自我反思的深度思考问题，帮助用户更好地了解自己，发现内心的想法和感受。'
            }}>
              <div style={{ marginBottom: 16, padding: 12, background: 'rgba(0, 122, 255, 0.04)', borderRadius: 8, border: '1px solid rgba(0, 122, 255, 0.2)' }}>
                <Text style={{ fontSize: 12, color: '#1d1d1f' }}>
                  💡 支持所有兼容OpenAI格式的API服务，如：OpenAI、Azure OpenAI、Claude、本地部署的模型等
                </Text>
              </div>
              
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
                <Input placeholder="例如: gpt-3.5-turbo, gpt-4, claude-3-sonnet" style={{ borderRadius: 12 }} />
              </Form.Item>
              
              <Form.Item
                name="prompt"
                label="生成提示"
                rules={[{ required: true, message: '请输入生成提示' }]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="描述你想要生成的问题类型和风格，例如：关于人际关系的思考问题、适合早晨反思的问题等..."
                  style={{ borderRadius: 12 }}
                />
              </Form.Item>
              
              <Form.Item
                name="count"
                label="生成数量"
                rules={[{ required: true, message: '请输入生成数量' }]}
              >
                <Input type="number" min={1} max={50} placeholder="建议1-20个" style={{ borderRadius: 12 }} />
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
          )}
        </Modal>

        {/* 分类管理Modal */}
        <Modal
          title={editingCategory ? "重命名分类" : "管理分类"}
          open={categoryModalVisible}
          onCancel={() => {
            setCategoryModalVisible(false);
            setEditingCategory(null);
            categoryForm.resetFields();
          }}
          footer={null}
          width={600}
        >
          {editingCategory ? (
            // 重命名分类表单
            <Form form={categoryForm} layout="vertical" onFinish={handleRenameCategory}>
              <Form.Item
                name="name"
                label="新分类名称"
                rules={[{ required: true, message: '请输入分类名称' }]}
                initialValue={editingCategory}
              >
                <Input placeholder="输入分类名称" style={{ borderRadius: 12 }} />
              </Form.Item>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <Button 
                  onClick={() => {
                    setEditingCategory(null);
                    categoryForm.resetFields();
                  }}
                  style={{ borderRadius: 12 }}
                >
                  取消
                </Button>
                <Button type="primary" htmlType="submit" style={{ borderRadius: 12 }}>
                  保存
                </Button>
              </div>
            </Form>
          ) : (
            // 分类列表和管理
            <div>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>当前分类</Text>
                <Button 
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => categoryForm.submit()}
                  style={{ borderRadius: 12 }}
                >
                  创建新分类
                </Button>
              </div>
              
              <Form form={categoryForm} layout="inline" onFinish={handleCreateCategory} style={{ marginBottom: 16 }}>
                <Form.Item
                  name="name"
                  rules={[{ required: true, message: '请输入分类名称' }]}
                  style={{ flex: 1 }}
                >
                  <Input placeholder="输入新分类名称" style={{ borderRadius: 12 }} />
                </Form.Item>
              </Form>
              
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <List
                  dataSource={getCategories()}
                  renderItem={(category) => (
                    <List.Item
                      style={{
                        border: '1px solid #f0f0f0',
                        borderRadius: 8,
                        marginBottom: 8,
                        padding: 16,
                        background: '#fff'
                      }}
                      actions={[
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => {
                            setEditingCategory(category);
                            categoryForm.setFieldsValue({ name: category });
                          }}
                          style={{ borderRadius: 8 }}
                        >
                          重命名
                        </Button>,
                        <Popconfirm
                          title="确定删除这个分类吗？"
                          description="删除分类将同时删除该分类下的所有问题"
                          onConfirm={() => handleDeleteCategory(category)}
                          okText="确定"
                          cancelText="取消"
                        >
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            style={{ borderRadius: 8 }}
                          >
                            删除
                          </Button>
                        </Popconfirm>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<TagOutlined style={{ color: '#007AFF' }} />}
                        title={category}
                        description={`${questions.filter(q => q.category === category).length} 个问题`}
                      />
                    </List.Item>
                  )}
                />
              </div>
            </div>
          )}
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