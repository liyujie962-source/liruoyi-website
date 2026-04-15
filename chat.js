const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

const handler = async (req, res) => {
  // 只允许 POST 请求
  if (req.method !== 'POST') return res.status(405).end();

  try {
    // 【关键修复】手动检查并解析 Body。Vercel 有时会将 body 作为字符串传输
    let data = req.body;
    if (typeof data === 'string' && data.length > 0) {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.error("JSON 解析错误:", e);
      }
    }

    const { message, language } = data || {};
    const msg = (message || '').toLowerCase();
    let reply = '';

    // 聊天回复逻辑
    if (language === 'zh') {
      if (msg.includes('爱') || msg.includes('想你')) {
        reply = '我也超级爱你呀❤️';
      } else if (msg.includes('你好') || msg.includes('hi')) {
        reply = '你再这样我可要生气咯！一直说这一个词，不能换个花样嘛。';
      } else if (msg.includes('晚安')) {
        reply = '晚安～做个好梦🌙';
      } else {
        reply = '我都有认真听哦🥰';
      }
    } else if (language === 'en') {
      if (msg.includes('love') || msg.includes('miss')) {
        reply = 'I love you too!❤️';
      } else {
        reply = "I'm listening!💖";
      }
    } else {
      // 默认（如吉尔吉斯语）
      reply = 'Сүйөм сени❤️';
    }

    // 严格返回前端需要的 JSON 结构
    res.status(200).json({ 
      code: 200, 
      data: { reply: reply } 
    });
  } catch (err) {
    console.error("服务器内部错误:", err);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports = allowCors(handler);