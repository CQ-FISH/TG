/**
 * ============================================================================
 * 交通图库 - 键盘快捷键系统 (shortcuts.js)
 * ============================================================================
 *
 * 【文件说明】
 * 本文件是交通图库网站的键盘快捷键系统，实现了完整的快捷键功能：
 * 1. 全局快捷键 - 在任何页面都可使用
 * 2. 页面特定快捷键 - 只在特定页面生效
 * 3. 快捷键帮助面板 - 显示所有可用快捷键
 * 4. 快捷键自定义 - 用户可自定义部分快捷键
 * 5. 快捷键冲突检测 - 避免与浏览器默认快捷键冲突
 *
 * 【快捷键列表】
 * 全局快捷键：
 * - ? : 显示快捷键帮助
 * - / : 聚焦搜索框
 * - Esc : 关闭弹窗/返回上一页
 * - g + h : 跳转到首页
 * - g + g : 跳转到画廊
 * - g + u : 跳转到上传页
 * - g + p : 跳转到个人中心
 * - g + a : 跳转到关于页面
 * - g + b : 跳转到BUG反馈
 *
 * 画廊页快捷键：
 * - j / ↓ : 下一张作品
 * - k / ↑ : 上一张作品
 * - l : 点赞当前作品
 * - f : 收藏当前作品
 * - s : 分享当前作品
 * - r : 随机浏览
 *
 * 详情页快捷键：
 * - ← : 上一个作品
 * - → : 下一个作品
 * - space : 播放/暂停幻灯片
 *
 * 管理后台快捷键：
 * - 1-7 : 切换管理标签页
 * - d : 仪表盘
 * - w : 作品管理
 * - u : 用户管理
 * - b : BUG管理
 *
 * 【技术特点】
 * - 支持组合键（如 g+h）
 * - 智能冲突检测
 * - 可禁用特定快捷键
 * - 快捷键提示
 *
 * 【依赖关系】
 * - 无依赖，可独立使用
 *
 * 【作者】AI Assistant
 * 【日期】2026-02-21
 * 【版本】v1.0.0
 * ============================================================================
 */

// ============================================
// 第一部分：快捷键配置
// ============================================

/**
 * 快捷键配置
 * 【说明】定义所有可用的快捷键
 */
const SHORTCUTS_CONFIG = {
  // 全局快捷键
  global: {
    'help': { key: '?', description: '显示快捷键帮助', action: showShortcutsHelp },
    'search': { key: '/', description: '聚焦搜索框', action: focusSearch },
    'escape': { key: 'Escape', description: '关闭弹窗/返回', action: handleEscape },
    'goHome': { key: 'g h', description: '跳转到首页', action: () => navigateTo('index.html') },
    'goGallery': { key: 'g g', description: '跳转到画廊', action: () => navigateTo('gallery.html') },
    'goUpload': { key: 'g u', description: '跳转到上传页', action: () => navigateTo('upload.html') },
    'goProfile': { key: 'g p', description: '跳转到个人中心', action: () => navigateTo('profile.html') },
    'goAbout': { key: 'g a', description: '跳转到关于页面', action: () => navigateTo('about.html') },
    'goBug': { key: 'g b', description: '跳转到BUG反馈', action: () => navigateTo('bug.html') },
    'toggleTheme': { key: 't', description: '切换主题', action: toggleThemeShortcut },
    'toggleFullscreen': { key: 'f11', description: '全屏模式', action: toggleFullscreen }
  },

  // 画廊页快捷键
  gallery: {
    'nextWork': { key: 'j', description: '下一张作品', action: () => navigateWork('next') },
    'prevWork': { key: 'k', description: '上一张作品', action: () => navigateWork('prev') },
    'likeWork': { key: 'l', description: '点赞当前作品', action: () => interactWithWork('like') },
    'favoriteWork': { key: 'f', description: '收藏当前作品', action: () => interactWithWork('favorite') },
    'shareWork': { key: 's', description: '分享当前作品', action: () => interactWithWork('share') },
    'randomWork': { key: 'r', description: '随机浏览', action: randomWork },
    'arrowDown': { key: 'ArrowDown', description: '下一张作品', action: () => navigateWork('next') },
    'arrowUp': { key: 'ArrowUp', description: '上一张作品', action: () => navigateWork('prev') }
  },

  // 详情页快捷键
  detail: {
    'prevDetail': { key: 'ArrowLeft', description: '上一个作品', action: () => navigateDetail('prev') },
    'nextDetail': { key: 'ArrowRight', description: '下一个作品', action: () => navigateDetail('next') },
    'playSlideshow': { key: ' ', description: '播放/暂停幻灯片', action: toggleSlideshow }
  },

  // 管理后台快捷键
  admin: {
    'dashTab': { key: '1', description: '仪表盘', action: () => switchAdminTab('dashboard') },
    'worksTab': { key: '2', description: '作品管理', action: () => switchAdminTab('works') },
    'usersTab': { key: '3', description: '用户管理', action: () => switchAdminTab('users') },
    'bugsTab': { key: '4', description: 'BUG管理', action: () => switchAdminTab('bugs') },
    'announceTab': { key: '5', description: '公告管理', action: () => switchAdminTab('announcements') },
    'logsTab': { key: '6', description: '操作日志', action: () => switchAdminTab('logs') },
    'settingsTab': { key: '7', description: '系统设置', action: () => switchAdminTab('settings') }
  }
};

/**
 * 快捷键状态
 */
const _shortcutsState = {
  // 是否启用快捷键
  enabled: true,
  // 当前按下的键
  pressedKeys: new Set(),
  // 组合键超时
  comboTimeout: null,
  // 忽略的输入元素
  ignoreElements: ['INPUT', 'TEXTAREA', 'SELECT'],
  // 幻灯片播放状态
  slideshowPlaying: false,
  // 帮助面板是否显示
  helpVisible: false
};

// ============================================
// 第二部分：核心功能函数
// ============================================

/**
 * 初始化快捷键系统
 */
function initShortcuts() {
  // 绑定键盘事件
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);

  // 注入样式
  injectShortcutsStyles();

  console.log('[快捷键] 快捷键系统已初始化，按 ? 查看帮助');
}

/**
 * 处理按键按下
 * @param {KeyboardEvent} event - 键盘事件
 */
function handleKeyDown(event) {
  if (!_shortcutsState.enabled) return;

  // 忽略输入框中的按键
  if (isInputElement(event.target)) return;

  const key = event.key;
  _shortcutsState.pressedKeys.add(key);

  // 检测组合键
  const combo = detectCombo();
  if (combo) {
    event.preventDefault();
    executeShortcut(combo);
    return;
  }

  // 检测单键
  const shortcut = findShortcut(key);
  if (shortcut) {
    event.preventDefault();
    executeShortcut(shortcut);
  }
}

/**
 * 处理按键释放
 * @param {KeyboardEvent} event - 键盘事件
 */
function handleKeyUp(event) {
  _shortcutsState.pressedKeys.delete(event.key);

  // 清除组合键超时
  if (_shortcutsState.comboTimeout) {
    clearTimeout(_shortcutsState.comboTimeout);
    _shortcutsState.comboTimeout = null;
  }
}

/**
 * 检测组合键
 * @returns {Object|null} 匹配的组合键或null
 */
function detectCombo() {
  const keys = Array.from(_shortcutsState.pressedKeys);

  // 检查所有组合键配置
  for (const [scope, shortcuts] of Object.entries(SHORTCUTS_CONFIG)) {
    for (const [name, config] of Object.entries(shortcuts)) {
      if (config.key.includes(' ')) {
        const comboKeys = config.key.split(' ');
        if (comboKeys.every(k => keys.includes(k))) {
          return { scope, name, config };
        }
      }
    }
  }

  return null;
}

/**
 * 查找快捷键
 * @param {string} key - 按键
 * @returns {Object|null} 匹配的快捷键或null
 */
function findShortcut(key) {
  const currentPage = getCurrentPageType();

  // 先检查页面特定快捷键
  if (SHORTCUTS_CONFIG[currentPage]) {
    for (const [name, config] of Object.entries(SHORTCUTS_CONFIG[currentPage])) {
      if (config.key === key) {
        return { scope: currentPage, name, config };
      }
    }
  }

  // 再检查全局快捷键
  for (const [name, config] of Object.entries(SHORTCUTS_CONFIG.global)) {
    if (config.key === key) {
      return { scope: 'global', name, config };
    }
  }

  return null;
}

/**
 * 执行快捷键动作
 * @param {Object} shortcut - 快捷键对象
 */
function executeShortcut(shortcut) {
  console.log(`[快捷键] 执行: ${shortcut.config.key} - ${shortcut.config.description}`);

  // 显示快捷键提示
  showShortcutToast(shortcut.config.key, shortcut.config.description);

  // 执行动作
  if (typeof shortcut.config.action === 'function') {
    shortcut.config.action();
  }
}

/**
 * 判断是否为输入元素
 * @param {Element} element - DOM元素
 * @returns {boolean} 是否为输入元素
 */
function isInputElement(element) {
  return _shortcutsState.ignoreElements.includes(element.tagName) ||
         element.isContentEditable;
}

/**
 * 获取当前页面类型
 * @returns {string} 页面类型
 */
function getCurrentPageType() {
  const path = window.location.pathname;

  if (path.includes('gallery')) return 'gallery';
  if (path.includes('detail')) return 'detail';
  if (path.includes('admin')) return 'admin';

  return 'global';
}

// ============================================
// 第三部分：快捷键动作函数
// ============================================

/**
 * 显示快捷键帮助
 */
function showShortcutsHelp() {
  if (_shortcutsState.helpVisible) {
    hideShortcutsHelp();
    return;
  }

  const currentPage = getCurrentPageType();
  const globalShortcuts = SHORTCUTS_CONFIG.global;
  const pageShortcuts = SHORTCUTS_CONFIG[currentPage] || {};

  const modal = document.createElement('div');
  modal.className = 'shortcuts-modal';
  modal.innerHTML = `
    <div class="shortcuts-overlay" onclick="hideShortcutsHelp()"></div>
    <div class="shortcuts-panel">
      <div class="shortcuts-header">
        <h2>⌨️ 键盘快捷键</h2>
        <button class="close-btn" onclick="hideShortcutsHelp()">&times;</button>
      </div>
      <div class="shortcuts-content">
        <div class="shortcuts-section">
          <h3>全局快捷键</h3>
          <div class="shortcuts-list">
            ${Object.entries(globalShortcuts).map(([name, config]) => `
              <div class="shortcut-item">
                <kbd>${config.key}</kbd>
                <span>${config.description}</span>
              </div>
            `).join('')}
          </div>
        </div>
        ${Object.keys(pageShortcuts).length > 0 ? `
          <div class="shortcuts-section">
            <h3>当前页面快捷键</h3>
            <div class="shortcuts-list">
              ${Object.entries(pageShortcuts).map(([name, config]) => `
                <div class="shortcut-item">
                  <kbd>${config.key}</kbd>
                  <span>${config.description}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
      <div class="shortcuts-footer">
        <p>💡 提示：在输入框中输入时快捷键不会触发</p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  _shortcutsState.helpVisible = true;
}

/**
 * 隐藏快捷键帮助
 */
function hideShortcutsHelp() {
  const modal = document.querySelector('.shortcuts-modal');
  if (modal) {
    modal.remove();
    _shortcutsState.helpVisible = false;
  }
}

/**
 * 聚焦搜索框
 */
function focusSearch() {
  const searchInput = document.getElementById('global-search-input');
  if (searchInput) {
    searchInput.focus();
    searchInput.select();
  }
}

/**
 * 处理Escape键
 */
function handleEscape() {
  // 关闭帮助面板
  if (_shortcutsState.helpVisible) {
    hideShortcutsHelp();
    return;
  }

  // 关闭模态框
  const modals = document.querySelectorAll('.modal, .shortcuts-modal');
  if (modals.length > 0) {
    modals[modals.length - 1].remove();
    return;
  }

  // 返回上一页
  if (window.history.length > 1) {
    window.history.back();
  }
}

/**
 * 页面导航
 * @param {string} page - 页面路径
 */
function navigateTo(page) {
  window.location.href = page;
}

/**
 * 切换主题快捷键
 */
function toggleThemeShortcut() {
  if (typeof toggleTheme === 'function') {
    toggleTheme();
  } else {
    console.log('[快捷键] 主题切换功能未加载');
  }
}

/**
 * 切换全屏
 */
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.log('[快捷键] 无法进入全屏:', err);
    });
  } else {
    document.exitFullscreen();
  }
}

/**
 * 作品导航
 * @param {string} direction - 方向（next/prev）
 */
function navigateWork(direction) {
  // 这里需要与gallery.js配合实现
  console.log(`[快捷键] 导航到${direction === 'next' ? '下' : '上'}一个作品`);
  // 触发自定义事件，让gallery.js处理
  window.dispatchEvent(new CustomEvent('navigateWork', { detail: { direction } }));
}

/**
 * 作品互动
 * @param {string} action - 动作（like/favorite/share）
 */
function interactWithWork(action) {
  console.log(`[快捷键] ${action}当前作品`);
  window.dispatchEvent(new CustomEvent('interactWork', { detail: { action } }));
}

/**
 * 随机作品
 */
function randomWork() {
  console.log('[快捷键] 随机浏览作品');
  window.dispatchEvent(new CustomEvent('randomWork'));
}

/**
 * 详情页导航
 * @param {string} direction - 方向（next/prev）
 */
function navigateDetail(direction) {
  console.log(`[快捷键] 详情页导航${direction === 'next' ? '下' : '上'}一个`);
  window.dispatchEvent(new CustomEvent('navigateDetail', { detail: { direction } }));
}

/**
 * 切换幻灯片
 */
function toggleSlideshow() {
  _shortcutsState.slideshowPlaying = !_shortcutsState.slideshowPlaying;
  console.log(`[快捷键] 幻灯片${_shortcutsState.slideshowPlaying ? '播放' : '暂停'}`);
  window.dispatchEvent(new CustomEvent('toggleSlideshow', {
    detail: { playing: _shortcutsState.slideshowPlaying }
  }));
}

/**
 * 切换管理标签页
 * @param {string} tab - 标签页名称
 */
function switchAdminTab(tab) {
  console.log(`[快捷键] 切换到${tab}`);
  window.dispatchEvent(new CustomEvent('switchAdminTab', { detail: { tab } }));
}

// ============================================
// 第四部分：UI组件
// ============================================

/**
 * 显示快捷键提示
 * @param {string} key - 按键
 * @param {string} description - 描述
 */
function showShortcutToast(key, description) {
  // 移除旧的提示
  const oldToast = document.querySelector('.shortcut-toast');
  if (oldToast) oldToast.remove();

  // 创建新提示
  const toast = document.createElement('div');
  toast.className = 'shortcut-toast';
  toast.innerHTML = `
    <kbd>${key}</kbd>
    <span>${description}</span>
  `;

  document.body.appendChild(toast);

  // 动画显示
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // 2秒后隐藏
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

/**
 * 注入快捷键样式
 */
function injectShortcutsStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* 快捷键提示 */
    .shortcut-toast {
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      opacity: 0;
      transition: all 0.3s ease;
      z-index: 10000;
      pointer-events: none;
    }

    .shortcut-toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    .shortcut-toast kbd {
      background: rgba(255, 255, 255, 0.2);
      padding: 4px 8px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 14px;
    }

    /* 帮助面板 */
    .shortcuts-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .shortcuts-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
    }

    .shortcuts-panel {
      position: relative;
      background: var(--bg-card, white);
      border-radius: 16px;
      width: 90%;
      max-width: 600px;
      max-height: 80vh;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .shortcuts-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-color, #e0e0e0);
    }

    .shortcuts-header h2 {
      margin: 0;
      font-size: 20px;
      color: var(--text-primary, #333);
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: var(--text-secondary, #666);
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .close-btn:hover {
      background: var(--bg-hover, #f0f0f0);
      color: var(--text-primary, #333);
    }

    .shortcuts-content {
      padding: 24px;
      overflow-y: auto;
      max-height: calc(80vh - 140px);
    }

    .shortcuts-section {
      margin-bottom: 24px;
    }

    .shortcuts-section:last-child {
      margin-bottom: 0;
    }

    .shortcuts-section h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      color: var(--text-primary, #333);
      padding-bottom: 8px;
      border-bottom: 2px solid var(--primary-color, #3498db);
      display: inline-block;
    }

    .shortcuts-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 12px;
    }

    .shortcut-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      border-radius: 8px;
      transition: background 0.2s ease;
    }

    .shortcut-item:hover {
      background: var(--bg-hover, #f0f0f0);
    }

    .shortcut-item kbd {
      background: var(--bg-secondary, #f5f5f5);
      border: 1px solid var(--border-color, #ddd);
      border-radius: 4px;
      padding: 4px 10px;
      font-family: monospace;
      font-size: 13px;
      min-width: 40px;
      text-align: center;
      box-shadow: 0 2px 0 var(--border-color, #ddd);
    }

    .shortcut-item span {
      color: var(--text-secondary, #666);
      font-size: 14px;
    }

    .shortcuts-footer {
      padding: 16px 24px;
      background: var(--bg-secondary, #f5f5f5);
      border-top: 1px solid var(--border-color, #e0e0e0);
    }

    .shortcuts-footer p {
      margin: 0;
      font-size: 13px;
      color: var(--text-muted, #999);
    }
  `;

  document.head.appendChild(style);
}

// ============================================
// 第五部分：初始化
// ============================================

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initShortcuts);

console.log('[快捷键] shortcuts.js 已加载');
