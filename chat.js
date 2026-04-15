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
  if (req.method !== 'POST') return res.status(405).end();

  try {
    // 兼容字符串和对象形式的 Body
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

    const { message, language } = body || {};
    const msg = (message || '').toLowerCase();
    let reply = '';

    // 回复逻辑判断
    if (language === 'zh') {
      if (msg.includes('爱') || msg.includes('想你')) reply = '我也超级爱你呀❤️';
      else if (msg.includes('你好') || msg.includes('hi')) reply = '你再这样我可要生气咯！一直说这一个词，不能换个花样嘛。';
      else if (msg.includes('晚安')) reply = '晚安～做个好梦🌙';
      else reply = '我都有认真听哦🥰';
    } else if (language === 'en') {
      if (msg.includes('love') || msg.includes('miss')) reply = 'I love you too!❤️';
      else reply = "I'm listening!💖";
    } else {
      reply = 'Сүйөм сени❤️'; // 默认吉尔吉斯语回复
    }

    // 严格返回前端期待的 code 200 格式
    res.status(200).json({ 
      code: 200, 
      data: { reply: reply } 
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: "Internal Error" });
  }
};

module.exports = allowCors(handler);