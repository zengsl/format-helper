chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'base64-result') {
    
    // 如果成功，先写剪贴板
    if (request.isSuccess && request.text) {
      const copySuccess = forceCopyToClipboard(request.text);
      if (!copySuccess) {
        request.message = '⚠️ 编解码成功，但剪贴板写入失败';
      }
    }
    
    // 显示提示
    showToast(request.message, request.isSuccess);
  }
  return true;
});

// 最强力的剪贴板复制方案（兼容性99.9%）
function forceCopyToClipboard(text) {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    
    // 关键样式：确保它不可见，且不影响页面滚动
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    textarea.setAttribute('readonly', ''); // 防止移动端键盘弹出
    
    document.body.appendChild(textarea);
    
    // 关键：选中并复制
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length); // 兼容 iOS
    
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    
    return success;
  } catch (e) {
    console.error('复制失败:', e);
    return false;
  }
}

// 在页面上显示 Toast 通知
function showToast(message, isSuccess) {
  const existingToast = document.getElementById('base64-extension-toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.id = 'base64-extension-toast';
  toast.textContent = message;
  
  Object.assign(toast.style, {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%) translateY(-10px)',
    backgroundColor: isSuccess ? '#1a1a2e' : '#c0392b',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    zIndex: '2147483647',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    opacity: '0',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    lineHeight: '1.5'
  });

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
