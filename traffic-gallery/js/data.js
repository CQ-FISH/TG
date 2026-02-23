/**
 * ============================================================================
 * 交通图库 - 数据管理核心模块 (data.js)
 * ============================================================================
 * 
 * 【文件说明】
 * 本文件是交通图库网站的核心数据管理模块，负责：
 * 1. 模拟数据的初始化和管理
 * 2. localStorage本地存储的读写操作
 * 3. 作品、用户、日志等数据的增删改查
 * 4. 网站统计数据的实时计算和推送
 * 
 * 【依赖关系】
 * - 必须在config.js之后引入，使用GLOBAL_CONST常量
 * - 被main.js、admin.js、bug.js等模块依赖
 * 
 * 【数据结构说明】
 * - 作品数据：包含铁路、航空、陆运、水运、特殊交通、风景人文六大类
 * - 用户数据：支持普通用户和管理员角色
 * - 日志数据：记录用户操作行为
 * - 统计数据：在线人数、访问量等实时数据
 * 
 * 【作者】AI Assistant
 * 【日期】2026-02-20
 * 【版本】v1.0.0
 * ============================================================================
 */

// ============================================
// 第一部分：初始模拟数据（全品类覆盖）
// ============================================

/**
 * 初始作品数据集
 * 包含六大分类的示例作品，用于首次加载时初始化localStorage
 * 
 * 作品对象结构：
 * {
 *   id: Number,              // 唯一标识符
 *   title: String,           // 作品标题
 *   category: {              // 分类信息
 *     main: String,          // 主分类：railway/aviation/land/water/special/culture
 *     sub: String            // 子分类
 *   },
 *   description: String,     // 详细描述
 *   tags: Array<String>,     // 标签数组
 *   location: String,        // 拍摄地点
 *   shootDate: String,       // 拍摄日期 (YYYY-MM-DD)
 *   photographer: String,    // 摄影师名称
 *   views: Number,           // 浏览次数
 *   likes: Number,           // 点赞次数
 *   imageUrl: String,        // 原图路径
 *   thumbnailUrl: String,    // 缩略图路径
 *   uploadTime: String       // 上传时间
 * }
 */
const INIT_WORKS_DATA = [
  // ==================== 铁路类作品 ====================
  {
    id: 1001,
    title: '复兴号CR400AF穿越油菜花田',
    category: {
      main: 'railway',
      sub: 'highspeed'        // 高速铁路
    },
    description: '春日午后，CR400AF型复兴号高速列车穿行于赣闽两省交界处的油菜花田之间，记录中国高铁与春日田园的完美融合。',
    tags: ['高铁', '油菜花', '春天', '复兴号', '山间铁路'],
    location: '江西省上饶市',
    shootDate: '2025-03-15',
    photographer: '铁道迷小王',
    views: 1523,
    likes: 89,
    imageUrl: 'assets/images/railway/highspeed/rex400af.jpg',
    thumbnailUrl: 'assets/images/railway/highspeed/rex400af_thumb.jpg',
    uploadTime: '2025-03-16 14:23:00'
  },
  {
    id: 1002,
    title: '韶山SS8牵引绿皮车进站',
    category: {
      main: 'railway',
      sub: 'normalspeed'      // 普速铁路
    },
    description: '经典的韶山SS8型电力机车牵引25G型绿皮车缓缓驶入长沙站，记录怀旧经典的铁路瞬间。',
    tags: ['绿皮车', '韶山SS8', '怀旧', '长沙站', '老火车'],
    location: '湖南省长沙市',
    shootDate: '2025-01-20',
    photographer: '星城车迷',
    views: 2100,
    likes: 156,
    imageUrl: 'assets/images/railway/normalspeed/ss8.jpg',
    thumbnailUrl: 'assets/images/railway/normalspeed/ss8_thumb.jpg',
    uploadTime: '2025-01-21 09:15:00'
  },
  
  // ==================== 航空类作品 ====================
  {
    id: 2001,
    title: '波音787梦想客机降落瞬间',
    category: {
      main: 'aviation',
      sub: 'civil'            // 民航客机
    },
    description: '南航波音787-9在夕阳下降落于广州白云国际机场02L跑道，记录机身与晚霞同框的绝美瞬间。',
    tags: ['波音787', '夕阳', '白云机场', '降落', '民航客机'],
    location: '广东省广州市',
    shootDate: '2025-02-28',
    photographer: '空港拍客',
    views: 3450,
    likes: 278,
    imageUrl: 'assets/images/aviation/civil/b787.jpg',
    thumbnailUrl: 'assets/images/aviation/civil/b787_thumb.jpg',
    uploadTime: '2025-03-01 18:45:00'
  },
  
  // ==================== 陆运类作品 ====================
  {
    id: 3001,
    title: '北京公交1路"中国红"纯电动车',
    category: {
      main: 'land',
      sub: 'bus'              // 城市公交
    },
    description: '行驶在长安街上的北京公交1路，采用"中国红"涂装的纯电动客车，记录首都公交的标杆线路。',
    tags: ['北京公交', '长安街', '纯电动', '中国红', '公交'],
    location: '北京市东城区',
    shootDate: '2025-04-01',
    photographer: '京城拍车人',
    views: 890,
    likes: 67,
    imageUrl: 'assets/images/land/bus/beijing1.jpg',
    thumbnailUrl: 'assets/images/land/bus/beijing1_thumb.jpg',
    uploadTime: '2025-04-02 11:30:00'
  },
  
  // ==================== 水运类作品 ====================
  {
    id: 4001,
    title: '"海洋量子号"邮轮停靠上海吴淞口',
    category: {
      main: 'water',
      sub: 'cruise'           // 邮轮
    },
    description: '皇家加勒比"海洋量子号"邮轮清晨停靠于上海吴淞口国际邮轮港，记录巨轮与朝阳同框的画面。',
    tags: ['邮轮', '吴淞口', '量子号', '清晨', '港口日出'],
    location: '上海市宝山区',
    shootDate: '2025-05-10',
    photographer: '浦江船影',
    views: 2200,
    likes: 189,
    imageUrl: 'assets/images/water/cruise/quantum.jpg',
    thumbnailUrl: 'assets/images/water/cruise/quantum_thumb.jpg',
    uploadTime: '2025-05-11 08:20:00'
  },
  
  // ==================== 特殊交通类作品 ====================
  {
    id: 5001,
    title: '张家界天门山索道云海穿行',
    category: {
      main: 'special',
      sub: 'cableway'         // 索道缆车
    },
    description: '世界最长高山客运索道——天门山索道，穿梭于云海之间，记录高山索道的震撼视角。',
    tags: ['索道', '天门山', '云海', '张家界', '缆车'],
    location: '湖南省张家界市',
    shootDate: '2025-04-20',
    photographer: '山水旅人',
    views: 4500,
    likes: 320,
    imageUrl: 'assets/images/special/cableway/tianmen.jpg',
    thumbnailUrl: 'assets/images/special/cableway/tianmen_thumb.jpg',
    uploadTime: '2025-04-21 16:00:00'
  },
  
  // ==================== 风景人文类作品 ====================
  {
    id: 6001,
    title: '春运中的广州南站',
    category: {
      main: 'culture',
      sub: 'hub_scenery'      // 交通枢纽
    },
    description: '2025年春运首日，广州南站候车大厅内人头攒动，却又秩序井然，记录中国春运的人文瞬间。',
    tags: ['春运', '广州南站', '人文', '春节', '高铁站', '交通枢纽'],
    location: '广东省广州市',
    shootDate: '2025-01-26',
    photographer: '城市记录者',
    views: 5600,
    likes: 420,
    imageUrl: 'assets/images/culture/hub/gznan.jpg',
    thumbnailUrl: 'assets/images/culture/hub/gznan_thumb.jpg',
    uploadTime: '2025-01-27 20:10:00'
  }
];

// ============================================
// 第二部分：数据初始化函数
// ============================================

/**
 * 初始化作品数据到localStorage
 * 【功能说明】首次访问网站时，将模拟数据写入本地存储
 * 【调用时机】页面加载时自动调用，或在获取数据前调用
 * 【存储键名】使用GLOBAL_CONST.STORAGE_WORKS_KEY定义
 * 
 * 初始化内容包括：
 * 1. 作品数据列表
 * 2. 用户点赞记录（空数组）
 * 3. 当前登录用户（null）
 * 4. 操作日志（空数组）
 */
function initWorksData() {
  // 检查作品数据是否已初始化
  if (!localStorage.getItem(GLOBAL_CONST.STORAGE_WORKS_KEY)) {
    localStorage.setItem(
      GLOBAL_CONST.STORAGE_WORKS_KEY,
      JSON.stringify(INIT_WORKS_DATA)
    );
  }
  
  // 初始化点赞数据存储
  if (!localStorage.getItem(GLOBAL_CONST.STORAGE_LIKE_KEY)) {
    localStorage.setItem(GLOBAL_CONST.STORAGE_LIKE_KEY, JSON.stringify([]));
  }
  
  // 初始化用户登录状态
  if (!localStorage.getItem(GLOBAL_CONST.STORAGE_USER_KEY)) {
    localStorage.setItem(GLOBAL_CONST.STORAGE_USER_KEY, JSON.stringify(null));
  }
  
  // 初始化日志数据存储
  if (!localStorage.getItem(GLOBAL_CONST.STORAGE_LOGS_KEY)) {
    localStorage.setItem(GLOBAL_CONST.STORAGE_LOGS_KEY, JSON.stringify([]));
  }
}

// ============================================
// 第三部分：作品数据CRUD操作
// ============================================

/**
 * 获取所有作品数据
 * @returns {Array} 作品对象数组
 * 
 * 【使用示例】
 * const works = getAllWorks();
 * console.log(works.length); // 获取作品总数
 */
function getAllWorks() {
  initWorksData();
  const works = localStorage.getItem(GLOBAL_CONST.STORAGE_WORKS_KEY);
  return works ? JSON.parse(works) : [];
}

/**
 * 保存作品数据到本地存储
 * @param {Array} worksList - 作品对象数组
 * 
 * 【注意事项】
 * - 此操作会完全覆盖原有数据
 * - 建议在修改单个作品后，先获取全部数据，修改后再保存
 */
function saveWorks(worksList) {
  localStorage.setItem(
    GLOBAL_CONST.STORAGE_WORKS_KEY,
    JSON.stringify(worksList)
  );
}

/**
 * 根据ID获取单条作品详情
 * @param {Number|String} workId - 作品ID
 * @returns {Object|null} 作品对象，未找到返回null
 * 
 * 【使用示例】
 * const work = getWorkById(1001);
 * if (work) {
 *   console.log(work.title);
 * }
 */
function getWorkById(workId) {
  const works = getAllWorks();
  return works.find(item => item.id === Number(workId)) || null;
}

/**
 * 新增作品
 * @param {Object} workData - 作品数据对象
 * @returns {Number} 新增作品的ID
 * 
 * 【使用示例】
 * const newWork = {
 *   id: Date.now(),
 *   title: '新作品标题',
 *   category: { main: 'railway', sub: 'highspeed' },
 *   // ... 其他字段
 * };
 * addNewWork(newWork);
 */
function addNewWork(workData) {
  const works = getAllWorks();
  works.unshift(workData); // 新增作品放在数组最前面（最新优先）
  saveWorks(works);
  
  // 记录上传日志
  addLog('upload', `用户上传作品: ${workData.title}`);
  return workData.id;
}

/**
 * 更新作品浏览量
 * @param {Number|String} workId - 作品ID
 * 
 * 【功能说明】
 * - 浏览量+1
 * - 用于统计作品热度
 * - 建议在作品详情页加载时调用
 */
function updateWorkViews(workId) {
  const works = getAllWorks();
  const index = works.findIndex(item => item.id === Number(workId));
  if (index !== -1) {
    works[index].views += 1;
    saveWorks(works);
  }
}

// ============================================
// 第四部分：点赞功能管理
// ============================================

/**
 * 切换作品点赞状态
 * @param {Number|String} workId - 作品ID
 * @returns {Object} { isLiked: Boolean, likes: Number }
 *                   isLiked: 当前是否已点赞
 *                   likes: 当前点赞总数
 * 
 * 【功能说明】
 * - 如果未点赞，则添加点赞并增加点赞数
 * - 如果已点赞，则取消点赞并减少点赞数
 * - 自动记录点赞/取消点赞日志
 * 
 * 【使用示例】
 * const result = toggleWorkLike(1001);
 * if (result.isLiked) {
 *   showToast('点赞成功');
 * } else {
 *   showToast('已取消点赞');
 * }
 */
function toggleWorkLike(workId) {
  const likeList = JSON.parse(localStorage.getItem(GLOBAL_CONST.STORAGE_LIKE_KEY));
  const index = likeList.indexOf(Number(workId));
  
  if (index === -1) {
    // ====== 执行点赞操作 ======
    likeList.push(Number(workId));
    localStorage.setItem(GLOBAL_CONST.STORAGE_LIKE_KEY, JSON.stringify(likeList));
    
    // 更新作品点赞数
    const works = getAllWorks();
    const workIndex = works.findIndex(item => item.id === Number(workId));
    if (workIndex !== -1) {
      works[workIndex].likes += 1;
      saveWorks(works);
      
      // 记录点赞日志
      addLog('like', `用户点赞作品: ${works[workIndex].title}`);
    }
    return { isLiked: true, likes: works[workIndex].likes };
    
  } else {
    // ====== 执行取消点赞操作 ======
    likeList.splice(index, 1);
    localStorage.setItem(GLOBAL_CONST.STORAGE_LIKE_KEY, JSON.stringify(likeList));
    
    // 更新作品点赞数
    const works = getAllWorks();
    const workIndex = works.findIndex(item => item.id === Number(workId));
    if (workIndex !== -1) {
      works[workIndex].likes -= 1;
      saveWorks(works);
      
      // 记录取消点赞日志
      addLog('unlike', `用户取消点赞作品: ${works[workIndex].title}`);
    }
    return { isLiked: false, likes: works[workIndex].likes };
  }
}

/**
 * 检查作品是否已被当前用户点赞
 * @param {Number|String} workId - 作品ID
 * @returns {Boolean} true=已点赞, false=未点赞
 */
function isWorkLiked(workId) {
  const likeList = JSON.parse(localStorage.getItem(GLOBAL_CONST.STORAGE_LIKE_KEY));
  return likeList.indexOf(Number(workId)) !== -1;
}

// ============================================
// 第五部分：用户认证管理
// ============================================

/**
 * 用户登录验证
 * @param {String} username - 用户名
 * @param {String} password - 密码
 * @returns {Boolean} 登录成功返回true，失败返回false
 * 
 * 【说明】
 * - 当前为前端模拟登录，仅验证非空
 * - 实际项目应通过后端API验证密码
 * - 管理员账号：用户名'admin'自动获得管理员权限
 * 
 * 【使用示例】
 * if (userLogin('admin', '123456')) {
 *   showToast('登录成功');
 *   location.href = 'index.html';
 * } else {
 *   showToast('登录失败');
 * }
 */
function userLogin(username, password) {
  if (username && password) {
    const user = {
      username: username,
      isAdmin: username === 'admin'  // 管理员账号判断逻辑
    };
    localStorage.setItem(GLOBAL_CONST.STORAGE_USER_KEY, JSON.stringify(user));
    
    // 记录登录日志
    addLog('login', `用户登录: ${username}`);
    return true;
  }
  return false;
}

/**
 * 用户登出
 * 【功能说明】清除登录状态并记录日志
 */
function userLogout() {
  const user = getUser();
  if (user) {
    addLog('logout', `用户登出: ${user.username}`);
  }
  localStorage.setItem(GLOBAL_CONST.STORAGE_USER_KEY, JSON.stringify(null));
}

/**
 * 获取当前登录用户信息
 * @returns {Object|null} 用户对象，未登录返回null
 * 
 * 【返回对象结构】
 * {
 *   username: String,    // 用户名
 *   isAdmin: Boolean     // 是否为管理员
 * }
 */
function getUser() {
  initWorksData();
  const user = localStorage.getItem(GLOBAL_CONST.STORAGE_USER_KEY);
  return user ? JSON.parse(user) : null;
}

/**
 * 检查用户是否已登录
 * @returns {Boolean}
 */
function isUserLoggedIn() {
  return getUser() !== null;
}

/**
 * 检查当前用户是否为管理员
 * @returns {Boolean}
 */
function isAdmin() {
  const user = getUser();
  return user && user.isAdmin;
}

// ============================================
// 第六部分：操作日志管理
// ============================================

/**
 * 添加操作日志
 * @param {String} action - 操作类型
 *                          可选值: 'login'(登录), 'logout'(登出), 
 *                                'upload'(上传), 'like'(点赞), 
 *                                'unlike'(取消点赞), 等
 * @param {String} description - 操作描述
 * 
 * 【功能说明】
 * - 自动记录时间戳
 * - 最多保留100条最新日志
 * - 新日志插入到数组开头
 * 
 * 【使用示例】
 * addLog('upload', '用户上传作品: 复兴号高铁');
 */
function addLog(action, description) {
  const logs = JSON.parse(localStorage.getItem(GLOBAL_CONST.STORAGE_LOGS_KEY) || '[]');
  
  const log = {
    id: Date.now(),
    action: action,
    description: description,
    timestamp: new Date().toLocaleString()
  };
  
  logs.unshift(log); // 新日志放在最前面
  
  // 限制日志数量，只保留最近100条（防止存储过大）
  if (logs.length > 100) {
    logs.splice(100);
  }
  
  localStorage.setItem(GLOBAL_CONST.STORAGE_LOGS_KEY, JSON.stringify(logs));
}

/**
 * 获取所有操作日志
 * @returns {Array} 日志对象数组
 * 
 * 【日志对象结构】
 * {
 *   id: Number,          // 日志ID（时间戳）
 *   action: String,      // 操作类型
 *   description: String, // 操作描述
 *   timestamp: String    // 操作时间
 * }
 */
function getAllLogs() {
  initWorksData();
  const logs = localStorage.getItem(GLOBAL_CONST.STORAGE_LOGS_KEY);
  return logs ? JSON.parse(logs) : [];
}

// ============================================
// 第七部分：网站统计管理模块
// ============================================
// 本模块负责实时计算和推送网站统计数据，包括：
// - 在线人数（基于用户活动心跳）
// - 总访问量
// - 今日访问量
// - 注册用户数
// ============================================

/**
 * 统计模块配置常量
 * 【配置说明】
 * - ONLINE_TIMEOUT: 60秒内无活动视为离线
 * - HEARTBEAT_INTERVAL: 每30秒发送一次心跳
 * - 存储键名定义
 */
const STATS_CONFIG = {
  ONLINE_TIMEOUT: 60000,        // 在线超时时间：60秒无活动视为离线
  HEARTBEAT_INTERVAL: 30000,    // 心跳间隔：30秒
  STATS_KEY: 'site_statistics', // 统计数据存储键
  ONLINE_USERS_KEY: 'online_users',      // 在线用户列表键
  LAST_ACTIVITY_KEY: 'user_last_activity' // 当前用户活动键
};

/**
 * 初始化统计数据
 * 【功能说明】
 * - 首次访问时创建初始统计数据
 * - 初始化在线用户列表
 * - 记录当前用户活动
 * - 清理过期在线用户
 * - 更新访问统计
 * 
 * 【调用时机】页面加载时自动调用
 */
function initStatistics() {
  // ====== 初始化站点统计 ======
  if (!localStorage.getItem(STATS_CONFIG.STATS_KEY)) {
    const initialStats = {
      totalVisits: 1000,        // 初始总访问量（模拟已有访问）
      todayVisits: 0,           // 今日访问量
      lastVisitDate: new Date().toDateString(), // 上次访问日期
      registeredUsers: 1,       // 注册用户数量
      lastUpdate: new Date().toISOString()
    };
    localStorage.setItem(STATS_CONFIG.STATS_KEY, JSON.stringify(initialStats));
  }
  
  // ====== 初始化在线用户列表 ======
  if (!localStorage.getItem(STATS_CONFIG.ONLINE_USERS_KEY)) {
    localStorage.setItem(STATS_CONFIG.ONLINE_USERS_KEY, JSON.stringify([]));
  }
  
  // ====== 记录当前用户活动 ======
  recordUserActivity();
  
  // ====== 清理过期在线用户 ======
  cleanupOfflineUsers();
  
  // ====== 更新访问统计 ======
  updateVisitStats();
}

/**
 * 记录用户活动（心跳机制）
 * 【功能说明】
 * - 生成或获取会话ID
 * - 记录当前页面、时间、用户信息
 * - 更新在线用户列表
 * 
 * 【调用时机】
 * - 页面加载时
 * - 定时心跳（每30秒）
 * - 用户活动时（点击、滚动、按键）
 */
function recordUserActivity() {
  const sessionId = getOrCreateSessionId();
  const user = getUser();
  const username = user ? user.username : '游客_' + sessionId.substr(0, 8);
  
  const activity = {
    sessionId: sessionId,
    username: username,
    lastActivity: new Date().toISOString(),
    page: window.location.pathname,
    userAgent: navigator.userAgent.substr(0, 50)
  };
  
  // 保存到sessionStorage（当前会话，页面关闭后清除）
  sessionStorage.setItem(STATS_CONFIG.LAST_ACTIVITY_KEY, JSON.stringify(activity));
  
  // 更新在线用户列表（localStorage，跨页面共享）
  updateOnlineUsers(activity);
}

/**
 * 获取或创建会话ID
 * @returns {String} 会话ID
 * 
 * 【说明】
 * - 每个浏览器标签页有唯一的会话ID
 * - 使用sessionStorage存储，页面关闭后失效
 * - 格式：sess_时间戳_随机字符串
 */
function getOrCreateSessionId() {
  let sessionId = sessionStorage.getItem('user_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('user_session_id', sessionId);
  }
  return sessionId;
}

/**
 * 更新在线用户列表
 * @param {Object} currentActivity - 当前用户活动对象
 * 
 * 【功能说明】
 * - 移除当前会话的旧记录（防止重复）
 * - 添加当前活动记录
 * - 保存到localStorage供其他页面读取
 */
function updateOnlineUsers(currentActivity) {
  let onlineUsers = JSON.parse(localStorage.getItem(STATS_CONFIG.ONLINE_USERS_KEY) || '[]');
  
  // 移除当前会话的旧记录
  onlineUsers = onlineUsers.filter(u => u.sessionId !== currentActivity.sessionId);
  
  // 添加当前活动记录
  onlineUsers.push(currentActivity);
  
  // 保存回localStorage
  localStorage.setItem(STATS_CONFIG.ONLINE_USERS_KEY, JSON.stringify(onlineUsers));
}

/**
 * 清理离线用户
 * @returns {Number} 清理后的在线人数
 * 
 * 【功能说明】
 * - 检查所有在线用户的最后活动时间
 * - 超过ONLINE_TIMEOUT（60秒）未活动的视为离线
 * - 从列表中移除离线用户
 */
function cleanupOfflineUsers() {
  const now = new Date().getTime();
  const timeout = STATS_CONFIG.ONLINE_TIMEOUT;
  
  let onlineUsers = JSON.parse(localStorage.getItem(STATS_CONFIG.ONLINE_USERS_KEY) || '[]');
  
  // 过滤掉超时用户
  onlineUsers = onlineUsers.filter(u => {
    const lastActivity = new Date(u.lastActivity).getTime();
    return (now - lastActivity) < timeout;
  });
  
  localStorage.setItem(STATS_CONFIG.ONLINE_USERS_KEY, JSON.stringify(onlineUsers));
  return onlineUsers.length;
}

/**
 * 获取当前在线人数（实时计算）
 * @returns {Number} 在线人数
 * 
 * 【说明】
 * - 先执行清理，再统计
 * - 返回实际活跃的在线用户数
 */
function getOnlineUserCount() {
  cleanupOfflineUsers();
  const onlineUsers = JSON.parse(localStorage.getItem(STATS_CONFIG.ONLINE_USERS_KEY) || '[]');
  return onlineUsers.length;
}

/**
 * 获取在线用户列表
 * @returns {Array} 在线用户对象数组
 */
function getOnlineUsers() {
  cleanupOfflineUsers();
  return JSON.parse(localStorage.getItem(STATS_CONFIG.ONLINE_USERS_KEY) || '[]');
}

/**
 * 更新访问统计
 * @returns {Object} 更新后的统计数据
 * 
 * 【功能说明】
 * - 检查是否新的一天，是则重置今日访问量
 * - 检查是否新会话，是则增加访问量
 * - 使用sessionStorage标记会话，避免重复统计
 */
function updateVisitStats() {
  let stats = JSON.parse(localStorage.getItem(STATS_CONFIG.STATS_KEY));
  const today = new Date().toDateString();
  
  // 检查是否新的一天
  if (stats.lastVisitDate !== today) {
    stats.todayVisits = 0;
    stats.lastVisitDate = today;
  }
  
  // 检查是否是新会话（使用sessionStorage标记）
  if (!sessionStorage.getItem('visit_recorded')) {
    stats.totalVisits += 1;
    stats.todayVisits += 1;
    stats.lastUpdate = new Date().toISOString();
    sessionStorage.setItem('visit_recorded', 'true');
    localStorage.setItem(STATS_CONFIG.STATS_KEY, JSON.stringify(stats));
  }
  
  return stats;
}

/**
 * 获取完整统计数据
 * @returns {Object} 统计数据对象
 * 
 * 【返回结构】
 * {
 *   totalVisits: Number,      // 总访问量
 *   todayVisits: Number,      // 今日访问量
 *   registeredUsers: Number,  // 注册用户数
 *   onlineUsers: Number,      // 当前在线人数
 *   lastUpdate: String        // 最后更新时间
 * }
 */
function getStatistics() {
  const stats = JSON.parse(localStorage.getItem(STATS_CONFIG.STATS_KEY));
  const users = JSON.parse(localStorage.getItem(GLOBAL_CONST.STORAGE_USERS_KEY) || '[]');
  
  return {
    totalVisits: stats.totalVisits,
    todayVisits: stats.todayVisits,
    registeredUsers: Math.max(users.length, 1),
    onlineUsers: getOnlineUserCount(),
    lastUpdate: stats.lastUpdate
  };
}

/**
 * 启动心跳机制
 * 【功能说明】
 * - 立即报告一次活动
 * - 定时发送心跳（每30秒）
 * - 页面可见性变化时立即报告
 * - 用户活动时节流报告（5秒内最多一次）
 * 
 * 【调用时机】页面加载完成后调用
 */
function startHeartbeat() {
  // ====== 立即报告一次 ======
  recordUserActivity();
  
  // ====== 定期发送心跳 ======
  setInterval(() => {
    recordUserActivity();
  }, STATS_CONFIG.HEARTBEAT_INTERVAL);
  
  // ====== 页面可见性变化时立即报告 ======
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      recordUserActivity();
    }
  });
  
  // ====== 用户活动时节流报告 ======
  ['click', 'scroll', 'keydown', 'mousemove'].forEach(event => {
    document.addEventListener(event, () => {
      // 使用节流，避免频繁更新（5秒内只更新一次）
      if (!window.activityThrottle) {
        window.activityThrottle = true;
        recordUserActivity();
        setTimeout(() => {
          window.activityThrottle = false;
        }, 5000);
      }
    }, true);
  });
}

// ============================================
// 第八部分：页面加载初始化
// ============================================

/**
 * 页面加载完成后的初始化操作
 * 【执行内容】
 * 1. 初始化作品数据
 * 2. 初始化统计数据
 * 3. 启动心跳机制
 */
document.addEventListener('DOMContentLoaded', () => {
  initWorksData();
  initStatistics();
  startHeartbeat();
});

// ============================================
// 扩展功能预留区域
// ============================================
// 后续可在此添加：
// - 数据导出功能
// - 数据备份/恢复
// - 数据同步到后端API
// - 更复杂的查询过滤
// - 数据缓存优化
// ============================================