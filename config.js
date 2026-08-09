// 配置文件 - 多卡片配置系统，支持最新AI模型 (2026年8月更新)
// 参考文档: https://models.dev
module.exports = {
  // 预定义的 API 提供商模板
  providerTemplates: {
    // ========== DeepSeek ==========
    deepseek: {
      name: 'DeepSeek',
      icon: 'deepseek',
      brandColor: '#0066FF',
      defaultApiUrl: 'https://api.deepseek.com/v1/chat/completions',
      models: [
        {
          id: 'deepseek-v4-flash',
          name: 'DeepSeek V4 Flash',
          description: '最新V4快速版，增强代理能力，百万级上下文',
          contextLength: '1M',
          maxOutput: '16K',
          supportsVision: true,
          recommended: true,
          isNew: true
        },
        {
          id: 'deepseek-v4-pro',
          name: 'DeepSeek V4 Pro',
          description: '最新V4旗舰版，开源MoE，百万级上下文',
          contextLength: '1M',
          maxOutput: '16K',
          supportsVision: true,
          isNew: true
        }
      ],
      defaultModel: 'deepseek-v4-flash',
      authType: 'bearer',
      pricing: {
        note: '查看 DeepSeek 官网获取最新定价'
      }
    },

    // ========== Google Gemini ==========
    gemini: {
      name: 'Google Gemini',
      icon: 'gemini',
      brandColor: '#4285F4',
      defaultApiUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
      models: [
        // ===== Gemini 3.5 系列 (最新) =====
        {
          id: 'gemini-3.5-flash',
          name: '⭐ Gemini 3.5 Flash',
          description: '最新快速模型，平衡多模态推理与速度',
          contextLength: '1M',
          maxOutput: '64K',
          supportsVision: true,
          recommended: true,
          isNew: true
        },
        {
          id: 'gemini-3.5-flash-lite',
          name: 'Gemini 3.5 Flash Lite',
          description: '最新轻量版，最快速最具成本效益',
          contextLength: '1M',
          maxOutput: '64K',
          supportsVision: true,
          isNew: true
        },
        // ===== Gemini 3 系列 =====
        {
          id: 'gemini-3-pro-preview',
          name: 'Gemini 3 Pro',
          description: '强大推理模型，支持文本/图片/视频/音频',
          contextLength: '1M',
          maxOutput: '64K',
          supportsVision: true,
          supportsAudio: true,
          supportsVideo: true
        },
        {
          id: 'gemini-3-flash-preview',
          name: 'Gemini 3 Flash',
          description: '智能快速模型，速度与智能兼备',
          contextLength: '1M',
          maxOutput: '64K',
          supportsVision: true,
          supportsAudio: true
        },
        {
          id: 'gemini-3-pro-image-preview',
          name: 'Gemini 3 Pro Image',
          description: '图像生成专用，支持高质量图片输出',
          contextLength: '64K',
          maxOutput: '32K',
          supportsVision: true,
          supportsImageGen: true
        },
        // ===== Gemini 2.5 系列 =====
        {
          id: 'gemini-2.5-pro',
          name: 'Gemini 2.5 Pro',
          description: '强大推理，200万tokens上下文，擅长编码',
          contextLength: '2M',
          maxOutput: '64K',
          supportsVision: true,
          isReasoner: true
        },
        {
          id: 'gemini-2.5-flash',
          name: 'Gemini 2.5 Flash',
          description: '均衡模型，100万tokens上下文，支持视觉',
          contextLength: '1M',
          maxOutput: '64K',
          supportsVision: true
        },
        {
          id: 'gemini-2.5-flash-lite',
          name: 'Gemini 2.5 Flash Lite',
          description: '轻量版，最快速最具成本效益',
          contextLength: '1M',
          maxOutput: '64K',
          supportsVision: true
        }
      ],
      defaultModel: 'gemini-2.5-flash',
      authType: 'query',
      pricing: {
        note: '免费额度：每分钟15次请求，付费后无限制',
        free: '每分钟15请求 (RPM)',
        paid: '查看 Google AI Studio'
      }
    },

    // ========== OpenAI ==========
    openai: {
      name: 'OpenAI',
      icon: 'openai',
      brandColor: '#10A37F',
      defaultApiUrl: 'https://api.openai.com/v1/chat/completions',
      models: [
        // ===== GPT-5 系列 (最新) =====
        {
          id: 'gpt-5',
          name: '⭐ GPT-5',
          description: '最新旗舰模型，复杂专业任务',
          contextLength: '256K',
          maxOutput: '64K',
          supportsVision: true,
          recommended: true,
          isNew: true
        },
        {
          id: 'gpt-5-mini',
          name: 'GPT-5 Mini',
          description: 'GPT-5轻量版，快速高效',
          contextLength: '256K',
          maxOutput: '64K',
          supportsVision: true,
          isNew: true
        },
        // ===== GPT-4.1 系列 =====
        {
          id: 'gpt-4.1',
          name: 'GPT-4.1',
          description: '新一代GPT-4，编码与代理任务优化',
          contextLength: '1M',
          maxOutput: '32K',
          supportsVision: true,
          isNew: true
        },
        {
          id: 'gpt-4.1-mini',
          name: 'GPT-4.1 Mini',
          description: 'GPT-4.1轻量版，性价比高',
          contextLength: '1M',
          maxOutput: '32K',
          supportsVision: true,
          isNew: true
        },
        {
          id: 'gpt-4.1-nano',
          name: 'GPT-4.1 Nano',
          description: '超轻量版，分类路由等简单任务',
          contextLength: '1M',
          maxOutput: '32K',
          isNew: true
        },
        // ===== GPT-4o 系列 =====
        {
          id: 'gpt-4o',
          name: 'GPT-4o',
          description: '多模态旗舰，128K上下文',
          contextLength: '128K',
          maxOutput: '16K',
          supportsVision: true
        },
        {
          id: 'gpt-4o-mini',
          name: 'GPT-4o Mini',
          description: '快速高效，128K上下文，性价比高',
          contextLength: '128K',
          maxOutput: '16K',
          supportsVision: true
        },
        // ===== o系列推理模型 =====
        {
          id: 'o3-pro',
          name: '🧠 o3 Pro',
          description: '最强推理模型，高难度技术推理',
          contextLength: '200K',
          maxOutput: '100K',
          supportsVision: true,
          isReasoner: true,
          isNew: true
        },
        {
          id: 'o4-mini',
          name: 'o4 Mini',
          description: '最新轻量推理模型，快速高效',
          contextLength: '200K',
          maxOutput: '100K',
          supportsVision: true,
          isReasoner: true,
          isNew: true
        },
        {
          id: 'o3-mini',
          name: 'o3 Mini',
          description: '经济推理模型，速度更快',
          contextLength: '200K',
          maxOutput: '100K',
          supportsVision: true,
          isReasoner: true
        },
        {
          id: 'o1',
          name: 'o1',
          description: '深度推理模型，擅长复杂问题分析',
          contextLength: '200K',
          maxOutput: '100K',
          supportsVision: true,
          isReasoner: true
        }
      ],
      defaultModel: 'gpt-4o',
      authType: 'bearer',
      pricing: {
        note: '查看 OpenAI 官网获取最新定价'
      }
    },

    // ========== Anthropic Claude ==========
    claude: {
      name: 'Anthropic Claude',
      icon: 'claude',
      brandColor: '#D97706',
      defaultApiUrl: 'https://api.anthropic.com/v1/messages',
      models: [
        {
          id: 'claude-opus-5',
          name: '🧠 Claude Opus 5',
          description: '最强Claude模型，编码代理与复杂推理',
          contextLength: '200K',
          maxOutput: '64K',
          supportsVision: true,
          isReasoner: true,
          isNew: true
        },
        {
          id: 'claude-sonnet-5',
          name: '⭐ Claude Sonnet 5',
          description: '新一代Claude，编码规划与日常代理',
          contextLength: '200K',
          maxOutput: '64K',
          supportsVision: true,
          recommended: true,
          isNew: true
        },
        {
          id: 'claude-sonnet-4-6',
          name: 'Claude Sonnet 4.6',
          description: '主力工作模型，编码分析与代理',
          contextLength: '200K',
          maxOutput: '64K',
          supportsVision: true
        },
        {
          id: 'claude-opus-4-8',
          name: 'Claude Opus 4.8',
          description: '高端推理模型，复杂编码与规划',
          contextLength: '200K',
          maxOutput: '64K',
          supportsVision: true,
          isReasoner: true
        },
        {
          id: 'claude-haiku-4-5',
          name: 'Claude Haiku 4.5',
          description: '快速轻量模型，实时交互与简单任务',
          contextLength: '200K',
          maxOutput: '64K',
          supportsVision: true
        }
      ],
      defaultModel: 'claude-sonnet-4-6',
      authType: 'anthropic',
      pricing: {
        note: '查看 Anthropic 官网获取最新定价'
      }
    },

    // ========== 硅基流动 (SiliconFlow) ==========
    siliconflow: {
      name: '硅基流动',
      icon: 'siliconflow',
      brandColor: '#8B5CF6',
      defaultApiUrl: 'https://api.siliconflow.cn/v1/chat/completions',
      models: [
        {
          id: 'Qwen/Qwen3.5-27B',
          name: '⭐ Qwen3.5 27B',
          description: '最新通义千问，多模态视觉语言模型',
          contextLength: '262K',
          maxOutput: '32K',
          supportsVision: true,
          recommended: true,
          isNew: true
        },
        {
          id: 'Qwen/Qwen3-Coder-30B-A3B-Instruct',
          name: 'Qwen3 Coder 30B',
          description: '代码专用模型，软件代理与仓库编辑',
          contextLength: '262K',
          maxOutput: '32K',
          isNew: true
        },
        {
          id: 'zai-org/GLM-5',
          name: 'GLM-5',
          description: '智谱最新旗舰，混合推理与编码',
          contextLength: '205K',
          maxOutput: '32K',
          isNew: true
        },
        {
          id: 'zai-org/GLM-5.2',
          name: 'GLM-5.2',
          description: '智谱开源旗舰，百万级上下文编码代理',
          contextLength: '1M',
          maxOutput: '32K',
          isNew: true
        },
        {
          id: 'deepseek-ai/DeepSeek-V4-Flash',
          name: 'DeepSeek V4 Flash',
          description: 'DeepSeek V4快速版，增强代理能力',
          contextLength: '1M',
          maxOutput: '16K',
          isNew: true
        },
        {
          id: 'deepseek-ai/DeepSeek-V4-Pro',
          name: 'DeepSeek V4 Pro',
          description: 'DeepSeek V4旗舰版，百万级上下文',
          contextLength: '1M',
          maxOutput: '16K',
          isNew: true
        }
      ],
      defaultModel: 'Qwen/Qwen3.5-27B',
      authType: 'bearer',
      pricing: {
        note: '查看硅基流动官网获取最新定价'
      }
    },

    // ========== 零一万物 (Yi) ==========
    yi: {
      name: '零一万物 Yi',
      icon: 'yi',
      brandColor: '#0EA5E9',
      defaultApiUrl: 'https://api.lingyiwanwu.com/v1/chat/completions',
      models: [
        { 
          id: 'yi-lightning', 
          name: 'Yi Lightning', 
          description: '最快速的Yi模型，实时响应',
          contextLength: '16K',
          maxOutput: '4K',
          recommended: true
        },
        { 
          id: 'yi-large', 
          name: 'Yi Large', 
          description: '大规模模型，复杂任务',
          contextLength: '32K',
          maxOutput: '8K'
        },
        { 
          id: 'yi-medium', 
          name: 'Yi Medium', 
          description: '均衡模型，通用任务',
          contextLength: '16K',
          maxOutput: '4K'
        }
      ],
      defaultModel: 'yi-lightning',
      authType: 'bearer'
    },

    // ========== 月之暗面 (Moonshot/Kimi) ==========
    moonshot: {
      name: '月之暗面 Kimi',
      icon: 'moonshot',
      brandColor: '#6366F1',
      defaultApiUrl: 'https://api.moonshot.cn/v1/chat/completions',
      models: [
        {
          id: 'kimi-k3',
          name: '⭐ Kimi K3',
          description: '最新旗舰模型，百万级上下文，多模态代理',
          contextLength: '1M',
          maxOutput: '64K',
          supportsVision: true,
          recommended: true,
          isNew: true
        },
        {
          id: 'kimi-k2.7-code',
          name: 'Kimi K2.7 Code',
          description: '代码专用模型，软件代理与仓库编辑',
          contextLength: '262K',
          maxOutput: '32K',
          isNew: true
        },
        {
          id: 'kimi-k2.6',
          name: 'Kimi K2.6',
          description: '多模态代理模型，视觉理解与编码',
          contextLength: '262K',
          maxOutput: '32K',
          supportsVision: true,
          isNew: true
        },
        {
          id: 'kimi-k2.5',
          name: 'Kimi K2.5',
          description: '均衡模型，多模态代理与编码',
          contextLength: '262K',
          maxOutput: '32K',
          supportsVision: true,
          isNew: true
        }
      ],
      defaultModel: 'kimi-k3',
      authType: 'bearer',
      pricing: {
        note: '查看月之暗面官网获取最新定价'
      }
    },

    // ========== 智谱 (Zhipu) ==========
    zhipu: {
      name: '智谱 GLM',
      icon: 'zhipu',
      brandColor: '#2563EB',
      defaultApiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      models: [
        {
          id: 'glm-5',
          name: '⭐ GLM-5',
          description: '最新旗舰模型，混合推理与编码代理',
          contextLength: '205K',
          maxOutput: '32K',
          supportsVision: true,
          recommended: true,
          isNew: true
        },
        {
          id: 'glm-5.1',
          name: 'GLM-5.1',
          description: '编码专用模型，代理工程与终端任务',
          contextLength: '200K',
          maxOutput: '32K',
          isNew: true
        },
        {
          id: 'glm-5.2',
          name: 'GLM-5.2',
          description: '开源旗舰，百万级上下文编码代理',
          contextLength: '1M',
          maxOutput: '32K',
          isNew: true
        },
        {
          id: 'glm-5v-turbo',
          name: 'GLM-5V Turbo',
          description: '视觉快速模型，截图文档与多模态理解',
          contextLength: '200K',
          maxOutput: '32K',
          supportsVision: true,
          isNew: true
        },
        {
          id: 'glm-4.7-flash',
          name: 'GLM-4.7 Flash',
          description: '经济快速模型，日常编码与路由',
          contextLength: '200K',
          maxOutput: '32K',
          isNew: true
        }
      ],
      defaultModel: 'glm-5',
      authType: 'bearer',
      pricing: {
        note: '查看智谱官网获取最新定价'
      }
    },

    // ========== Groq ==========
    groq: {
      name: 'Groq',
      icon: 'groq',
      brandColor: '#F55036',
      defaultApiUrl: 'https://api.groq.com/openai/v1/chat/completions',
      models: [
        {
          id: 'llama-3.3-70b-versatile',
          name: '⭐ Llama 3.3 70B',
          description: '最新Llama，极速响应，128K上下文',
          contextLength: '128K',
          maxOutput: '32K',
          recommended: true
        },
        {
          id: 'qwen/qwen3.6-27b',
          name: 'Qwen3.6 27B',
          description: '通义千问最新版，多模态视觉语言模型',
          contextLength: '262K',
          maxOutput: '32K',
          supportsVision: true,
          isNew: true
        },
        {
          id: 'llama-3.1-8b-instant',
          name: 'Llama 3.1 8B Instant',
          description: '超快速轻量模型，实时响应',
          contextLength: '128K',
          maxOutput: '8K',
          isNew: true
        }
      ],
      defaultModel: 'llama-3.3-70b-versatile',
      authType: 'bearer',
      pricing: {
        note: 'Groq 提供免费 API，速度极快'
      }
    },

    // ========== 自定义 API / 中转站 ==========
    custom: {
      name: '自定义 API',
      icon: 'custom',
      brandColor: '#6B7280',
      defaultApiUrl: 'https://your-api-endpoint.com/v1/chat/completions',
      models: [
        // ===== OpenAI 系列（中转站最常用）=====
        {
          id: 'gpt-5',
          name: '⭐ GPT-5',
          description: 'OpenAI 最新旗舰，中转站最常用',
          recommended: true,
          isNew: true
        },
        {
          id: 'gpt-4.1',
          name: 'GPT-4.1',
          description: '新一代GPT-4，编码与代理优化',
          isNew: true
        },
        {
          id: 'gpt-4o',
          name: 'GPT-4o',
          description: '多模态旗舰，128K上下文'
        },
        {
          id: 'gpt-4o-mini',
          name: 'GPT-4o Mini',
          description: '性价比高，速度快'
        },
        // ===== Claude 系列 =====
        {
          id: 'claude-sonnet-5',
          name: 'Claude Sonnet 5',
          description: '新一代Claude，编码规划与代理',
          isNew: true
        },
        {
          id: 'claude-sonnet-4-6',
          name: 'Claude Sonnet 4.6',
          description: 'Anthropic 主力模型'
        },
        // ===== DeepSeek 系列 =====
        {
          id: 'deepseek-v4-flash',
          name: 'DeepSeek V4 Flash',
          description: '最新V4快速版，百万级上下文',
          isNew: true
        },
        {
          id: 'deepseek-v4-pro',
          name: 'DeepSeek V4 Pro',
          description: '最新V4旗舰版',
          isNew: true
        },
        // ===== 其他常用 =====
        {
          id: 'glm-5',
          name: 'GLM-5',
          description: '智谱最新旗舰',
          isNew: true
        },
        {
          id: 'kimi-k3',
          name: 'Kimi K3',
          description: '月之暗面最新旗舰',
          isNew: true
        },
        // ===== 自定义输入 =====
        {
          id: '__custom_input__',
          name: '📝 手动输入模型 ID...',
          description: '输入中转站支持的任意模型',
          isCustomInput: true
        }
      ],
      defaultModel: 'gpt-4o',
      authType: 'bearer',
      allowCustomModel: true
    }
  },
  
  // Markdown 保存路径配置
  markdown: {
    savePath: './conversations',
  },
  
  // 窗口配置
  window: {
    petWidth: 200,
    petHeight: 200,
    chatWidth: 900,
    chatHeight: 950,
    settingsWidth: 950,  // 稍微增大以容纳更多内容
    settingsHeight: 700
  },

  // 模型能力标签
  modelTags: {
    supportsVision: '👁️ 视觉',
    supportsAudio: '🎵 音频',
    supportsVideo: '🎬 视频',
    supportsImageGen: '🖼️ 图像生成',
    isReasoner: '🧠 推理',
    isNew: '🆕 新',
    recommended: '⭐ 推荐'
  }
};
