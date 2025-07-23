import { NextRequest, NextResponse } from 'next/server';

// AI API配置 - 支持多个AI服务
const GEMINI_API_KEY = 'AIzaSyChhhk3gxhgItTUe4qQ_2WKj3wU1i5R11o';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// 科大讯飞 Spark Lite API配置
const SPARK_API_PASSWORD = 'PpflDIFTksYbYrcxfFAl:diYXoAAwkKKhXbFAUgfG';
const SPARK_API_URL = 'https://spark-api-open.xf-yun.com/v1/chat/completions';
const SPARK_APPID = '314a3cdd';
const SPARK_API_SECRET = 'ZjAzZTNkY2Y3MWEzMTc4YWI2NzVlYjA5';
const SPARK_API_KEY = 'de41865b6b8e7eae01ea51c65ee7f564';

// 调用科大讯飞 Spark Lite API
async function callSparkLiteAI(message: string, context: string, conversationHistory: any[] = []): Promise<string> {
  try {
    // 构建完整的对话历史
    const messages = [
      {
        role: 'system',
        content: context
      }
    ];

    // 添加历史对话（最多保留最近10轮对话以控制token数量）
    const recentHistory = conversationHistory.slice(-10);
    messages.push(...recentHistory);

    // 添加当前用户消息
    messages.push({
      role: 'user',
      content: message
    });

    const requestBody = {
      model: 'lite',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 0.9,
      stream: false
    };

    const response = await fetch(SPARK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${SPARK_API_PASSWORD}`
      },
      body: JSON.stringify(requestBody),
      // 添加超时设置
      signal: AbortSignal.timeout(30000) // 30秒超时
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Spark Lite API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    } else {
      throw new Error('Invalid response format from Spark Lite API');
    }
  } catch (error) {
    console.error('科大讯飞 Spark Lite API调用失败:', error);
    throw error;
  }
}

// 调用Google Gemini AI
async function callGeminiAI(message: string, context: string): Promise<string> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${context}\n\n用户问题: ${message}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
      // 添加超时设置
      signal: AbortSignal.timeout(15000) // 15秒超时
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response format from Gemini API');
    }
  } catch (error) {
    console.error('Gemini API调用失败:', error);
    throw error;
  }
}

// 备用的专业知识库（当AI API失败时使用）
const knowledgeBase: Record<string, string> = {
  "如何提高志愿者参与度？": "提高志愿者参与度的关键策略包括：\n\n1. **建立清晰的使命愿景** - 让志愿者了解他们工作的意义和价值\n2. **提供多样化的参与方式** - 根据志愿者的时间、技能和兴趣提供不同的机会\n3. **完善培训体系** - 为志愿者提供必要的技能培训和发展机会\n4. **建立激励机制** - 通过表彰、证书、推荐信等方式认可志愿者的贡献\n5. **营造良好氛围** - 创建支持性的团队环境，促进志愿者之间的交流\n6. **定期沟通反馈** - 保持与志愿者的定期联系，听取他们的意见和建议\n\n这些措施能够有效提升志愿者的参与热情和持续性。",
  
  "志愿活动的最佳实践是什么？": "志愿活动的最佳实践包括以下几个方面：\n\n**规划阶段：**\n- 明确活动目标和预期成果\n- 进行需求评估和资源分析\n- 制定详细的活动计划和时间表\n\n**招募阶段：**\n- 清晰描述志愿者角色和要求\n- 多渠道发布招募信息\n- 建立有效的筛选和匹配机制\n\n**执行阶段：**\n- 提供充分的岗前培训\n- 建立明确的沟通渠道\n- 确保必要的安全保障措施\n\n**管理阶段：**\n- 建立志愿者档案管理系统\n- 定期进行活动评估和反馈\n- 维护长期的志愿者关系\n\n**后续跟进：**\n- 及时表彰和感谢志愿者\n- 收集活动效果数据\n- 总结经验教训，持续改进",
  
  "如何管理大型志愿活动？": "管理大型志愿活动需要系统性的方法：\n\n**1. 组织架构设计**\n- 建立清晰的管理层级\n- 设置专门的协调小组\n- 明确各级责任和权限\n\n**2. 人员管理**\n- 分组管理，每组设置组长\n- 建立志愿者信息数据库\n- 制定详细的岗位说明书\n\n**3. 沟通协调**\n- 建立多层次沟通机制\n- 使用统一的沟通平台\n- 定期召开协调会议\n\n**4. 资源配置**\n- 合理分配人力资源\n- 确保物资供应充足\n- 建立应急预案\n\n**5. 质量控制**\n- 建立服务标准和流程\n- 实施现场监督检查\n- 及时处理突发情况\n\n**6. 技术支持**\n- 使用志愿者管理系统\n- 建立实时信息反馈机制\n- 确保通讯设备正常运行",
  
  "志愿者培训的重点内容？": "志愿者培训应该涵盖以下重点内容：\n\n**基础培训：**\n- 组织使命、愿景和价值观\n- 志愿服务的意义和原则\n- 基本的服务礼仪和沟通技巧\n\n**专业技能培训：**\n- 岗位相关的专业知识\n- 实际操作技能演练\n- 问题处理和应急响应\n\n**安全培训：**\n- 安全操作规程\n- 个人防护措施\n- 紧急情况处理流程\n\n**团队协作：**\n- 团队合作技巧\n- 有效沟通方法\n- 冲突解决策略\n\n**服务对象了解：**\n- 服务对象的特点和需求\n- 文化敏感性培训\n- 隐私保护和伦理要求\n\n**持续发展：**\n- 个人成长规划\n- 进阶培训机会\n- 领导力发展项目\n\n培训应该采用理论与实践相结合的方式，确保志愿者能够胜任工作并获得成长。"
};

// 智能回复生成函数
function generateIntelligentResponse(userInput: string): string {
  const input = userInput.toLowerCase();
  
  // 1. 问候语识别
  if (input.includes('你好') || input.includes('hello') || input.includes('hi') || input.includes('您好')) {
    return "您好！我是您的AI智能助手，专门为志愿者管理平台提供专业咨询服务。我可以帮助您解决以下问题：\n\n• 志愿者招募和管理策略\n• 志愿活动的组织和执行\n• 志愿者培训和发展\n• 平台运营和优化建议\n• 数据分析和效果评估\n\n请告诉我您需要什么帮助，我会为您提供专业的建议和解决方案。";
  }
  
  // 2. 志愿者参与度相关
  if (input.includes('参与度') || input.includes('积极性') || input.includes('热情') || input.includes('活跃')) {
    return knowledgeBase["如何提高志愿者参与度？"];
  }
  
  // 3. 活动管理相关
  if (input.includes('活动') && (input.includes('管理') || input.includes('组织') || input.includes('策划') || input.includes('执行'))) {
    if (input.includes('大型') || input.includes('大规模')) {
      return knowledgeBase["如何管理大型志愿活动？"];
    } else {
      return knowledgeBase["志愿活动的最佳实践是什么？"];
    }
  }
  
  // 4. 培训相关
  if (input.includes('培训') || input.includes('教育') || input.includes('学习') || input.includes('技能')) {
    return knowledgeBase["志愿者培训的重点内容？"];
  }
  
  // 5. 招募相关
  if (input.includes('招募') || input.includes('招聘') || input.includes('吸引') || input.includes('寻找')) {
    return "志愿者招募的有效策略包括：\n\n**1. 多渠道宣传**\n- 社交媒体平台推广\n- 校园和社区宣传\n- 合作伙伴推荐\n- 线上线下活动结合\n\n**2. 明确价值主张**\n- 突出志愿服务的意义\n- 展示个人成长机会\n- 提供技能发展平台\n- 建立社交网络\n\n**3. 简化报名流程**\n- 优化注册界面\n- 减少必填信息\n- 提供多种报名方式\n- 及时确认和反馈\n\n**4. 精准定位**\n- 分析目标群体特征\n- 制定针对性策略\n- 选择合适的宣传渠道\n- 调整宣传内容和语调";
  }
  
  // 6. 激励机制相关
  if (input.includes('激励') || input.includes('奖励') || input.includes('表彰') || input.includes('认可')) {
    return "建立有效的志愿者激励机制：\n\n**精神激励：**\n- 定期表彰优秀志愿者\n- 颁发荣誉证书和奖状\n- 在平台上展示志愿者故事\n- 组织志愿者交流分享会\n\n**成长激励：**\n- 提供技能培训机会\n- 安排进阶责任岗位\n- 推荐参加相关会议\n- 建立志愿者发展路径\n\n**社交激励：**\n- 组织团队建设活动\n- 创建志愿者社群\n- 举办联谊聚会\n- 建立导师制度\n\n**实用激励：**\n- 提供交通补贴\n- 免费提供工作餐\n- 赠送纪念品\n- 优先参与特殊活动";
  }
  
  // 7. 沟通管理相关
  if (input.includes('沟通') || input.includes('交流') || input.includes('协调') || input.includes('联系')) {
    return "优化志愿者沟通管理：\n\n**建立多层次沟通体系：**\n- 管理层与志愿者直接沟通\n- 小组长负责日常协调\n- 建立志愿者代表制度\n- 设置意见反馈渠道\n\n**选择合适的沟通工具：**\n- 微信群用于日常交流\n- 邮件用于正式通知\n- 视频会议用于重要讨论\n- 管理平台用于任务分配\n\n**制定沟通规范：**\n- 明确沟通频率和时间\n- 统一信息发布格式\n- 建立紧急联系机制\n- 定期收集反馈意见\n\n**提升沟通效果：**\n- 使用清晰简洁的语言\n- 及时回应志愿者问题\n- 主动分享相关信息\n- 营造开放包容的氛围";
  }
  
  // 8. 数据分析相关
  if (input.includes('数据') || input.includes('分析') || input.includes('统计') || input.includes('报告')) {
    return "志愿者管理数据分析要点：\n\n**关键指标监控：**\n- 志愿者注册和活跃度\n- 活动参与率和完成率\n- 志愿服务时长统计\n- 志愿者满意度调查\n\n**数据收集方法：**\n- 平台自动记录行为数据\n- 定期发放调查问卷\n- 组织焦点小组讨论\n- 收集活动反馈表\n\n**分析维度：**\n- 时间趋势分析\n- 地域分布分析\n- 年龄群体分析\n- 技能匹配分析\n\n**应用场景：**\n- 优化招募策略\n- 改进活动设计\n- 调整培训内容\n- 制定激励政策";
  }
  
  // 9. 问题解决相关
  if (input.includes('问题') || input.includes('困难') || input.includes('挑战') || input.includes('解决')) {
    return "常见志愿者管理问题及解决方案：\n\n**志愿者流失率高：**\n- 分析流失原因\n- 改善志愿体验\n- 加强情感联系\n- 提供成长机会\n\n**活动组织混乱：**\n- 制定标准流程\n- 明确责任分工\n- 加强事前培训\n- 建立应急预案\n\n**沟通效率低下：**\n- 优化沟通渠道\n- 统一信息格式\n- 定期召开会议\n- 建立反馈机制\n\n**志愿者技能不匹配：**\n- 完善技能评估\n- 提供针对性培训\n- 灵活调整岗位\n- 建立技能库";
  }
  
  // 10. 平台功能相关
  if (input.includes('平台') || input.includes('系统') || input.includes('功能') || input.includes('操作')) {
    return "志愿者管理平台功能优化建议：\n\n**用户体验优化：**\n- 简化注册登录流程\n- 优化界面设计和布局\n- 提供移动端适配\n- 加强搜索和筛选功能\n\n**功能模块完善：**\n- 志愿者档案管理\n- 活动发布和报名\n- 时长记录和统计\n- 证书生成和下载\n\n**数据管理：**\n- 建立完整的数据库\n- 实现数据实时同步\n- 提供数据导出功能\n- 确保数据安全性\n\n**智能化功能：**\n- 智能匹配推荐\n- 自动化消息提醒\n- 数据分析报告\n- AI客服支持";
  }
  
  // 11. 默认智能回答
  const keywords = ['志愿者', '活动', '管理', '培训', '招募', '激励', '沟通', '数据', '平台', '问题', '解决', '优化', '提升', '改进'];
  const foundKeywords = keywords.filter(keyword => userInput.includes(keyword));
  
  if (foundKeywords.length > 0) {
    return `关于"${userInput}"这个问题，基于您提到的关键信息，我建议您可以从以下几个方面考虑：\n\n1. **需求分析** - 深入了解具体需求和目标\n2. **资源评估** - 分析现有的人力、物力和时间资源\n3. **方案制定** - 制定详细的实施计划和时间表\n4. **风险管控** - 识别可能的风险并制定应对措施\n5. **效果评估** - 建立评估机制，及时调整策略\n\n如果您能提供更多具体信息，比如：\n• 您面临的具体情况\n• 希望达成的目标\n• 现有的资源条件\n• 遇到的主要困难\n\n我可以为您提供更精准、更实用的解决方案。`;
  }
  
  return "感谢您的提问！作为专业的志愿者管理AI助手，我很乐意为您提供帮助。\n\n为了给您最准确的建议，请您详细描述一下：\n• 您当前面临的具体问题\n• 您希望达成的目标\n• 您的组织规模和资源情况\n\n这样我就能为您提供更有针对性的专业建议了。您也可以尝试问我关于志愿者招募、活动组织、培训管理、激励机制等方面的问题。";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context, conversationHistory = [] } = body;

    if (!message) {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 });
    }

    let response: string;
    let aiSource = 'fallback';
    const defaultContext = context || "你是一个专业的志愿者管理平台AI助手，专门帮助管理员解决志愿者管理、活动组织、用户管理等相关问题。请用中文回答，语言要专业且友好。";

    // 尝试多个AI服务，按优先级顺序

    // 1. 首先尝试科大讯飞 Spark Lite AI（国内服务，稳定可靠）
    try {
      console.log('🤖 尝试调用科大讯飞 Spark Lite AI...');
      response = await callSparkLiteAI(message, defaultContext, conversationHistory);
      aiSource = 'spark-lite';
      console.log('✅ 科大讯飞 Spark Lite AI调用成功');
    } catch (sparkError) {
      console.log('❌ 科大讯飞 Spark Lite AI调用失败:', sparkError);

      // 2. 如果Spark失败，尝试Google Gemini AI
      try {
        console.log('🤖 尝试调用Google Gemini AI...');
        response = await callGeminiAI(message, defaultContext);
        aiSource = 'gemini';
        console.log('✅ Google Gemini AI调用成功');
      } catch (geminiError) {
        console.log('❌ Google Gemini AI也失败，使用备用智能回复:', geminiError);
        response = generateIntelligentResponse(message);
        aiSource = 'fallback';
      }
    }

    return NextResponse.json({
      success: true,
      response: response,
      aiSource: aiSource,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Chat API Error:', error);

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// 处理OPTIONS请求（CORS预检）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
