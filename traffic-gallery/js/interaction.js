/**
 * ============================================================================
 * 交通图库 - 作品互动模块 (interaction.js)
 * ============================================================================
 * 
 * 【文件说明】
 * 本文件是交通图库网站的作品互动模块，实现了完整的社交互动功能：
 * 1. 点赞系统 - 用户可以为作品点赞，记录点赞历史
 * 2. 收藏系统 - 用户可以收藏喜欢的作品，创建个人收藏夹
 * 3. 评论系统 - 用户可以对作品发表评论，支持回复和点赞
 * 4. 分享功能 - 支持生成分享链接和二维码
 * 5. 浏览历史 - 记录用户浏览过的作品
 * 
 * 【技术特点】
 * - 基于内存数据库的实时互动
 * - 防刷机制（同一用户多次操作限制）
 * - 实时更新互动统计数据
 * - 支持评论的嵌套回复
 * 
 * 【数据结构】
 * - likes: 点赞记录
 * - favorites: 收藏记录
 * - comments: 评论记录
 * - shares: 分享记录
 * - history: 浏览历史
 * 
 * 【依赖关系】
 * - 必须在config.js和database.js之后引入
 * 
 * 【作者】AI Assistant
 * 【日期】2026-02-21
 * 【版本】v1.0.0
 * ============================================================================
 */

// ============================================
// 第一部分：点赞系统
// ============================================

/**
 * 点赞记录存储
 * 【说明】使用内存数组存储点赞记录
 */
const _likes = [];

/**
 * 为作品点赞
 * @param {string} workId - 作品ID
 * @param {string} username - 用户名
 * @returns {Object} 操作结果
 */
function likeWork(workId, username) {
  if (!workId || !username) {
    return { success: false, message: '参数错误' };
  }
  
  // 检查是否已点赞
  const existingLike = _likes.find(
    like => like.workId === workId && like.username === username
  );
  
  if (existingLike) {
    return { success: false, message: '您已经点赞过该作品' };
  }
  
  // 添加点赞记录
  _likes.push({
    workId: workId,
    username: username,
    createdAt: new Date().toISOString()
  });
  
  // 更新作品点赞数
  const work = getWorkById(workId);
  if (work) {
    work.likes = (work.likes || 0) + 1;
    updateWork(workId, { likes: work.likes });
  }
  
  // 记录日志
  if (typeof addLog === 'function') {
    addLog('like', `用户 ${username} 点赞作品 ${workId}`);
  }
  
  return { success: true, message: '点赞成功', likes: work ? work.likes : 0 };
}

/**
 * 取消点赞
 * @param {string} workId - 作品ID
 * @param {string} username - 用户名
 * @returns {Object} 操作结果
 */
function unlikeWork(workId, username) {
  if (!workId || !username) {
    return { success: false, message: '参数错误' };
  }
  
  // 查找点赞记录
  const likeIndex = _likes.findIndex(
    like => like.workId === workId && like.username === username
  );
  
  if (likeIndex === -1) {
    return { success: false, message: '您还没有点赞该作品' };
  }
  
  // 删除点赞记录
  _likes.splice(likeIndex, 1);
  
  // 更新作品点赞数
  const work = getWorkById(workId);
  if (work && work.likes > 0) {
    work.likes--;
    updateWork(workId, { likes: work.likes });
  }
  
  return { success: true, message: '取消点赞成功', likes: work ? work.likes : 0 };
}

/**
 * 检查用户是否已点赞
 * @param {string} workId - 作品ID
 * @param {string} username - 用户名
 * @returns {boolean} 是否已点赞
 */
function hasLiked(workId, username) {
  return _likes.some(
    like => like.workId === workId && like.username === username
  );
}

/**
 * 获取作品的点赞数
 * @param {string} workId - 作品ID
 * @returns {number} 点赞数
 */
function getWorkLikes(workId) {
  return _likes.filter(like => like.workId === workId).length;
}

/**
 * 获取用户点赞的作品列表
 * @param {string} username - 用户名
 * @returns {Array} 作品ID列表
 */
function getUserLikedWorks(username) {
  return _likes
    .filter(like => like.username === username)
    .map(like => like.workId);
}

// ============================================
// 第二部分：收藏系统
// ============================================

/**
 * 收藏记录存储
 * 【说明】使用内存数组存储收藏记录
 */
const _favorites = [];

/**
 * 收藏作品
 * @param {string} workId - 作品ID
 * @param {string} username - 用户名
 * @param {string} folder - 收藏夹名称（可选）
 * @returns {Object} 操作结果
 */
function favoriteWork(workId, username, folder = '默认收藏夹') {
  if (!workId || !username) {
    return { success: false, message: '参数错误' };
  }
  
  // 检查是否已收藏
  const existingFavorite = _favorites.find(
    fav => fav.workId === workId && fav.username === username
  );
  
  if (existingFavorite) {
    return { success: false, message: '您已经收藏过该作品' };
  }
  
  // 添加收藏记录
  _favorites.push({
    workId: workId,
    username: username,
    folder: folder,
    createdAt: new Date().toISOString()
  });
  
  // 更新作品收藏数
  const work = getWorkById(workId);
  if (work) {
    work.favorites = (work.favorites || 0) + 1;
    updateWork(workId, { favorites: work.favorites });
  }
  
  // 记录日志
  if (typeof addLog === 'function') {
    addLog('favorite', `用户 ${username} 收藏作品 ${workId} 到 ${folder}`);
  }
  
  return { 
    success: true, 
    message: '收藏成功', 
    favorites: work ? work.favorites : 0 
  };
}

/**
 * 取消收藏
 * @param {string} workId - 作品ID
 * @param {string} username - 用户名
 * @returns {Object} 操作结果
 */
function unfavoriteWork(workId, username) {
  if (!workId || !username) {
    return { success: false, message: '参数错误' };
  }
  
  // 查找收藏记录
  const favIndex = _favorites.findIndex(
    fav => fav.workId === workId && fav.username === username
  );
  
  if (favIndex === -1) {
    return { success: false, message: '您还没有收藏该作品' };
  }
  
  // 删除收藏记录
  _favorites.splice(favIndex, 1);
  
  // 更新作品收藏数
  const work = getWorkById(workId);
  if (work && work.favorites > 0) {
    work.favorites--;
    updateWork(workId, { favorites: work.favorites });
  }
  
  return { 
    success: true, 
    message: '取消收藏成功', 
    favorites: work ? work.favorites : 0 
  };
}

/**
 * 检查用户是否已收藏
 * @param {string} workId - 作品ID
 * @param {string} username - 用户名
 * @returns {boolean} 是否已收藏
 */
function hasFavorited(workId, username) {
  return _favorites.some(
    fav => fav.workId === workId && fav.username === username
  );
}

/**
 * 获取用户的收藏列表
 * @param {string} username - 用户名
 * @returns {Array} 收藏记录列表
 */
function getUserFavorites(username) {
  return _favorites.filter(fav => fav.username === username);
}

/**
 * 获取用户的收藏夹列表
 * @param {string} username - 用户名
 * @returns {Array} 收藏夹名称列表
 */
function getUserFavoriteFolders(username) {
  const folders = new Set();
  _favorites
    .filter(fav => fav.username === username)
    .forEach(fav => folders.add(fav.folder));
  return Array.from(folders);
}

/**
 * 移动收藏到指定文件夹
 * @param {string} workId - 作品ID
 * @param {string} username - 用户名
 * @param {string} newFolder - 新文件夹名称
 * @returns {Object} 操作结果
 */
function moveFavoriteToFolder(workId, username, newFolder) {
  const favorite = _favorites.find(
    fav => fav.workId === workId && fav.username === username
  );
  
  if (!favorite) {
    return { success: false, message: '收藏记录不存在' };
  }
  
  favorite.folder = newFolder;
  return { success: true, message: '移动成功' };
}

// ============================================
// 第三部分：评论系统
// ============================================

/**
 * 评论记录存储
 * 【说明】使用内存数组存储评论记录
 */
const _comments = [];
let _commentIdCounter = 1;

/**
 * 发表评论
 * @param {string} workId - 作品ID
 * @param {string} username - 用户名
 * @param {string} content - 评论内容
 * @param {string} parentId - 父评论ID（回复时使用）
 * @returns {Object} 操作结果
 */
function postComment(workId, username, content, parentId = null) {
  if (!workId || !username || !content) {
    return { success: false, message: '参数错误' };
  }
  
  // 验证评论内容
  content = content.trim();
  if (content.length < 1 || content.length > 500) {
    return { success: false, message: '评论内容长度应为1-500字符' };
  }
  
  // 创建评论对象
  const comment = {
    id: 'comment_' + _commentIdCounter++,
    workId: workId,
    username: username,
    content: content,
    parentId: parentId,
    likes: 0,
    createdAt: new Date().toISOString(),
    isDeleted: false
  };
  
  // 添加到评论列表
  _comments.push(comment);
  
  // 更新作品评论数
  const work = getWorkById(workId);
  if (work) {
    work.comments = (work.comments || 0) + 1;
    updateWork(workId, { comments: work.comments });
  }
  
  // 记录日志
  if (typeof addLog === 'function') {
    addLog('comment', `用户 ${username} 评论作品 ${workId}`);
  }
  
  return { success: true, message: '评论成功', comment: comment };
}

/**
 * 删除评论
 * @param {string} commentId - 评论ID
 * @param {string} username - 用户名（验证权限）
 * @returns {Object} 操作结果
 */
function deleteComment(commentId, username) {
  const comment = _comments.find(c => c.id === commentId);
  
  if (!comment) {
    return { success: false, message: '评论不存在' };
  }
  
  // 验证权限（只能删除自己的评论）
  if (comment.username !== username) {
    return { success: false, message: '无权删除该评论' };
  }
  
  // 标记为已删除
  comment.isDeleted = true;
  comment.content = '该评论已被删除';
  
  // 更新作品评论数
  const work = getWorkById(comment.workId);
  if (work && work.comments > 0) {
    work.comments--;
    updateWork(comment.workId, { comments: work.comments });
  }
  
  return { success: true, message: '删除成功' };
}

/**
 * 获取作品的评论列表
 * @param {string} workId - 作品ID
 * @param {Object} options - 选项
 * @returns {Array} 评论列表
 */
function getWorkComments(workId, options = {}) {
  const { page = 1, pageSize = 10, sortBy = 'time' } = options;
  
  let comments = _comments.filter(c => c.workId === workId && !c.isDeleted);
  
  // 排序
  if (sortBy === 'time') {
    comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortBy === 'likes') {
    comments.sort((a, b) => b.likes - a.likes);
  }
  
  // 分页
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  return {
    comments: comments.slice(start, end),
    total: comments.length,
    page: page,
    pageSize: pageSize,
    totalPages: Math.ceil(comments.length / pageSize)
  };
}

/**
 * 点赞评论
 * @param {string} commentId - 评论ID
 * @param {string} username - 用户名
 * @returns {Object} 操作结果
 */
function likeComment(commentId, username) {
  const comment = _comments.find(c => c.id === commentId);
  
  if (!comment) {
    return { success: false, message: '评论不存在' };
  }
  
  // 检查是否已点赞
  if (!comment.likedBy) {
    comment.likedBy = [];
  }
  
  if (comment.likedBy.includes(username)) {
    return { success: false, message: '您已经点赞过该评论' };
  }
  
  comment.likedBy.push(username);
  comment.likes++;
  
  return { success: true, message: '点赞成功', likes: comment.likes };
}

// ============================================
// 第四部分：分享功能
// ============================================

/**
 * 生成作品分享链接
 * @param {string} workId - 作品ID
 * @returns {string} 分享链接
 */
function generateShareLink(workId) {
  const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '');
  return `${baseUrl}/detail.html?id=${workId}`;
}

/**
 * 生成二维码（使用API）
 * @param {string} workId - 作品ID
 * @returns {string} 二维码图片URL
 */
function generateQRCode(workId) {
  const shareLink = generateShareLink(workId);
  // 使用免费的QRCode API
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareLink)}`;
}

/**
 * 分享作品到社交平台
 * @param {string} workId - 作品ID
 * @param {string} platform - 平台名称
 * @returns {Object} 操作结果
 */
function shareToPlatform(workId, platform) {
  const work = getWorkById(workId);
  if (!work) {
    return { success: false, message: '作品不存在' };
  }
  
  const shareLink = generateShareLink(workId);
  const shareText = `来看看这个精彩的作品：${work.title}`;
  
  let shareUrl = '';
  
  switch (platform) {
    case 'weibo':
      shareUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareLink)}&title=${encodeURIComponent(shareText)}`;
      break;
    case 'qq':
      shareUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(shareLink)}&title=${encodeURIComponent(shareText)}`;
      break;
    case 'wechat':
      // 微信需要显示二维码
      return { 
        success: true, 
        message: '请使用微信扫描二维码分享',
        qrCode: generateQRCode(workId)
      };
    default:
      return { success: false, message: '不支持的平台' };
  }
  
  // 打开分享窗口
  window.open(shareUrl, '_blank', 'width=600,height=400');
  
  return { success: true, message: '分享窗口已打开' };
}

// ============================================
// 第五部分：浏览历史
// ============================================

/**
 * 浏览历史存储
 * 【说明】使用内存数组存储浏览记录，限制最近100条
 */
const _history = [];
const MAX_HISTORY_SIZE = 100;

/**
 * 记录浏览历史
 * @param {string} workId - 作品ID
 * @param {string} username - 用户名
 */
function recordViewHistory(workId, username) {
  if (!workId || !username) return;
  
  // 移除重复记录
  const existingIndex = _history.findIndex(
    h => h.workId === workId && h.username === username
  );
  if (existingIndex !== -1) {
    _history.splice(existingIndex, 1);
  }
  
  // 添加新记录
  _history.unshift({
    workId: workId,
    username: username,
    viewedAt: new Date().toISOString()
  });
  
  // 限制历史记录数量
  if (_history.length > MAX_HISTORY_SIZE) {
    _history.pop();
  }
}

/**
 * 获取用户的浏览历史
 * @param {string} username - 用户名
 * @param {number} limit - 限制数量
 * @returns {Array} 浏览历史列表
 */
function getUserViewHistory(username, limit = 20) {
  return _history
    .filter(h => h.username === username)
    .slice(0, limit)
    .map(h => {
      const work = getWorkById(h.workId);
      return {
        ...h,
        work: work
      };
    })
    .filter(h => h.work !== null);
}

/**
 * 清除浏览历史
 * @param {string} username - 用户名
 */
function clearViewHistory(username) {
  for (let i = _history.length - 1; i >= 0; i--) {
    if (_history[i].username === username) {
      _history.splice(i, 1);
    }
  }
}

// ============================================
// 第六部分：UI渲染函数
// ============================================

/**
 * 渲染点赞按钮
 * @param {string} workId - 作品ID
 * @param {string} username - 当前用户名
 * @returns {string} HTML字符串
 */
function renderLikeButton(workId, username) {
  const hasLiked = username ? hasLiked(workId, username) : false;
  const likes = getWorkLikes(workId);
  
  return `
    <button class="btn-like ${hasLiked ? 'liked' : ''}" 
            onclick="handleLikeClick('${workId}', '${username}')"
            ${!username ? 'disabled title="请先登录"' : ''}>
      <span class="like-icon">${hasLiked ? '❤️' : '🤍'}</span>
      <span class="like-count">${likes}</span>
    </button>
  `;
}

/**
 * 渲染收藏按钮
 * @param {string} workId - 作品ID
 * @param {string} username - 当前用户名
 * @returns {string} HTML字符串
 */
function renderFavoriteButton(workId, username) {
  const hasFav = username ? hasFavorited(workId, username) : false;
  
  return `
    <button class="btn-favorite ${hasFav ? 'favorited' : ''}" 
            onclick="handleFavoriteClick('${workId}', '${username}')"
            ${!username ? 'disabled title="请先登录"' : ''}>
      <span class="favorite-icon">${hasFav ? '⭐' : '☆'}</span>
      <span class="favorite-text">${hasFav ? '已收藏' : '收藏'}</span>
    </button>
  `;
}

/**
 * 渲染分享按钮组
 * @param {string} workId - 作品ID
 * @returns {string} HTML字符串
 */
function renderShareButtons(workId) {
  return `
    <div class="share-buttons">
      <span class="share-label">分享：</span>
      <button class="btn-share" onclick="shareToPlatform('${workId}', 'weibo')" title="分享到微博">
        📢 微博
      </button>
      <button class="btn-share" onclick="shareToPlatform('${workId}', 'qq')" title="分享到QQ">
        💬 QQ
      </button>
      <button class="btn-share" onclick="showWechatQR('${workId}')" title="微信分享">
        📱 微信
      </button>
      <button class="btn-share" onclick="copyShareLink('${workId}')" title="复制链接">
        📋 复制链接
      </button>
    </div>
  `;
}

// ============================================
// 第七部分：事件处理函数
// ============================================

/**
 * 处理点赞点击
 * @param {string} workId - 作品ID
 * @param {string} username - 用户名
 */
function handleLikeClick(workId, username) {
  if (!username) {
    showToast('请先登录', 'warning');
    return;
  }
  
  const hasLikedBefore = hasLiked(workId, username);
  let result;
  
  if (hasLikedBefore) {
    result = unlikeWork(workId, username);
  } else {
    result = likeWork(workId, username);
  }
  
  if (result.success) {
    showToast(result.message, 'success');
    // 刷新点赞按钮
    const likeBtn = document.querySelector(`[onclick="handleLikeClick('${workId}', '${username}')"]`);
    if (likeBtn) {
      likeBtn.outerHTML = renderLikeButton(workId, username);
    }
  } else {
    showToast(result.message, 'error');
  }
}

/**
 * 处理收藏点击
 * @param {string} workId - 作品ID
 * @param {string} username - 用户名
 */
function handleFavoriteClick(workId, username) {
  if (!username) {
    showToast('请先登录', 'warning');
    return;
  }
  
  const hasFavBefore = hasFavorited(workId, username);
  let result;
  
  if (hasFavBefore) {
    result = unfavoriteWork(workId, username);
  } else {
    result = favoriteWork(workId, username);
  }
  
  if (result.success) {
    showToast(result.message, 'success');
    // 刷新收藏按钮
    const favBtn = document.querySelector(`[onclick="handleFavoriteClick('${workId}', '${username}')"]`);
    if (favBtn) {
      favBtn.outerHTML = renderFavoriteButton(workId, username);
    }
  } else {
    showToast(result.message, 'error');
  }
}

/**
 * 显示微信二维码
 * @param {string} workId - 作品ID
 */
function showWechatQR(workId) {
  const qrUrl = generateQRCode(workId);
  
  // 创建模态框
  const modal = document.createElement('div');
  modal.className = 'modal qr-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>微信扫一扫分享</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
      </div>
      <div class="modal-body">
        <img src="${qrUrl}" alt="分享二维码" class="qr-code">
        <p>使用微信扫描二维码即可分享</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

/**
 * 复制分享链接
 * @param {string} workId - 作品ID
 */
function copyShareLink(workId) {
  const link = generateShareLink(workId);
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(link).then(() => {
      showToast('链接已复制到剪贴板', 'success');
    }).catch(() => {
      showToast('复制失败，请手动复制', 'error');
    });
  } else {
    // 降级方案
    const input = document.createElement('input');
    input.value = link;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    showToast('链接已复制到剪贴板', 'success');
  }
}

/**
 * 显示提示消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型（success/error/warning/info）
 */
function showToast(message, type = 'info') {
  // 如果页面已有toast函数，使用它
  if (typeof window.showToast === 'function' && window.showToast !== showToast) {
    window.showToast(message, type);
    return;
  }
  
  // 创建toast元素
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 24px;
    border-radius: 4px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  // 根据类型设置背景色
  const colors = {
    success: '#27ae60',
    error: '#e74c3c',
    warning: '#f39c12',
    info: '#3498db'
  };
  toast.style.backgroundColor = colors[type] || colors.info;
  
  document.body.appendChild(toast);
  
  // 3秒后自动移除
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

console.log('[互动模块] interaction.js 已加载');
