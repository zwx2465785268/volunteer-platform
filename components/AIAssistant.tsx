'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 预设问题
  const presetQuestions = [
    "如何提高志愿者参与度？",
    "志愿活动的最佳实践是什么？",
    "如何管理大型志愿活动？",
    "志愿者培训的重点内容？"
  ]

  // 发送消息到AI API
  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      // 尝试调用真实的Gemini API
      let responseText = '';

      try {
        // 首先尝试外部Gemini API
        let response = await fetch('https://keen-entremet-44c295.netlify.app/edge', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer AIzaSyChhhk3gxhgItTUe4qQ_2WKj3wU1i5R11o`
          },
          body: JSON.stringify({
            message: content,
            context: "你是一个专业的志愿者管理平台AI助手。请根据用户的具体问题提供准确、实用的建议。如果用户问的是志愿者管理、活动组织、用户管理等相关问题，请给出专业的解答。如果是其他问题，也要尽力帮助用户。请用中文回答，语言要专业且友好。"
          })
        })

        if (response.ok) {
          const data = await response.json()
          responseText = data?.response || data?.message || data?.reply || data?.answer || '';
          console.log('✅ 外部Gemini API调用成功')
        } else {
          throw new Error(`外部API返回错误: ${response.status}`)
        }
      } catch (externalApiError) {
        console.log('❌ 外部Gemini API调用失败，尝试本地API:', externalApiError)

        // 准备对话历史（排除当前用户消息，只包含之前的对话）
        const conversationHistory = messages.slice(0, -1).map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));

        // 如果外部API失败，使用本地AI API
        try {
          const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: content,
              context: "你是一个专业的志愿者管理平台AI助手。请根据用户的具体问题提供准确、实用的建议。",
              conversationHistory: conversationHistory
            })
          })

          if (response.ok) {
            const data = await response.json()
            responseText = data?.response || '';
            console.log('✅ 本地AI API调用成功')
          } else {
            throw new Error(`本地API返回错误: ${response.status}`)
          }
        } catch (localApiError) {
          console.log('❌ 本地AI API也失败，使用离线智能回复:', localApiError)
        }
      }

      // 如果API调用失败或没有返回内容，使用智能回复系统
      if (!responseText) {
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
        responseText = generateIntelligentResponse(content)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseText,
        role: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('AI API Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，我现在遇到了一些技术问题，请稍后再试。如果问题持续存在，请联系技术支持。',
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  // 智能回复生成函数
  const generateIntelligentResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    // 预设的专业回答
    const responses: Record<string, string> = {
        "如何提高志愿者参与度？": "提高志愿者参与度的关键策略包括：\n\n1. **建立清晰的使命愿景** - 让志愿者了解他们工作的意义和价值\n2. **提供多样化的参与方式** - 根据志愿者的时间、技能和兴趣提供不同的机会\n3. **完善培训体系** - 为志愿者提供必要的技能培训和发展机会\n4. **建立激励机制** - 通过表彰、证书、推荐信等方式认可志愿者的贡献\n5. **营造良好氛围** - 创建支持性的团队环境，促进志愿者之间的交流\n6. **定期沟通反馈** - 保持与志愿者的定期联系，听取他们的意见和建议\n\n这些措施能够有效提升志愿者的参与热情和持续性。",
        
        "志愿活动的最佳实践是什么？": "志愿活动的最佳实践包括以下几个方面：\n\n**规划阶段：**\n- 明确活动目标和预期成果\n- 进行需求评估和资源分析\n- 制定详细的活动计划和时间表\n\n**招募阶段：**\n- 清晰描述志愿者角色和要求\n- 多渠道发布招募信息\n- 建立有效的筛选和匹配机制\n\n**执行阶段：**\n- 提供充分的岗前培训\n- 建立明确的沟通渠道\n- 确保必要的安全保障措施\n\n**管理阶段：**\n- 建立志愿者档案管理系统\n- 定期进行活动评估和反馈\n- 维护长期的志愿者关系\n\n**后续跟进：**\n- 及时表彰和感谢志愿者\n- 收集活动效果数据\n- 总结经验教训，持续改进",
        
        "如何管理大型志愿活动？": "管理大型志愿活动需要系统性的方法：\n\n**1. 组织架构设计**\n- 建立清晰的管理层级\n- 设置专门的协调小组\n- 明确各级责任和权限\n\n**2. 人员管理**\n- 分组管理，每组设置组长\n- 建立志愿者信息数据库\n- 制定详细的岗位说明书\n\n**3. 沟通协调**\n- 建立多层次沟通机制\n- 使用统一的沟通平台\n- 定期召开协调会议\n\n**4. 资源配置**\n- 合理分配人力资源\n- 确保物资供应充足\n- 建立应急预案\n\n**5. 质量控制**\n- 建立服务标准和流程\n- 实施现场监督检查\n- 及时处理突发情况\n\n**6. 技术支持**\n- 使用志愿者管理系统\n- 建立实时信息反馈机制\n- 确保通讯设备正常运行",
        
        "志愿者培训的重点内容？": "志愿者培训应该涵盖以下重点内容：\n\n**基础培训：**\n- 组织使命、愿景和价值观\n- 志愿服务的意义和原则\n- 基本的服务礼仪和沟通技巧\n\n**专业技能培训：**\n- 岗位相关的专业知识\n- 实际操作技能演练\n- 问题处理和应急响应\n\n**安全培训：**\n- 安全操作规程\n- 个人防护措施\n- 紧急情况处理流程\n\n**团队协作：**\n- 团队合作技巧\n- 有效沟通方法\n- 冲突解决策略\n\n**服务对象了解：**\n- 服务对象的特点和需求\n- 文化敏感性培训\n- 隐私保护和伦理要求\n\n**持续发展：**\n- 个人成长规划\n- 进阶培训机会\n- 领导力发展项目\n\n培训应该采用理论与实践相结合的方式，确保志愿者能够胜任工作并获得成长。"
    }

    // 智能关键词匹配和回答生成

    // 1. 问候语识别
    if (input.includes('你好') || input.includes('hello') || input.includes('hi') || input.includes('您好')) {
      return "您好！我是您的AI智能助手，专门为志愿者管理平台提供专业咨询服务。我可以帮助您解决以下问题：\n\n• 志愿者招募和管理策略\n• 志愿活动的组织和执行\n• 志愿者培训和发展\n• 平台运营和优化建议\n• 数据分析和效果评估\n\n请告诉我您需要什么帮助，我会为您提供专业的建议和解决方案。"
    }

    // 2. 志愿者参与度相关
    if (input.includes('参与度') || input.includes('积极性') || input.includes('热情') || input.includes('活跃')) {
      return responses["如何提高志愿者参与度？"]
    }

    // 3. 活动管理相关
    if (input.includes('活动') && (input.includes('管理') || input.includes('组织') || input.includes('策划') || input.includes('执行'))) {
      if (input.includes('大型') || input.includes('大规模')) {
        return responses["如何管理大型志愿活动？"]
      } else {
        return responses["志愿活动的最佳实践是什么？"]
      }
    }

    // 4. 培训相关
    if (input.includes('培训') || input.includes('教育') || input.includes('学习') || input.includes('技能')) {
      return responses["志愿者培训的重点内容？"]
    }

    // 5. 招募相关
    if (input.includes('招募') || input.includes('招聘') || input.includes('吸引') || input.includes('寻找')) {
      return "志愿者招募的有效策略包括：\n\n**1. 多渠道宣传**\n- 社交媒体平台推广\n- 校园和社区宣传\n- 合作伙伴推荐\n- 线上线下活动结合\n\n**2. 明确价值主张**\n- 突出志愿服务的意义\n- 展示个人成长机会\n- 提供技能发展平台\n- 建立社交网络\n\n**3. 简化报名流程**\n- 优化注册界面\n- 减少必填信息\n- 提供多种报名方式\n- 及时确认和反馈\n\n**4. 精准定位**\n- 分析目标群体特征\n- 制定针对性策略\n- 选择合适的宣传渠道\n- 调整宣传内容和语调"
    }

    // 6. 激励机制相关
    if (input.includes('激励') || input.includes('奖励') || input.includes('表彰') || input.includes('认可')) {
      return "建立有效的志愿者激励机制：\n\n**精神激励：**\n- 定期表彰优秀志愿者\n- 颁发荣誉证书和奖状\n- 在平台上展示志愿者故事\n- 组织志愿者交流分享会\n\n**成长激励：**\n- 提供技能培训机会\n- 安排进阶责任岗位\n- 推荐参加相关会议\n- 建立志愿者发展路径\n\n**社交激励：**\n- 组织团队建设活动\n- 创建志愿者社群\n- 举办联谊聚会\n- 建立导师制度\n\n**实用激励：**\n- 提供交通补贴\n- 免费提供工作餐\n- 赠送纪念品\n- 优先参与特殊活动"
    }

    // 7. 沟通管理相关
    if (input.includes('沟通') || input.includes('交流') || input.includes('协调') || input.includes('联系')) {
      return "优化志愿者沟通管理：\n\n**建立多层次沟通体系：**\n- 管理层与志愿者直接沟通\n- 小组长负责日常协调\n- 建立志愿者代表制度\n- 设置意见反馈渠道\n\n**选择合适的沟通工具：**\n- 微信群用于日常交流\n- 邮件用于正式通知\n- 视频会议用于重要讨论\n- 管理平台用于任务分配\n\n**制定沟通规范：**\n- 明确沟通频率和时间\n- 统一信息发布格式\n- 建立紧急联系机制\n- 定期收集反馈意见\n\n**提升沟通效果：**\n- 使用清晰简洁的语言\n- 及时回应志愿者问题\n- 主动分享相关信息\n- 营造开放包容的氛围"
    }

    // 8. 数据分析相关
    if (input.includes('数据') || input.includes('分析') || input.includes('统计') || input.includes('报告')) {
      return "志愿者管理数据分析要点：\n\n**关键指标监控：**\n- 志愿者注册和活跃度\n- 活动参与率和完成率\n- 志愿服务时长统计\n- 志愿者满意度调查\n\n**数据收集方法：**\n- 平台自动记录行为数据\n- 定期发放调查问卷\n- 组织焦点小组讨论\n- 收集活动反馈表\n\n**分析维度：**\n- 时间趋势分析\n- 地域分布分析\n- 年龄群体分析\n- 技能匹配分析\n\n**应用场景：**\n- 优化招募策略\n- 改进活动设计\n- 调整培训内容\n- 制定激励政策"
    }

    // 9. 问题解决相关
    if (input.includes('问题') || input.includes('困难') || input.includes('挑战') || input.includes('解决')) {
      return "常见志愿者管理问题及解决方案：\n\n**志愿者流失率高：**\n- 分析流失原因\n- 改善志愿体验\n- 加强情感联系\n- 提供成长机会\n\n**活动组织混乱：**\n- 制定标准流程\n- 明确责任分工\n- 加强事前培训\n- 建立应急预案\n\n**沟通效率低下：**\n- 优化沟通渠道\n- 统一信息格式\n- 定期召开会议\n- 建立反馈机制\n\n**志愿者技能不匹配：**\n- 完善技能评估\n- 提供针对性培训\n- 灵活调整岗位\n- 建立技能库"
    }

    // 10. 平台功能相关
    if (input.includes('平台') || input.includes('系统') || input.includes('功能') || input.includes('操作')) {
      return "志愿者管理平台功能优化建议：\n\n**用户体验优化：**\n- 简化注册登录流程\n- 优化界面设计和布局\n- 提供移动端适配\n- 加强搜索和筛选功能\n\n**功能模块完善：**\n- 志愿者档案管理\n- 活动发布和报名\n- 时长记录和统计\n- 证书生成和下载\n\n**数据管理：**\n- 建立完整的数据库\n- 实现数据实时同步\n- 提供数据导出功能\n- 确保数据安全性\n\n**智能化功能：**\n- 智能匹配推荐\n- 自动化消息提醒\n- 数据分析报告\n- AI客服支持"
    }

    // 11. 默认智能回答
    // 分析用户问题的关键词，提供相关建议
    const keywords = extractKeywords(userInput)
    if (keywords.length > 0) {
      return `关于"${userInput}"这个问题，基于您提到的关键信息，我建议您可以从以下几个方面考虑：\n\n1. **需求分析** - 深入了解具体需求和目标\n2. **资源评估** - 分析现有的人力、物力和时间资源\n3. **方案制定** - 制定详细的实施计划和时间表\n4. **风险管控** - 识别可能的风险并制定应对措施\n5. **效果评估** - 建立评估机制，及时调整策略\n\n如果您能提供更多具体信息，比如：\n• 您面临的具体情况\n• 希望达成的目标\n• 现有的资源条件\n• 遇到的主要困难\n\n我可以为您提供更精准、更实用的解决方案。`
    }

    return "感谢您的提问！作为专业的志愿者管理AI助手，我很乐意为您提供帮助。\n\n为了给您最准确的建议，请您详细描述一下：\n• 您当前面临的具体问题\n• 您希望达成的目标\n• 您的组织规模和资源情况\n\n这样我就能为您提供更有针对性的专业建议了。您也可以尝试问我关于志愿者招募、活动组织、培训管理、激励机制等方面的问题。"
  }

  // 提取关键词的辅助函数
  const extractKeywords = (text: string): string[] => {
    const keywords = ['志愿者', '活动', '管理', '培训', '招募', '激励', '沟通', '数据', '平台', '问题', '解决', '优化', '提升', '改进']
    return keywords.filter(keyword => text.includes(keyword))
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const clearChat = () => {
    setMessages([])
  }

  const handlePresetQuestion = (question: string) => {
    sendMessage(question)
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl overflow-hidden shadow-2xl border border-white/20">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">AI智能助手</h2>
              <p className="text-purple-100 text-sm">专业的志愿者管理顾问</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1 backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">在线</span>
            </div>
            <button
              onClick={clearChat}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200 backdrop-blur-sm"
              title="清空对话"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 聊天区域 */}
      <div className="flex-1 flex flex-col h-[calc(100vh-200px)]">
        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">欢迎使用AI智能助手</h3>
              <p className="text-gray-500 mb-6">我是您的专业志愿者管理顾问，可以帮助您解决各种管理问题</p>
              
              {/* 预设问题 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {presetQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handlePresetQuestion(question)}
                    className="p-4 bg-white hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 border border-gray-200 hover:border-purple-300 rounded-xl text-left transition-all duration-200 hover:shadow-md hover:scale-105"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{question}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* 头像 */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}>
                      {message.role === 'user' ? (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      )}
                    </div>
                    
                    {/* 消息气泡 */}
                    <div className={`relative px-4 py-3 rounded-2xl shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <div className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString('zh-CN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* 打字指示器 */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3 max-w-[80%]">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-4">
          <form onSubmit={handleSubmit} className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="输入您的问题..."
                disabled={isLoading}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white/90 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="flex items-center space-x-2">
                  {inputValue.trim() && (
                    <button
                      type="button"
                      onClick={() => setInputValue('')}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>发送中</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>发送</span>
                </>
              )}
            </button>
          </form>
          
          {/* 快捷提示 */}
          <div className="mt-3 flex items-center justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd>
              <span>发送消息</span>
            </div>
            <div className="flex items-center space-x-1">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Shift</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd>
              <span>换行</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
