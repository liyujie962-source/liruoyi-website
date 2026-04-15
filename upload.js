const express = require('express');
const router = express.Router();
let photos = [];

// 获取所有照片
router.get('/', (req, res) => {
  res.json(photos);
});

// 上传照片
router.post('/', (req, res) => {
  const { name, relation, location, date, shortDesc, images } = req.body;
  const newPhoto = {
    id: Date.now().toString(),
    name, relation, location, date, shortDesc, images,
    created_at: new Date().toISOString()
  };
  photos.unshift(newPhoto);
  res.json({ success: true });
});

// 删除照片（新增）
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  photos = photos.filter(item => item.id !== id);
  res.json({ success: true });
});

module.exports = router;