const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  return await fn(req, res);
};

const handler = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    // 强制解析 Body，防止 Vercel 环境下 req.body 为空或 Buffer
    let payload = req.body;
    if (Buffer.isBuffer(payload)) {
      payload = JSON.parse(payload.toString());
    } else if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch (e) {}
    }

    const { message, language } = payload || {};
    const msg = (message || '').toLowerCase();
    
    // 默认回复
    let reply = (language === 'en') ? "I'm listening!💖" : "我都有认真听哦🥰";

    // 简单逻辑分支
    if (language === 'zh') {
      if (msg.includes('爱') || msg.includes('想你')) reply = '我也超级爱你呀❤️';
      else if (msg.includes('你好')) reply = '你再这样我可要生气咯！一直说这一个词，不能换个花样嘛。';
      else if (msg.includes('晚安')) reply = '晚安～做个好梦🌙';
    } else if (language === 'en' && (msg.includes('love') || msg.includes('miss'))) {
      reply = 'I love you too!❤️';
    }

    // 同时返回两种格式，前端怎么取都能拿到
    res.status(200).json({ 
      reply: reply,
      data: { reply: reply } 
    });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(200).json({ reply: "服务器开小差了，但我一直在哦💛" });
  }
};

module.exports = allowCors(handler);