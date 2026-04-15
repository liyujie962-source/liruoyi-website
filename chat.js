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
  
  // Vercel 自动处理 body 解析
  const { message, language } = req.body || {};
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

  // 返回前端期待的 { code: 200, data: { reply: "..." } } 格式
  res.status(200).json({ 
    code: 200, 
    data: { reply: reply } 
  });
};

module.exports = allowCors(handler);