export default async function handler(req, res) {
  // 设置跨域和响应头
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    // 强制兼容多种 Body 格式
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { message, language } = body || {};
    const msg = (message || '').toLowerCase();
    
    let reply = language === 'en' ? "I'm listening!💖" : "我都有认真听哦🥰";
    
    // 基础回复逻辑
    if (msg.includes('爱') || msg.includes('love')) reply = '我也超级爱你呀❤️';
    else if (msg.includes('你好') || msg.includes('hi')) reply = '你再这样我可要生气咯！一直说这一个词，不能换个花样嘛。';
    else if (msg.includes('晚安')) reply = '晚安～做个好梦🌙';

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("API Error:", err);
    return res.status(200).json({ reply: "服务器开小差了，再试一次嘛💛" });
  }
}