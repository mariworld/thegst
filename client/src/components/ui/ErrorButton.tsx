import React from 'react'
import { Button } from 'antd'
import * as Sentry from '@sentry/react'

interface ErrorButtonProps {
  text?: string
}

const ErrorButton: React.FC<ErrorButtonProps> = ({ text = 'Test Error' }) => {
  const handleClick = () => {
    // Intentionally throw an error for Sentry testing
    throw new Error('Test error for Sentry debugging')
  }

  return (
    <Button
      danger
      size="small"
      onClick={handleClick}
      style={{
        fontSize: '12px',
        height: '28px'
      }}
    >
      {text}
    </Button>
  )
}

export default ErrorButton