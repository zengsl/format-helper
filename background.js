// ============ 创建右键菜单 ============
chrome.runtime.onInstalled.addListener(() => {
  
  // 1. 一级快捷菜单：直接点击解码
  chrome.contextMenus.create({
    id: 'base64-decode-quick',
    title: 'Base64 解码',
    contexts: ['selection']
  });

  // 2. 一级父菜单：编码助手
  chrome.contextMenus.create({
    id: 'encode-helper',
    title: '编码助手',
    contexts: ['selection']
  });

  // 3. 二级菜单：挂在「编码助手」下的解码
  chrome.contextMenus.create({
    id: 'base64-decode',
    parentId: 'encode-helper',
    title: 'Base64 解码',
    contexts: ['selection']
  });

  // 4. 二级菜单：挂在「编码助手」下的编码
  chrome.contextMenus.create({
    id: 'base64-encode',
    parentId: 'encode-helper',
    title: 'Base64 编码',
    contexts: ['selection']
  });
});

// ============ 处理菜单点击 ============
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const selectedText = info.selectionText;
  if (!selectedText) return;

  let result = '';
  let isSuccess = true;
  let message = '';

  const menuItemId = info.menuItemId;

  if (menuItemId === 'base64-encode') {
    // ---------- 编码逻辑 ----------
    try {
      result = btoa(encodeURIComponent(selectedText).replace(/%([0-9A-F]{2})/g,
        (_, p1) => String.fromCharCode('0x' + p1)
      ));
      message = '✅ Base64 编码成功，已复制到剪贴板';
    } catch (e) {
      isSuccess = false;
      message = '❌ 编码失败：' + e.message;
    }
  } else if (menuItemId === 'base64-decode' || menuItemId === 'base64-decode-quick') {
    // ---------- 解码逻辑（快捷菜单和子菜单共用） ----------
    try {
      result = decodeURIComponent(
        atob(selectedText).split('').map(c =>
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      );
      message = '✅ Base64 解码成功，已复制到剪贴板';
    } catch (e) {
      isSuccess = false;
      message = '❌ 解码失败：选中的文字不是有效的 Base64 字符串';
    }
  } else {
    return;
  }

  // 通知 content.js 写剪贴板和弹提示
  if (tab && tab.id) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'base64-result',
      message: message,
      text: isSuccess ? result : '',
      isSuccess: isSuccess
    });
  }
});
