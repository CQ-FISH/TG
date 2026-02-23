/**
 * ============================================================================
 * 交通图库 - JavaScript内存数据库模块 (database.js)
 * ============================================================================
 * 
 * 【文件说明】
 * 本文件是交通图库网站的内存数据库模块，完全脱离localStorage，使用JavaScript内存存储：
 * 1. 实时在线人数统计（基于内存计算）
 * 2. BUG数据管理（内存存储）
 * 3. 作品数据管理（内存存储）
 * 4. 用户数据管理（内存存储）
 * 5. 统计数据实时计算和推送
 * 
 * 【技术特点】
 * - 纯内存存储，数据在页面刷新后重置
 * - 实时计算，无需等待localStorage读写
 * - 支持数据持久化钩子（可扩展后端API）
 * - 线程安全的数据操作（单线程JavaScript环境）
 * 
 * 【数据结构】
 * - _db: 内存数据库主对象
 *   - works: 作品数据数组
 *   - bugs: BUG报告数组
 *   - users: 用户数据数组
 *   - logs: 操作日志数组
 *   - onlineUsers: 在线用户活动记录
 *   - stats: 统计数据对象
 * 
 * 【依赖关系】
 * - 必须在config.js之后引入
 * - 替代data.js和bug.js的功能
 * 
 * 【作者】AI Assistant
 * 【日期】2026-02-21
 * 【版本】v2.0.0
 * ============================================================================
 */

// ============================================
// 第一部分：内存数据库初始化
// ============================================

/**
 * 内存数据库主对象
 * 【说明】所有数据存储在内存中，页面刷新后重置
 */
const _db = {
  // 作品数据
  works: [],
  // BUG报告数据
  bugs: [],
  // 用户数据
  users: [],
  // 操作日志
  logs: [],
  // 在线用户活动记录（用于计算在线人数）
  onlineUsers: [],
  // 统计数据
  stats: {
    totalVisits: 0,
    todayVisits: 0,
    lastVisitDate: null,
    lastUpdate: null
  },
  // 当前会话ID
  sessionId: null,
  // 数据是否已初始化
  initialized: false
};

/**
 * 数据库配置
 */
const DB_CONFIG = {
  // 在线超时时间（毫秒）- 60秒
  ONLINE_TIMEOUT: 60 * 1000,
  // 心跳间隔（毫秒）- 30秒
  HEARTBEAT_INTERVAL: 30 * 1000,
  // 统计数据推送间隔（毫秒）- 5秒
  STATS_PUSH_INTERVAL: 5 * 1000,
  // 初始模拟作品数量
  INITIAL_WORKS_COUNT: 20,
  // 初始模拟用户数量
  INITIAL_USERS_COUNT: 5
};

// ============================================
// 第二部分：初始化函数
// ============================================

/**
 * 初始化内存数据库
 * 【功能说明】
 * 1. 生成当前会话ID
 * 2. 初始化模拟数据
 * 3. 启动心跳和统计推送
 * 4. 记录访问统计
 */
function initDatabase() {
  if (_db.initialized) return;
  
  // 生成唯一会话ID
  _db.sessionId = generateSessionId();
  
  // 初始化模拟数据
  initMockWorks();
  initMockUsers();
  initMockBugs();
  
  // 初始化统计数据
  initStats();
  
  // 启动在线用户跟踪
  startOnlineTracking();
  
  // 启动统计数据推送
  startStatsPush();
  
  _db.initialized = true;
  console.log('[数据库] 内存数据库初始化完成，会话ID:', _db.sessionId);
}

/**
 * 生成唯一会话ID
 * @returns {string} 会话ID
 */
function generateSessionId() {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * 初始化模拟作品数据
 */
function initMockWorks() {
  const categories = ['railway', 'aviation', 'land', 'water', 'special', 'culture'];
  const photographers = ['铁道迷小王', '星城车迷', '空港拍客', '京城拍车人', '浦江船影', '山水旅人', '城市记录者'];
  const locations = ['北京市', '上海市', '广州市', '深圳市', '成都市', '武汉市', '西安市'];
  
  for (let i = 1; i <= DB_CONFIG.INITIAL_WORKS_COUNT; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const work = {
      id: 1000 + i,
      title: `模拟作品 ${i}号 - ${getCategoryName(category)}摄影`,
      category: {
        main: category,
        sub: getRandomSubCategory(category)
      },
      description: `这是第${i}个模拟作品，用于展示交通图库的功能。`,
      tags: ['模拟', '测试', getCategoryName(category)],
      location: locations[Math.floor(Math.random() * locations.length)],
      shootDate: getRandomDate(),
      photographer: photographers[Math.floor(Math.random() * photographers.length)],
      views: Math.floor(Math.random() * 5000) + 100,
      likes: Math.floor(Math.random() * 500) + 10,
      status: 'approved',
      imageUrl: `assets/images/${category}/work_${i}.jpg`,
      thumbnailUrl: `assets/images/${category}/work_${i}_thumb.jpg`,
      uploadTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    _db.works.push(work);
  }
}

/**
 * 初始化模拟用户数据
 */
function initMockUsers() {
  // 管理员账号
  _db.users.push({
    username: 'admin',
    password: 'admin123',
    secretKey: 'ADMIN_SECRET_KEY_2026_TRAFFIC_GALLERY',
    isAdmin: true,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date().toISOString(),
    loginAttempts: 0,
    lockedUntil: null
  });
  
  // 模拟普通用户
  const userNames = ['user001', 'user002', 'user003', 'user004'];
  userNames.forEach((name, index) => {
    _db.users.push({
      username: name,
      password: 'password' + (index + 1),
      secretKey: generateSecretKey(),
      isAdmin: false,
      createdAt: new Date(Date.now() - (30 - index * 5) * 24 * 60 * 60 * 1000).toISOString(),
      lastLogin: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
      loginAttempts: 0,
      lockedUntil: null
    });
  });
}

/**
 * 初始化模拟BUG数据
 */
function initMockBugs() {
  const bugTypes = [
    { category: 'frontend', priority: 'medium', title: '页面加载缓慢' },
    { category: 'function', priority: 'high', title: '上传功能异常' },
    { category: 'ui', priority: 'low', title: '按钮样式错位' },
    { category: 'performance', priority: 'medium', title: '图片加载卡顿' }
  ];
  
  bugTypes.forEach((bug, index) => {
    _db.bugs.push({
      id: 'BUG-' + Date.now() + '-' + index,
      title: bug.title,
      category: bug.category,
      priority: bug.priority,
      description: `这是模拟的${bug.title}问题描述。`,
      browser: 'Chrome 120.0',
      contact: 'user' + (index + 1) + '@example.com',
      status: index % 2 === 0 ? 'pending' : 'processing',
      submitter: 'user00' + (index + 1),
      submitTime: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
      updateTime: new Date().toISOString(),
      replies: [],
      screenshots: []
    });
  });
}

/**
 * 初始化统计数据
 * 【说明】初始值为0，每次页面刷新时根据真实访问数据更新
 */
function initStats() {
  const today = new Date().toDateString();

  // 重置累计访问为0（每次刷新重新开始计数）
  _db.stats.totalVisits = 0;

  // 重置今日访问为0
  _db.stats.todayVisits = 0;

  // 设置当前日期
  _db.stats.lastVisitDate = today;

  _db.stats.lastUpdate = new Date().toISOString();

  console.log('[统计] 初始化完成 - 累计:', _db.stats.totalVisits, '今日:', _db.stats.todayVisits);
}

// ============================================
// 第三部分：实时在线人数统计
// ============================================

/**
 * 启动在线用户跟踪
 * 【功能说明】
 * 1. 定期发送心跳更新活动状态
 * 2. 清理超时用户
 * 3. 计算实时在线人数
 */
function startOnlineTracking() {
  // 立即记录当前用户
  updateUserActivity();
  
  // 定期发送心跳
  setInterval(() => {
    updateUserActivity();
    cleanupOfflineUsers();
  }, DB_CONFIG.HEARTBEAT_INTERVAL);
}

/**
 * 更新当前用户活动状态
 */
function updateUserActivity() {
  const now = new Date().toISOString();
  const existingIndex = _db.onlineUsers.findIndex(u => u.sessionId === _db.sessionId);
  
  if (existingIndex >= 0) {
    _db.onlineUsers[existingIndex].lastActivity = now;
  } else {
    _db.onlineUsers.push({
      sessionId: _db.sessionId,
      startTime: now,
      lastActivity: now,
      page: window.location.pathname
    });
  }
}

/**
 * 清理离线用户
 * 【说明】移除超过ONLINE_TIMEOUT时间未活动的用户
 */
function cleanupOfflineUsers() {
  const now = Date.now();
  const timeout = DB_CONFIG.ONLINE_TIMEOUT;
  
  _db.onlineUsers = _db.onlineUsers.filter(user => {
    const lastActivity = new Date(user.lastActivity).getTime();
    return (now - lastActivity) < timeout;
  });
}

/**
 * 获取当前在线人数
 * @returns {number} 在线人数
 */
function getOnlineUserCount() {
  cleanupOfflineUsers();
  return _db.onlineUsers.length;
}

/**
 * 获取在线用户列表
 * @returns {Array} 在线用户数组
 */
function getOnlineUsers() {
  cleanupOfflineUsers();
  return _db.onlineUsers;
}

// ============================================
// 第四部分：统计数据实时推送
// ============================================

/**
 * 启动统计数据推送
 * 【功能说明】
 * 定期更新统计数据并推送到页面元素
 */
function startStatsPush() {
  // 立即更新一次
  updateStatistics();
  pushStatsToPage();
  
  // 定期推送
  setInterval(() => {
    updateStatistics();
    pushStatsToPage();
  }, DB_CONFIG.STATS_PUSH_INTERVAL);
}

/**
 * 更新统计数据
 * 【说明】只更新在线人数和在线审核员数据，不再统计访问量
 */
function updateStatistics() {
  // 只更新最后更新时间
  _db.stats.lastUpdate = new Date().toISOString();

  // 清理离线用户，确保在线人数准确
  cleanupOfflineUsers();
}

/**
 * 推送统计数据到页面
 * 【说明】只推送在线人数和在线审核员数据
 */
function pushStatsToPage() {
  const stats = getStatistics();

  // 更新在线人数
  const onlineEl = document.getElementById('online-users');
  if (onlineEl) {
    onlineEl.textContent = stats.onlineUsers;
  }

  // 更新在线审核员数（管理员数量）
  const reviewersEl = document.getElementById('online-reviewers');
  if (reviewersEl) {
    reviewersEl.textContent = stats.onlineReviewers;
  }
}

/**
 * 获取在线审核员数量
 * 【说明】统计当前在线的管理员用户数量
 * @returns {number} 在线审核员数量
 */
function getOnlineReviewersCount() {
  cleanupOfflineUsers();
  // 统计在线用户中的管理员
  return _db.onlineUsers.filter(onlineUser => {
    // 检查该在线用户是否是管理员
    const user = _db.users.find(u => u.username === onlineUser.username);
    return user && (user.isAdmin || user.role === 'admin');
  }).length;
}

/**
 * 获取完整统计数据
 * @returns {Object} 统计数据对象
 */
function getStatistics() {
  return {
    // 保留在线人数和在线审核员
    onlineUsers: getOnlineUserCount(),
    onlineReviewers: getOnlineReviewersCount(),
    // 保留其他统计数据但不再更新
    totalVisits: _db.stats.totalVisits,
    todayVisits: _db.stats.todayVisits,
    registeredUsers: _db.users.length,
    totalWorks: _db.works.length,
    totalBugs: _db.bugs.length,
    lastUpdate: _db.stats.lastUpdate
  };
}

// ============================================
// 第五部分：作品数据管理
// ============================================

/**
 * 获取所有作品
 * @returns {Array} 作品数组
 */
function getAllWorks() {
  return _db.works;
}

/**
 * 根据ID获取作品
 * @param {number} workId 作品ID
 * @returns {Object|null} 作品对象
 */
function getWorkById(workId) {
  return _db.works.find(w => w.id === Number(workId)) || null;
}

/**
 * 添加新作品
 * @param {Object} workData 作品数据
 * @returns {number} 新作品ID
 */
function addWork(workData) {
  const newId = _db.works.length > 0 ? Math.max(..._db.works.map(w => w.id)) + 1 : 1001;
  const newWork = {
    ...workData,
    id: newId,
    uploadTime: new Date().toISOString(),
    views: 0,
    likes: 0,
    status: 'pending'
  };
  _db.works.push(newWork);
  return newId;
}

/**
 * 更新作品
 * @param {number} workId 作品ID
 * @param {Object} updates 更新数据
 * @returns {boolean} 是否成功
 */
function updateWork(workId, updates) {
  const index = _db.works.findIndex(w => w.id === Number(workId));
  if (index >= 0) {
    _db.works[index] = { ..._db.works[index], ...updates };
    return true;
  }
  return false;
}

/**
 * 删除作品
 * @param {number} workId 作品ID
 * @returns {boolean} 是否成功
 */
function deleteWork(workId) {
  const index = _db.works.findIndex(w => w.id === Number(workId));
  if (index >= 0) {
    _db.works.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * 获取精选作品
 * @param {number} count 数量
 * @returns {Array} 精选作品数组
 */
function getFeaturedWorks(count = 6) {
  return _db.works
    .filter(w => w.status === 'approved')
    .sort((a, b) => b.likes - a.likes)
    .slice(0, count);
}

/**
 * 获取最新作品
 * @param {number} count 数量
 * @returns {Array} 最新作品数组
 */
function getLatestWorks(count = 8) {
  return _db.works
    .filter(w => w.status === 'approved')
    .sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime))
    .slice(0, count);
}

/**
 * 搜索作品
 * @param {string} keyword 关键词
 * @returns {Array} 搜索结果
 */
function searchWorks(keyword) {
  if (!keyword) return _db.works;
  const lowerKeyword = keyword.toLowerCase();
  return _db.works.filter(w => 
    w.title.toLowerCase().includes(lowerKeyword) ||
    w.description.toLowerCase().includes(lowerKeyword) ||
    w.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
  );
}

// ============================================
// 第六部分：BUG数据管理
// ============================================

/**
 * 获取所有BUG报告
 * @returns {Array} BUG数组
 */
function getAllBugs() {
  return _db.bugs;
}

/**
 * 根据ID获取BUG
 * @param {string} bugId BUG ID
 * @returns {Object|null} BUG对象
 */
function getBugById(bugId) {
  return _db.bugs.find(b => b.id === bugId) || null;
}

/**
 * 根据状态筛选BUG
 * @param {string} status 状态
 * @returns {Array} BUG数组
 */
function getBugsByStatus(status) {
  if (!status || status === 'all') return _db.bugs;
  return _db.bugs.filter(b => b.status === status);
}

/**
 * 提交新BUG
 * @param {Object} bugData BUG数据
 * @returns {Object} 提交结果 {success: boolean, bugId: string}
 */
function submitBug(bugData) {
  const newId = 'BUG-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
  const newBug = {
    ...bugData,
    id: newId,
    status: 'pending',
    submitTime: new Date().toISOString(),
    updateTime: new Date().toISOString(),
    replies: []
  };
  _db.bugs.push(newBug);
  console.log('[database.js] BUG提交成功:', newId);
  
  // 触发BUG列表刷新（如果在bug-list页面）
  if (typeof window.refreshBugList === 'function') {
    window.refreshBugList();
  }
  
  return { success: true, bugId: newId };
}

/**
 * 更新BUG状态
 * @param {string} bugId BUG ID
 * @param {string} newStatus 新状态
 * @param {string} reply 管理员回复
 * @returns {boolean} 是否成功
 */
function updateBugStatus(bugId, newStatus, reply) {
  const bug = getBugById(bugId);
  if (!bug) return false;
  
  bug.status = newStatus;
  bug.updateTime = new Date().toISOString();
  
  if (reply) {
    bug.replies.push({
      content: reply,
      time: new Date().toISOString(),
      admin: 'admin'
    });
  }
  
  return true;
}

/**
 * 删除BUG
 * @param {string} bugId BUG ID
 * @returns {boolean} 是否成功
 */
function deleteBug(bugId) {
  const index = _db.bugs.findIndex(b => b.id === bugId);
  if (index >= 0) {
    _db.bugs.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * 获取BUG统计
 * @returns {Object} BUG统计数据
 */
function getBugStatistics() {
  const stats = {
    total: _db.bugs.length,
    pending: _db.bugs.filter(b => b.status === 'pending').length,
    processing: _db.bugs.filter(b => b.status === 'processing').length,
    resolved: _db.bugs.filter(b => b.status === 'resolved').length,
    rejected: _db.bugs.filter(b => b.status === 'rejected').length
  };
  return stats;
}

// ============================================
// 第七部分：用户数据管理
// ============================================

/**
 * 获取所有用户
 * @returns {Array} 用户数组
 */
function getAllUsers() {
  return _db.users;
}

/**
 * 根据用户名获取用户
 * @param {string} username 用户名
 * @returns {Object|null} 用户对象
 */
function getUserByUsername(username) {
  return _db.users.find(u => u.username === username) || null;
}

/**
 * 添加用户
 * @param {Object} userData 用户数据
 */
function addUser(userData) {
  _db.users.push(userData);
}

/**
 * 更新用户
 * @param {string} username 用户名
 * @param {Object} updates 更新数据
 * @returns {boolean} 是否成功
 */
function updateUser(username, updates) {
  const index = _db.users.findIndex(u => u.username === username);
  if (index >= 0) {
    _db.users[index] = { ..._db.users[index], ...updates };
    return true;
  }
  return false;
}

/**
 * 删除用户
 * @param {string} username 用户名
 * @returns {boolean} 是否成功
 */
function deleteUser(username) {
  const index = _db.users.findIndex(u => u.username === username);
  if (index >= 0) {
    _db.users.splice(index, 1);
    return true;
  }
  return false;
}

// ============================================
// 第八部分：日志管理
// ============================================

/**
 * 添加日志
 * @param {string} type 日志类型
 * @param {string} message 日志内容
 */
function addLog(type, message) {
  _db.logs.push({
    id: 'LOG-' + Date.now(),
    type: type,
    message: message,
    time: new Date().toISOString(),
    user: getCurrentUser()?.username || '匿名'
  });
  
  // 限制日志数量，防止内存溢出
  if (_db.logs.length > 1000) {
    _db.logs = _db.logs.slice(-500);
  }
}

/**
 * 获取所有日志
 * @returns {Array} 日志数组
 */
function getAllLogs() {
  return _db.logs;
}

/**
 * 获取最近日志
 * @param {number} count 数量
 * @returns {Array} 日志数组
 */
function getRecentLogs(count = 50) {
  return _db.logs.slice(-count).reverse();
}

// ============================================
// 第九部分：辅助函数
// ============================================

/**
 * 获取分类名称
 * @param {string} categoryId 分类ID
 * @returns {string} 分类名称
 */
function getCategoryName(categoryId) {
  const category = CATEGORIES[categoryId];
  return category ? category.name : categoryId;
}

/**
 * 获取随机子分类
 * @param {string} categoryId 分类ID
 * @returns {string} 子分类ID
 */
function getRandomSubCategory(categoryId) {
  const category = CATEGORIES[categoryId];
  if (category && category.subCategories.length > 0) {
    return category.subCategories[Math.floor(Math.random() * category.subCategories.length)].id;
  }
  return '';
}

/**
 * 获取随机日期
 * @returns {string} 日期字符串
 */
function getRandomDate() {
  const start = new Date(2024, 0, 1);
  const end = new Date();
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

/**
 * 生成密钥
 * @returns {string} 密钥
 */
function generateSecretKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = 'TG-';
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (i < 3) key += '-';
  }
  return key;
}

/**
 * 格式化数字
 * @param {number} num 数字
 * @returns {string} 格式化后的字符串
 */
function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
}

/**
 * 获取当前登录用户
 * @returns {Object|null} 用户对象
 */
function getCurrentUser() {
  // 从内存中获取当前用户（兼容auth.js）
  if (typeof window !== 'undefined' && window._currentUser) {
    return window._currentUser;
  }
  return null;
}

// ============================================
// 第十部分：页面加载初始化
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  initDatabase();
  console.log('[数据库] 内存数据库模块已加载');
});

// 导出模块（如果支持）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    _db,
    initDatabase,
    getOnlineUserCount,
    getStatistics,
    getAllWorks,
    getWorkById,
    addWork,
    updateWork,
    deleteWork,
    getFeaturedWorks,
    getLatestWorks,
    searchWorks,
    getAllBugs,
    getBugById,
    submitBug,
    updateBugStatus,
    deleteBug,
    getBugStatistics,
    getAllUsers,
    getUserByUsername,
    addUser,
    updateUser,
    deleteUser,
    addLog,
    getAllLogs,
    getRecentLogs
  };
}
