const express = require('express');
const router = express.Router();
let letters = [];

// 获取所有留言
router.get('/', (req, res) => {
  res.json(letters);
});

// 提交留言
router.post('/', (req, res) => {
  const { name, country, content } = req.body;
  const newLetter = {
    id: Date.now().toString(),
    name, country, content,
    created_at: new Date().toISOString()
  };
  letters.unshift(newLetter);
  res.json({ success: true });
});

// 删除留言（新增）
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  letters = letters.filter(item => item.id !== id);
  res.json({ success: true });
});

module.exports = router;