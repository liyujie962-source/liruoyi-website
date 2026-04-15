const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // 确保在最顶部加载环境变量

const config = require('./config');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 静态文件与页面路由
app.use(express.static(path.join(__dirname)));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/chat.html', (req, res) => res.sendFile(path.join(__dirname, 'chat.html')));

// 对话记忆存储
const userSessions = new Map();

/**
 * 核心：调用豆包/火山大模型逻辑
 */
async function getXiaoyiReply(userId, userMessage, language = 'zh') {
    try {
        let history = userSessions.get(userId) || [];
        const targetLang = language === 'en' ? 'English' : '中文';

        // 构造 System Prompt
        const messages = [
            { 
                role: 'system', 
                content: config.BASE_PROMPT + `\n\n【强制指令：当前用户使用${targetLang}，请务必用${targetLang}简短回复。】` 
            },
            ...history,
            { role: 'user', content: userMessage }
        ];

        // 发送 POST 请求
        const response = await axios.post(config.DOUBAO_ENDPOINT, {
            model: config.DOUBAO_MODEL, // 使用环境变量中的 ep-xxxx
            messages: messages,
            temperature: 0.8,
            max_tokens: 500,
            stream: false
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.DOUBAO_API_KEY}` // 只需要这一个认证
            },
            timeout: 30000 // 增加到30秒防止超时
        });

        const reply = response.data.choices[0].message.content.trim();

        // 更新历史记录
        history.push({ role: 'user', content: userMessage });
        history.push({ role: 'assistant', content: reply });
        if (history.length > 20) history = history.slice(-20); // 限制记忆长度
        userSessions.set(userId, history);

        return { success: true, reply };

    } catch (error) {
        // --- 错误排查日志（在服务器控制台查看） ---
        console.error('--- 小怡接口调用失败排查 ---');
        if (error.response) {
            // 火山引擎返回的错误详情
            console.error('错误状态码:', error.response.status);
            console.error('火山详情:', JSON.stringify(error.response.data));
        } else {
            console.error('网络或代码错误:', error.message);
        }
        // ---------------------------------------
        return { success: false, reply: 'Oops, I\'m a bit stuck right now~ 💛' };
    }
}

// 聊天 API 接口
app.post('/api/chat', async (req, res) => {
    const { userId = 'user_01', message, language } = req.body;
    
    if (!message) {
        return res.json({ code: 400, data: { reply: '你想对我说什么呀？' } });
    }

    const result = await getXiaoyiReply(userId, message, language);
    res.json({ 
        code: result.success ? 200 : 500, 
        data: { reply: result.reply } 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    -------------------------------------------
    ✅ 小怡后台服务启动成功！
    🚀 访问地址: http://localhost:${PORT}
    📡 正在连接推理终端: ${process.env.DOUBAO_MODEL}
    -------------------------------------------
    `);
});