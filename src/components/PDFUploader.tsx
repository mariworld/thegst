import React, { useState, useRef } from 'react';
import { Upload, Button, message, Typography, Spin, Divider, Space } from 'antd';
import { UploadOutlined, FilePdfOutlined, BugOutlined } from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd';

const { Dragger } = Upload;
const { Text, Title, Paragraph } = Typography;

interface PDFUploaderProps {
  onPDFContent: (content: string) => void;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onPDFContent }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (message: string) => {
    console.log('[PDF Uploader]', message);
    setLogs(prev => [...prev.slice(-9), message]); // Keep last 10 logs
  };

  const handleFileSelection = async (file: File) => {
    setIsLoading(true);
    addLog(`Processing file: ${file.name} (${file.size} bytes, type: ${file.type})`);
    
    // More permissive PDF check - some PDFs may not have the exact MIME type
    const isPDF = file.type === 'application/pdf' || 
                 file.name.toLowerCase().endsWith('.pdf');
    
    if (!isPDF) {
      message.error('You can only upload PDF files!');
      addLog('Error: Not a PDF file');
      setIsLoading(false);
      return;
    }
    
    try {
      // Read the file
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          addLog('File read complete');
          const binary = e.target?.result as string;
          
          if (!binary) {
            throw new Error('Failed to read file data');
          }
          
          addLog(`File binary size: ${binary.length}`);
          addLog('Sending to server...');
          
          // Send to server - update URL to use port 3001 where the backend is running
          const response = await fetch('/api/extract-pdf', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              pdfData: binary 
            }),
          });
          
          addLog(`Server response status: ${response.status}`);
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to extract PDF content: ${response.status} ${response.statusText}. Details: ${errorText}`);
          }
          
          const data = await response.json();
          addLog(`Extracted ${data.extractedText?.length || 0} characters of text`);
          
          if (!data.extractedText || data.extractedText.length === 0) {
            throw new Error('No text was extracted from the PDF');
          }
          
          addLog('Text sample: ' + data.extractedText.substring(0, 50) + '...');
          onPDFContent(data.extractedText);
          addLog('PDF content processed successfully');
          message.success('PDF processed successfully!');
          
        } catch (error) {
          console.error('Error processing PDF:', error);
          addLog(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          message.error('Failed to process PDF. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        addLog(`File read error: ${error}`);
        message.error('Failed to read the file');
        setIsLoading(false);
      };
      
      // Read as data URL to get base64 encoding
      addLog('Starting file read as Data URL...');
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error in file handling:', error);
      addLog(`Error handling file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  const handleManualUpload = () => {
    fileInputRef.current?.click();
  };

  // Add a test function to check API connectivity
  const handleTestApi = async () => {
    try {
      addLog('Testing API connection...');
      const response = await fetch('http://localhost:3001/api/test');
      const data = await response.json();
      addLog(`API test response: ${JSON.stringify(data)}`);
      
      if (response.ok) {
        message.success('API connection successful!');
      } else {
        message.error('API connection failed');
      }
    } catch (error) {
      console.error('API test error:', error);
      addLog(`API test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      message.error('API connection failed');
    }
  };

  const props: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.pdf',
    fileList,
    onChange(info) {
      const { status } = info.file;
      
      setFileList(info.fileList.slice(-1)); // Only keep the last uploaded file
      addLog(`File upload status changed: ${status || 'unknown'}`);

      if (status === 'uploading') {
        setIsLoading(true);
        addLog('File is uploading...');
        return;
      }
      
      if (status === 'done') {
        message.success(`${info.file.name} uploaded successfully.`);
        setIsLoading(false);
        addLog('File was uploaded successfully.');
      } else if (status === 'error') {
        message.error(`${info.file.name} upload failed.`);
        setIsLoading(false);
        addLog('File upload failed with error status.');
      }
    },
    beforeUpload(file) {
      addLog(`Before upload with file type: ${file.type}`);
      // Instead of using Upload's built-in mechanism, we handle the file ourselves
      setTimeout(() => {
        handleFileSelection(file);
      }, 0);
      return false; // Prevent default upload behavior
    },
    itemRender: (originNode) => (
      <div style={{color: 'white'}}>{originNode}</div>
    ),
    showUploadList: {
      showRemoveIcon: true,
      removeIcon: <span style={{color: 'white'}}>Remove</span>
    }
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      <Title level={4} style={{ color: 'white', marginBottom: '16px' }}>
        Upload PDF
      </Title>
      
      <Dragger {...props} style={{ 
        background: '#141414', 
        borderColor: '#303030',
        borderRadius: '8px',
        padding: '20px'
      }}>
        <p className="ant-upload-drag-icon" style={{ color: '#9CA3AF' }}>
          <FilePdfOutlined style={{ fontSize: '32px' }} />
        </p>
        <p className="ant-upload-text" style={{ color: 'white' }}>
          Click or drag PDF file to this area to upload
        </p>
        <p className="ant-upload-hint" style={{ color: '#9CA3AF' }}>
          Support for a single PDF file upload. We'll extract the text to generate flashcards.
        </p>
      </Dragger>
      
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <Space>
          <input 
            type="file" 
            ref={fileInputRef}
            style={{ display: 'none' }} 
            accept=".pdf" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileSelection(file);
                // Reset the input so the same file can be selected again
                e.target.value = '';
              }
            }}
          />
          <Button 
            onClick={handleManualUpload}
            icon={<UploadOutlined />}
            style={{ 
              backgroundColor: '#141414', 
              borderColor: '#303030',
              color: 'white'
            }}
            disabled={isLoading}
          >
            Select PDF File
          </Button>
          
          <Button
            onClick={handleTestApi}
            icon={<BugOutlined />}
            style={{
              backgroundColor: '#141414',
              borderColor: '#303030',
              color: 'white'
            }}
            disabled={isLoading}
          >
            Test API
          </Button>
        </Space>
      </div>
      
      {isLoading && (
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Spin>
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <Paragraph style={{ color: '#9CA3AF' }}>Processing PDF...</Paragraph>
            </div>
          </Spin>
        </div>
      )}
      
      {logs.length > 0 && (
        <div style={{ marginTop: '16px', padding: '10px', background: '#1a1a1a', borderRadius: '4px', maxHeight: '150px', overflow: 'auto' }}>
          <Divider style={{ margin: '8px 0', borderColor: '#303030' }}>
            <Text style={{ color: '#9CA3AF', fontSize: '12px' }}>Debug Logs</Text>
          </Divider>
          {logs.map((log, index) => (
            <Paragraph key={index} style={{ color: '#9CA3AF', fontSize: '12px', margin: '4px 0' }}>
              {log}
            </Paragraph>
          ))}
        </div>
      )}
    </div>
  );
};

export default PDFUploader; 