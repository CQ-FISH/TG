/**
 * 全站通用逻辑
 * 所有页面均需引入，依赖 config.js、database.js
 */

// ==================== 兼容性函数 ====================

/**
 * 获取当前登录用户（兼容函数）
 * 【说明】为了兼容旧代码中的getUser()调用
 * @returns {Object|null} 用户对象
 */
function getUser() {
  // 优先使用auth.js中的getCurrentUser
  if (typeof getCurrentUser === 'function') {
    return getCurrentUser();
  }
  // 回退到全局变量
  if (typeof window !== 'undefined' && window._currentUser) {
    return window._currentUser;
  }
  return null;
}

// 页面初始化
function initSite() {
  renderNavCategory();
  updateNavUserInfo();
  bindGlobalSearchEvent();
  bindBackToTopEvent();
  checkBrowserCompatibility();
  updateFooterStats();
}

// 1. 渲染导航栏分类下拉菜单
function renderNavCategory() {
  const navCategoryContainer = document.getElementById('nav-category-dropdown');
  if (!navCategoryContainer) return;

  let html = '';
  for (const key in CATEGORIES) {
    const category = CATEGORIES[key];
    html += `
      <a href="gallery.html?category=${category.id}" class="dropdown-item">
        ${category.icon} ${category.name}
      </a>
    `;
  }

  navCategoryContainer.innerHTML = html;
}

// 2. 更新导航栏用户信息
function updateNavUserInfo() {
  const user = getUser();
  const loginRegisterLink = document.getElementById('login-register-link');
  const userDropdown = document.getElementById('user-dropdown');
  const userAvatar = document.getElementById('user-avatar');
  const usernameDisplay = document.getElementById('username-display');

  if (loginRegisterLink && userDropdown) {
    if (user) {
      // 用户已登录
      loginRegisterLink.style.display = 'none';
      userDropdown.style.display = 'block';
      if (usernameDisplay) {
        usernameDisplay.textContent = user.username;
      }
    } else {
      // 用户未登录
      loginRegisterLink.style.display = 'block';
      userDropdown.style.display = 'none';
    }
  }
}

// 3. 全局搜索功能
function bindGlobalSearchEvent() {
  const searchInput = document.getElementById('global-search-input');
  const searchBtn = document.getElementById('global-search-btn');
  if (!searchInput || !searchBtn) return;

  // 搜索按钮点击事件
  function handleGlobalSearch() {
    const keyword = searchInput.value.trim();
    if (keyword) {
      // 跳转到图库页，携带搜索关键词
      window.location.href = `gallery.html?keyword=${encodeURIComponent(keyword)}`;
    }
  }

  searchBtn.addEventListener('click', handleGlobalSearch);
  // 回车搜索
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleGlobalSearch();
    }
  });
}

// 4. 返回顶部按钮事件
function bindBackToTopEvent() {
  const backToTopBtn = document.getElementById('back-to-top');
  if (!backToTopBtn) return;

  // 滚动显示/隐藏返回顶部按钮
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.style.display = 'block';
    } else {
      backToTopBtn.style.display = 'none';
    }
  });

  // 点击返回顶部
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// 5. 页面加载时，读取URL参数，初始化筛选状态
function initFilterFromUrl() {
  // 仅在图库页执行
  if (window.location.pathname.includes('gallery.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const keyword = urlParams.get('keyword');

    if (category && CATEGORIES[category]) {
      // 等待页面初始化完成后，更新筛选状态
      setTimeout(() => {
        filterState.mainCategory = category;
        filterState.subCategory = 'all';
        document.querySelectorAll('#main-category-filter .filter-btn').forEach(btn => {
          btn.classList.remove('active');
          if (btn.dataset.main === category) {
            btn.classList.add('active');
          }
        });
        renderSubCategoryFilter(category);
        renderWorksList();
      }, 100);
    }

    if (keyword) {
      // 等待页面初始化完成后，更新搜索框
      setTimeout(() => {
        filterState.searchKeyword = decodeURIComponent(keyword);
        const searchInput = document.getElementById('gallery-search');
        if (searchInput) {
          searchInput.value = filterState.searchKeyword;
          renderWorksList();
        }
      }, 100);
    }
  }
}

// 6. 浏览器兼容性检测与提示
function checkBrowserCompatibility() {
  // 检测 localStorage 支持
  try {
    const testKey = '__browser_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
  } catch (e) {
    alert('您的浏览器版本过低，无法使用本站的完整功能，请升级浏览器后访问');
  }

  // 检测 ES6 支持
  try {
    new Function('() => {}');
  } catch (e) {
    console.warn('您的浏览器不支持ES6语法，部分功能可能无法正常使用');
  }
}

// 7. 公共方法：图片懒加载兼容处理
function lazyLoadImages() {
  const images = document.querySelectorAll('img[loading="lazy"]');
  // 不支持原生懒加载的浏览器，用Intersection Observer实现
  if ('loading' in HTMLImageElement.prototype === false && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => {
      observer.observe(img);
    });
  }
}

// 8. 更新页脚统计信息 - 只显示在线人数和在线审核员
function updateFooterStats() {
  const onlineUsersEl = document.getElementById('online-users');
  const onlineReviewersEl = document.getElementById('online-reviewers');

  // 从 database.js 获取统计数据
  const stats = getStatistics();

  if (onlineUsersEl) {
    // 使用基于真实用户活动计算的在线人数
    onlineUsersEl.textContent = stats.onlineUsers;
  }

  if (onlineReviewersEl) {
    // 显示在线审核员数量
    onlineReviewersEl.textContent = stats.onlineReviewers;
  }
}

// 8.1 启动实时统计推送
// 【说明】只推送在线人数和在线审核员数据
function startRealtimeStatsPush() {
  // 立即更新一次
  updateFooterStats();

  // 每5秒从 database.js 获取最新统计数据并更新页面
  setInterval(() => {
    const onlineUsersEl = document.getElementById('online-users');
    const onlineReviewersEl = document.getElementById('online-reviewers');

    // 从 database.js 获取最新统计数据
    const stats = getStatistics();

    if (onlineUsersEl) {
      const oldValue = parseInt(onlineUsersEl.textContent) || 0;
      if (oldValue !== stats.onlineUsers) {
        onlineUsersEl.classList.add('updating');
        onlineUsersEl.textContent = stats.onlineUsers;
        setTimeout(() => onlineUsersEl.classList.remove('updating'), 500);
      }
    }

    if (onlineReviewersEl) {
      const oldValue = parseInt(onlineReviewersEl.textContent) || 0;
      if (oldValue !== stats.onlineReviewers) {
        onlineReviewersEl.classList.add('updating');
        onlineReviewersEl.textContent = stats.onlineReviewers;
        setTimeout(() => onlineReviewersEl.classList.remove('updating'), 500);
      }
    }
  }, 5000); // 每5秒更新一次页面显示
}

// 8.2 手动刷新统计数据（供其他页面调用）
function refreshFooterStats() {
  updateFooterStats();
}

// 9. 跳转到作品详情页
function goToWorkDetail(workId) {
  window.location.href = `detail.html?id=${workId}`;
}

// 10. 用户登出
function logout() {
  userLogout();
  updateNavUserInfo();
  window.location.href = 'index.html';
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  initSite();
  initFilterFromUrl();
  lazyLoadImages();
  // 启动实时统计推送
  startRealtimeStatsPush();
});
