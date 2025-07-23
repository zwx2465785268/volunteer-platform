'use client'

import { useState } from 'react'

export default function ApiTestPage() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<{
    external: 'pending' | 'success' | 'failed',
    local: 'pending' | 'success' | 'failed'
  }>({
    external: 'pending',
    local: 'pending'
  })

  const testExternalApi = async () => {
    setLoading(true)
    try {
      const response = await fetch('https://keen-entremet-44c295.netlify.app/edge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer AIzaSyChhhk3gxhgItTUe4qQ_2WKj3wU1i5R11o`
        },
        body: JSON.stringify({
          message: '你好',
          context: "你是一个专业的志愿者管理平台AI助手"
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setApiStatus(prev => ({ ...prev, external: 'success' }))
        setResponse(`外部API成功: ${data?.response || data?.message || '无响应内容'}`)
      } else {
        setApiStatus(prev => ({ ...prev, external: 'failed' }))
        setResponse(`外部API失败: HTTP ${response.status}`)
      }
    } catch (error) {
      setApiStatus(prev => ({ ...prev, external: 'failed' }))
      setResponse(`外部API错误: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setLoading(false)
    }
  }

  const testLocalApi = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message || '你好',
          context: "你是一个专业的志愿者管理平台AI助手"
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setApiStatus(prev => ({ ...prev, local: 'success' }))
        setResponse(`本地API成功: ${data?.response || '无响应内容'}`)
      } else {
        setApiStatus(prev => ({ ...prev, local: 'failed' }))
        setResponse(`本地API失败: HTTP ${response.status}`)
      }
    } catch (error) {
      setApiStatus(prev => ({ ...prev, local: 'failed' }))
      setResponse(`本地API错误: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setLoading(false)
    }
  }

  const testFullFlow = async () => {
    setLoading(true)
    setResponse('开始测试完整流程...\n')
    
    // 测试外部API
    setResponse(prev => prev + '1. 测试外部Gemini API...\n')
    try {
      const externalResponse = await fetch('https://keen-entremet-44c295.netlify.app/edge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer AIzaSyChhhk3gxhgItTUe4qQ_2WKj3wU1i5R11o`
        },
        body: JSON.stringify({
          message: message || '你好',
          context: "你是一个专业的志愿者管理平台AI助手"
        })
      })
      
      if (externalResponse.ok) {
        const data = await externalResponse.json()
        setApiStatus(prev => ({ ...prev, external: 'success' }))
        setResponse(prev => prev + `✅ 外部API成功: ${data?.response || data?.message || '无响应内容'}\n\n`)
      } else {
        throw new Error(`HTTP ${externalResponse.status}`)
      }
    } catch (error) {
      setApiStatus(prev => ({ ...prev, external: 'failed' }))
      setResponse(prev => prev + `❌ 外部API失败: ${error instanceof Error ? error.message : '未知错误'}\n`)
      
      // 测试本地API作为备用
      setResponse(prev => prev + '2. 外部API失败，测试本地备用API...\n')
      try {
        const localResponse = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message || '你好',
            context: "你是一个专业的志愿者管理平台AI助手"
          })
        })
        
        if (localResponse.ok) {
          const data = await localResponse.json()
          setApiStatus(prev => ({ ...prev, local: 'success' }))
          setResponse(prev => prev + `✅ 本地API成功: ${data?.response || '无响应内容'}\n`)
        } else {
          throw new Error(`HTTP ${localResponse.status}`)
        }
      } catch (localError) {
        setApiStatus(prev => ({ ...prev, local: 'failed' }))
        setResponse(prev => prev + `❌ 本地API也失败: ${localError instanceof Error ? localError.message : '未知错误'}\n`)
      }
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">AI API 测试页面</h1>
        
        {/* 状态指示器 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API 状态</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                apiStatus.external === 'success' ? 'bg-green-500' :
                apiStatus.external === 'failed' ? 'bg-red-500' : 'bg-gray-300'
              }`}></div>
              <span>外部 Gemini API</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                apiStatus.local === 'success' ? 'bg-green-500' :
                apiStatus.local === 'failed' ? 'bg-red-500' : 'bg-gray-300'
              }`}></div>
              <span>本地 AI API</span>
            </div>
          </div>
        </div>

        {/* 测试输入 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">测试输入</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                测试消息
              </label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="输入测试消息（默认：你好）"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={testExternalApi}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                测试外部API
              </button>
              <button
                onClick={testLocalApi}
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
              >
                测试本地API
              </button>
              <button
                onClick={testFullFlow}
                disabled={loading}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50"
              >
                测试完整流程
              </button>
            </div>
          </div>
        </div>

        {/* 响应结果 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">响应结果</h2>
          <div className="bg-gray-100 rounded-md p-4 min-h-[200px]">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span>测试中...</span>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap text-sm text-gray-800">
                {response || '点击上方按钮开始测试'}
              </pre>
            )}
          </div>
        </div>

        {/* API 信息 */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">API 信息</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>外部API:</strong> https://keen-entremet-44c295.netlify.app/edge</p>
            <p><strong>本地API:</strong> /api/ai/chat</p>
            <p><strong>API Key:</strong> AIzaSyChhhk3gxhgItTUe4qQ_2WKj3wU1i5R11o</p>
          </div>
        </div>
      </div>
    </div>
  )
}
