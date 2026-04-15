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
  // 必须处理非 POST 请求
  if (req.method !== 'POST') return res.status(405).end();

  try {
    // 关键修正：在 Vercel 环境下，如果 req.body 为空字符串，需要手动处理
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch(e) {}
    }

    const { message, language } = body || {};
    const msg = message?.toLowerCase() || '';
    let reply = '';

    if (language === 'zh') {
      if (msg.includes('爱') || msg.includes('想你')) reply = '我也超级爱你呀❤️';
      else if (msg.includes('你好') || msg.includes('hi')) reply = '你好呀😊';
      else if (msg.includes('晚安')) reply = '晚安～做个好梦🌙';
      else reply = '我都有认真听哦🥰';
    } else if (language === 'en') {
      if (msg.includes('love') || msg.includes('miss')) reply = 'I love you too!❤️';
      else if (msg.includes('hi') || msg.includes('hello')) reply = 'Hi there!😊';
      else reply = "I'm listening!💖";
    } else {
      reply = 'Сүйөм сени❤️';
    }

    // 严格返回前端 if(result.code === 200) 所需的格式
    res.status(200).json({ 
      code: 200, 
      data: { reply: reply } 
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: "Internal Error" });
  }
};

module.exports = allowCors(handler);