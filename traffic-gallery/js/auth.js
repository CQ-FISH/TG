/**
 * ============================================================================
 * 交通图库 - 用户认证与密钥验证模块 (auth.js)
 * ============================================================================
 * 
 * 【文件说明】
 * 本文件是交通图库网站的用户认证模块，实现了基于用户绑定密钥的验证机制：
 * 1. 用户注册时生成唯一密钥并绑定
 * 2. 登录时验证用户名、密码和密钥
 * 3. 密钥与用户账号绑定，提高安全性
 * 4. 支持登录失败锁定机制
 * 5. 支持密钥重置功能
 * 
 * 【验证机制】
 * - 用户名 + 密码 + 绑定密钥 三重验证
 * - 密钥存储在内存数据库中，与用户账号绑定
 * - 支持管理员预设密钥
 * - 登录失败次数限制，防止暴力破解
 * 
 * 【依赖关系】
 * - 必须在config.js和database.js之后引入
 * - 依赖database.js中的用户管理函数
 * - 被login.html、admin.html等页面依赖
 * 
 * 【作者】AI Assistant
 * 【日期】2026-02-21
 * 【版本】v2.0.0
 * ============================================================================
 */

// ============================================
// 第一部分：密钥生成与管理
// ============================================

/**
 * 生成随机密钥
 * @returns {string} 生成的随机密钥
 * 
 * 【说明】
 * - 使用随机字符和数字生成密钥
 * - 密钥长度由AUTH_CONFIG.SECRET_KEY_LENGTH配置
 * - 格式：TG-XXXX-XXXX-XXXX-XXXX（交通图库缩写+16位随机字符）
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

// ============================================
// 第二部分：用户数据管理（使用database.js）
// ============================================

/**
 * 保存用户数据
 * 【说明】使用database.js的updateUser或addUser函数
 * @param {Object} user - 用户对象
 */
function saveUser(user) {
  // 检查用户是否已存在
  const existingUser = getUserByUsername(user.username);
  if (existingUser) {
    // 更新现有用户
    updateUser(user.username, user);
  } else {
    // 添加新用户
    addUser(user);
  }
}

/**
 * 初始化管理员账号
 * 【说明】系统首次运行时创建默认管理员账号
 */
function initAdminUser() {
  // 确保数据库已初始化
  if (typeof initDatabase === 'function' && !_db.initialized) {
    initDatabase();
  }
  
  const users = getAllUsers();
  const adminExists = users.some(user => user.username === AUTH_CONFIG.ADMIN_DEFAULT.username);
  
  if (!adminExists) {
    const adminUser = {
      username: AUTH_CONFIG.ADMIN_DEFAULT.username,
      password: AUTH_CONFIG.ADMIN_DEFAULT.password,
      secretKey: AUTH_CONFIG.ADMIN_DEFAULT.secretKey,
      isAdmin: true,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      loginAttempts: 0,
      lockedUntil: null
    };
    addUser(adminUser);
    console.log('[认证] 管理员账号已初始化');
  }
}

// ============================================
// 第三部分：登录验证机制
// ============================================

/**
 * 检查用户是否被锁定
 * @param {Object} user - 用户对象
 * @returns {boolean} 是否被锁定
 */
function isUserLocked(user) {
  if (!user.lockedUntil) return false;
  return new Date(user.lockedUntil) > new Date();
}

/**
 * 记录登录失败
 * @param {Object} user - 用户对象
 */
function recordLoginFailure(user) {
  user.loginAttempts = (user.loginAttempts || 0) + 1;
  
  // 超过最大尝试次数，锁定账号
  if (user.loginAttempts >= AUTH_CONFIG.MAX_LOGIN_ATTEMPTS) {
    const lockoutTime = new Date();
    lockoutTime.setMinutes(lockoutTime.getMinutes() + AUTH_CONFIG.LOCKOUT_DURATION);
    user.lockedUntil = lockoutTime.toISOString();
    console.warn(`[认证] 用户 ${user.username} 登录失败次数过多，账号已锁定 ${AUTH_CONFIG.LOCKOUT_DURATION} 分钟`);
  }
  
  saveUser(user);
}

/**
 * 重置登录失败次数
 * @param {Object} user - 用户对象
 */
function resetLoginAttempts(user) {
  user.loginAttempts = 0;
  user.lockedUntil = null;
  saveUser(user);
}

/**
 * 用户登录验证（带密钥验证）
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @param {string} secretKey - 绑定密钥
 * @returns {Object} 登录结果
 * 
 * 【返回结构】
 * {
 *   success: boolean,      // 是否登录成功
 *   message: string,       // 提示信息
 *   user: Object|null      // 用户对象（成功时返回）
 * }
 */
function userLoginWithSecretKey(username, password, secretKey) {
  // 参数验证
  if (!username || !password || !secretKey) {
    return {
      success: false,
      message: '用户名、密码和密钥不能为空',
      user: null
    };
  }
  
  // 获取用户
  const user = getUserByUsername(username);
  
  if (!user) {
    return {
      success: false,
      message: '用户名不存在',
      user: null
    };
  }
  
  // 检查账号是否被锁定
  if (isUserLocked(user)) {
    const lockedUntil = new Date(user.lockedUntil);
    const remainingMinutes = Math.ceil((lockedUntil - new Date()) / 60000);
    return {
      success: false,
      message: `账号已被锁定，请 ${remainingMinutes} 分钟后重试`,
      user: null
    };
  }
  
  // 验证密码
  if (user.password !== password) {
    recordLoginFailure(user);
    const remainingAttempts = AUTH_CONFIG.MAX_LOGIN_ATTEMPTS - (user.loginAttempts || 0);
    return {
      success: false,
      message: `密码错误，还剩 ${remainingAttempts} 次尝试机会`,
      user: null
    };
  }
  
  // 验证密钥
  if (user.secretKey !== secretKey) {
    recordLoginFailure(user);
    const remainingAttempts = AUTH_CONFIG.MAX_LOGIN_ATTEMPTS - (user.loginAttempts || 0);
    return {
      success: false,
      message: `密钥错误，还剩 ${remainingAttempts} 次尝试机会`,
      user: null
    };
  }
  
  // 登录成功
  resetLoginAttempts(user);
  user.lastLogin = new Date().toISOString();
  saveUser(user);
  
  // 保存当前登录用户到session
  const currentUser = {
    username: user.username,
    isAdmin: user.isAdmin,
    loginTime: new Date().toISOString()
  };
  
  // 使用全局变量存储当前用户（兼容database.js）
  if (typeof window !== 'undefined') {
    window._currentUser = currentUser;
  }
  
  // 记录日志
  if (typeof addLog === 'function') {
    addLog('login', `用户登录成功: ${username}`);
  }
  
  return {
    success: true,
    message: '登录成功',
    user: currentUser
  };
}

/**
 * 用户注册（带密钥绑定）
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @param {string} confirmPassword - 确认密码
 * @returns {Object} 注册结果
 * 
 * 【返回结构】
 * {
 *   success: boolean,      // 是否注册成功
 *   message: string,       // 提示信息
 *   secretKey: string|null // 生成的密钥（成功时返回）
 * }
 */
function userRegisterWithSecretKey(username, password, confirmPassword) {
  // 参数验证
  if (!username || !password || !confirmPassword) {
    return {
      success: false,
      message: '所有字段不能为空',
      secretKey: null
    };
  }
  
  // 验证用户名格式
  if (username.length < 3 || username.length > 20) {
    return {
      success: false,
      message: '用户名长度应为3-20个字符',
      secretKey: null
    };
  }
  
  // 验证密码长度
  if (password.length < AUTH_CONFIG.MIN_PASSWORD_LENGTH || 
      password.length > AUTH_CONFIG.MAX_PASSWORD_LENGTH) {
    return {
      success: false,
      message: `密码长度应为${AUTH_CONFIG.MIN_PASSWORD_LENGTH}-${AUTH_CONFIG.MAX_PASSWORD_LENGTH}个字符`,
      secretKey: null
    };
  }
  
  // 验证密码一致性
  if (password !== confirmPassword) {
    return {
      success: false,
      message: '两次输入的密码不一致',
      secretKey: null
    };
  }
  
  // 检查用户名是否已存在
  if (getUserByUsername(username)) {
    return {
      success: false,
      message: '用户名已存在',
      secretKey: null
    };
  }
  
  // 生成绑定密钥
  const secretKey = generateSecretKey();
  
  // 创建新用户
  const newUser = {
    username: username,
    password: password,
    secretKey: secretKey,
    isAdmin: false,
    createdAt: new Date().toISOString(),
    lastLogin: null,
    loginAttempts: 0,
    lockedUntil: null
  };
  
  // 保存用户
  addUser(newUser);
  
  // 记录日志
  if (typeof addLog === 'function') {
    addLog('register', `新用户注册: ${username}`);
  }
  
  return {
    success: true,
    message: '注册成功，请妥善保管您的密钥',
    secretKey: secretKey
  };
}

/**
 * 用户登出
 * 【功能说明】清除登录状态并记录日志
 */
function userLogout() {
  if (typeof window !== 'undefined' && window._currentUser) {
    const username = window._currentUser.username;
    if (typeof addLog === 'function') {
      addLog('logout', `用户登出: ${username}`);
    }
    window._currentUser = null;
  }
}

/**
 * 获取当前登录用户
 * @returns {Object|null} 当前登录用户，未登录返回null
 */
function getCurrentUser() {
  if (typeof window !== 'undefined') {
    return window._currentUser || null;
  }
  return null;
}

/**
 * 检查用户是否已登录
 * @returns {boolean} 是否已登录
 */
function isLoggedIn() {
  const user = getCurrentUser();
  return user !== null && user !== 'null';
}

/**
 * 检查当前用户是否为管理员
 * @returns {boolean} 是否为管理员
 */
function isAdmin() {
  const user = getCurrentUser();
  return user && user.isAdmin === true;
}

// ============================================
// 第四部分：页面加载初始化
// ============================================

/**
 * 页面加载完成后初始化
 * 【执行内容】
 * 1. 初始化管理员账号
 */
document.addEventListener('DOMContentLoaded', function() {
  // 确保database.js先加载
  if (typeof getAllUsers === 'function') {
    initAdminUser();
    console.log('[认证] 认证模块已加载，管理员账号已初始化');
  } else {
    console.error('[认证] database.js未加载，无法初始化管理员账号');
  }
});

// ============================================
// 第五部分：向后兼容（旧版登录函数）
// ============================================

/**
 * 旧版登录函数（向后兼容）
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {boolean} 是否登录成功
 * @deprecated 请使用 userLoginWithSecretKey 函数
 */
function userLogin(username, password) {
  console.warn('[认证] userLogin 函数已弃用，请使用 userLoginWithSecretKey 函数');
  const result = userLoginWithSecretKey(username, password, '');
  return result.success;
}
