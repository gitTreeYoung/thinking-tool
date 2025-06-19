import React, { useState, useRef, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { message } from 'antd';
import '@uiw/react-md-editor/markdown-editor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onSaveAndNext?: () => void;
  placeholder?: string;
  style?: React.CSSProperties;
  autoFocus?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  onSave,
  onSaveAndNext,
  placeholder = "在这里记录你的思考...",
  style,
  autoFocus = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // 自动聚焦功能
  useEffect(() => {
    if (autoFocus && editorRef.current) {
      // 延迟一点时间确保MDEditor完全渲染
      const timer = setTimeout(() => {
        const textarea = editorRef.current?.querySelector('textarea');
        if (textarea) {
          textarea.focus();
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 检查是否在编辑器内
      const target = event.target as HTMLElement;
      const isInEditor = editorRef.current?.contains(target);
      
      if (!isInEditor) return;

      // Command/Ctrl + Shift + Enter: 保存并跳转到下一题
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        
        if (onSaveAndNext) {
          setIsLoading(true);
          try {
            onSaveAndNext();
            message.success('已保存并跳转到下一题');
          } catch (error) {
            message.error('保存失败');
          } finally {
            setIsLoading(false);
          }
        }
        return;
      }

      // Command/Ctrl + Enter: 保存
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        
        setIsLoading(true);
        try {
          onSave();
          message.success('保存成功');
        } catch (error) {
          message.error('保存失败');
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // Enter: 换行（默认行为，无需特殊处理）
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [onSave, onSaveAndNext]);

  return (
    <div ref={editorRef} style={{ position: 'relative', ...style }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          borderRadius: 16
        }}>
          <div style={{ color: '#007AFF', fontWeight: 500 }}>保存中...</div>
        </div>
      )}
      
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        preview="live"
        hideToolbar={false}
        height={300}
        data-color-mode="light"
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          background: 'rgba(255, 255, 255, 0.8)',
        }}
        textareaProps={{
          placeholder,
          autoFocus,
          style: {
            fontSize: 16,
            lineHeight: 1.6,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            background: 'transparent',
            border: 'none',
            resize: 'none'
          }
        }}
      />
      
      <div style={{
        marginTop: 8,
        fontSize: 12,
        color: '#86868b',
        textAlign: 'right'
      }}>
        <div>Enter: 换行</div>
        <div>⌘ + Enter: 保存</div>
        {onSaveAndNext && <div>⌘ + Shift + Enter: 保存并下一题</div>}
      </div>
    </div>
  );
};

export default RichTextEditor;