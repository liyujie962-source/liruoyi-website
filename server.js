const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('./config');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ========== 硬编码所有页面路由（100%解决跳转问题） ==========
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/index.html', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/photos.html', (req, res) => res.sendFile(path.join(__dirname, 'photos.html')));
app.get('/letter.html', (req, res) => res.sendFile(path.join(__dirname, 'letter.html')));
app.get('/chat.html', (req, res) => res.sendFile(path.join(__dirname, 'chat.html')));

// ========== 对话记忆 ==========
const userSessions = new Map();

// ========== 反馈文件读写 ==========
function readFeedback() {
  try {
    const feedbackPath = path.resolve(__dirname, config.FEEDBACK_FILE);
    if (!fs.existsSync(feedbackPath)) {
      fs.writeFileSync(feedbackPath, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    return JSON.parse(fs.readFileSync(feedbackPath, 'utf8'));
  } catch (e) {
    console.error('反馈文件读取失败:', e);
    return [];
  }
}

function writeFeedback(newFeedback) {
  try {
    const feedbackPath = path.resolve(__dirname, config.FEEDBACK_FILE);
    const feedbackList = readFeedback();
    feedbackList.push(newFeedback);
    fs.writeFileSync(feedbackPath, JSON.stringify(feedbackList, null, 2), 'utf8');
  } catch (e) {
    console.error('反馈文件写入失败:', e);
  }
}

// ========== 火山引擎签名 ==========
function getDoubaoHeaders() {
  const timestamp = Date.now().toString();
  const signStr = `${config.DOUBAO_API_KEY}${timestamp}${config.DOUBAO_SECRET_KEY}`;
  const signature = crypto.createHash('sha256').update(signStr).digest('hex');
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.DOUBAO_API_KEY}`,
    'X-Volc-Timestamp': timestamp,
    'X-Volc-Signature': signature
  };
}

// ========== 核心聊天逻辑 ==========
// 1. 函数名：getMiyahReply → getXiaoyiReply（小怡的拼音，避免中文函数名报错）
async function getXiaoyiReply(userId, userMessage, language = 'zh') {
  try {
    let history = userSessions.get(userId) || [];
    const langMap = { zh: '中文', en: 'English', ru: 'Русский', ky: 'Кыргызча' };
    const targetLang = langMap[language] || '中文';

    const messages = [
      { role: 'system', content: config.BASE_PROMPT + `\n请用【${targetLang}】回复` },
      ...history.map(item => ({ role: item.role, content: item.content })),
      { role: 'user', content: userMessage }
    ];

    const response = await axios.post(config.DOUBAO_ENDPOINT, {
      model: config.DOUBAO_MODEL,
      messages,
      temperature: 0.8,
      max_tokens: 1000
    }, { headers: getDoubaoHeaders(), timeout: 30000 });

    const reply = response.data.choices[0].message.content.trim();
    history.push({ role: 'user', content: userMessage });
    history.push({ role: 'assistant', content: reply });
    if (history.length > config.MAX_HISTORY_LENGTH) history = history.slice(-config.MAX_HISTORY_LENGTH);
    userSessions.set(userId, history);

    writeFeedback({ userId, time: new Date().toISOString(), language: targetLang, userMessage, reply });
    return { success: true, reply };
  } catch (error) {
    console.error('API调用失败:', error.message);
    // 2. 错误兜底回复：适配小怡人设（英文版本也调整为小怡风格）
    return { success: false, reply: 'Oops, I\'m a bit stuck right now~ 💛' };
  }
}

// ========== 聊天接口 ==========
app.post('/api/chat', async (req, res) => {
  const { userId = `user_${Date.now()}`, message, language } = req.body;
  if (!message) return res.json({ code: 400, data: { reply: '你还没说想和我说什么呢～' } });
  // 3. 调用替换后的函数：getMiyahReply → getXiaoyiReply
  const result = await getXiaoyiReply(userId, message, language);
  res.json({ code: result.success ? 200 : 500, data: { userId, reply: result.reply } });
});

// ========== 反馈接口 ==========
app.post('/api/feedback', (req, res) => {
  const { userId, message, reply, newDetail } = req.body;
  if (!userId || !newDetail) return res.json({ code: 400, msg: '缺少参数' });
  writeFeedback({ userId, timestamp: new Date().toLocaleString(), conversation: { message, reply }, newDetail, status: '待训练' });
  res.json({ code: 200, msg: '✅ 反馈已收到' });
});

// ========== 查看反馈 ==========
app.get('/api/feedback/list', (req, res) => {
  res.json({ code: 200, data: readFeedback() });
});

// ========== 更新人设 ==========
app.post('/api/update-prompt', (req, res) => {
  const { newPrompt } = req.body;
  if (!newPrompt) return res.json({ code: 400, msg: '请输入新人设' });
  config.BASE_PROMPT = newPrompt;
  res.json({ code: 200, msg: '✅ 人设已更新' });
});

// ========== 启动服务 ==========
const PORT = process.env.PORT || config.PORT;
app.listen(PORT, () => {
  // 4. 启动日志：Miyah → 小怡
  console.log(`✅ 小怡 服务已启动，端口：${PORT}`);
});