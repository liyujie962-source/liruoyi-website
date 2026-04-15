// 页面加载完成后执行淡入动画
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0'
  setTimeout(() => {
    document.body.style.transition = 'opacity 0.3s ease-in-out'
    document.body.style.opacity = '1'
  }, 100)
})

// 语言切换逻辑（预留）
const langBtn = document.querySelector('button')
langBtn.addEventListener('click', () => {
  // 后续添加多语言切换逻辑
  alert('语言切换功能预留')
})