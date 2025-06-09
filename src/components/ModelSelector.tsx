import React, { useEffect } from 'react';
import { Select, Typography, Checkbox, Tooltip, Space } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  webSearchEnabled?: boolean;
  onWebSearchChange?: (checked: boolean) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  value, 
  onChange, 
  disabled,
  webSearchEnabled = false,
  onWebSearchChange = () => {}
}) => {
  const models = [
    { name: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo', description: 'Fast and cost-effective', webSearchCapable: false },
    { name: 'GPT-4o', value: 'gpt-4o', description: 'Most advanced capabilities', webSearchCapable: true },
    { name: 'GPT-4 Turbo', value: 'gpt-4-turbo', description: 'Advanced with higher context', webSearchCapable: true }
  ];

  // Get the currently selected model
  const selectedModel = models.find(model => model.value === value) || models[0];
  
  // Effect to disable web search when incompatible model is selected
  useEffect(() => {
    if (!selectedModel.webSearchCapable && webSearchEnabled) {
      onWebSearchChange(false);
    }
  }, [value, webSearchEnabled, onWebSearchChange, selectedModel.webSearchCapable]);

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <Text style={{ color: '#000000', fontSize: '1rem' }}>
          Select AI Model:
        </Text>
        {selectedModel.webSearchCapable && (
          <Tooltip title="Enable web browsing for up-to-date information">
            <Space>
              <Checkbox 
                checked={webSearchEnabled} 
                onChange={(e) => onWebSearchChange(e.target.checked)}
                disabled={disabled}
              />
              <Text style={{ color: '#000000', fontSize: '0.9rem' }}>
                <GlobalOutlined style={{ marginRight: '4px' }} />
                Enable web search
              </Text>
            </Space>
          </Tooltip>
        )}
      </div>
      <Select
        value={value}
        onChange={onChange}
        style={{ width: '100%' }}
        dropdownStyle={{ backgroundColor: '#ffffff', borderColor: '#d9d9d9' }}
        disabled={disabled}
      >
        {models.map(model => (
          <Option key={model.value} value={model.value}>
            <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
              <Text style={{ color: '#000000' }}>{model.name}</Text>
              <Text style={{ color: '#666666', marginLeft: '8px', fontSize: '0.8rem' }}>
                ({model.description})
              </Text>
            </div>
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default ModelSelector; 