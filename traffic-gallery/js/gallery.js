/**
 * 图库筛选页核心逻辑
 * 依赖 config.js、data.js，需优先引入
 */

// 全局筛选状态管理
let filterState = {
  mainCategory: 'all',
  subCategory: 'all',
  searchKeyword: '',
  selectedTags: [],
  currentPage: 1
};

// 页面初始化
function initGalleryPage() {
  renderMainCategoryFilter();
  renderTagFilter();
  renderWorksList();
  bindFilterEvents();
}

// 1. 渲染主分类筛选器
function renderMainCategoryFilter() {
  const mainFilterContainer = document.getElementById('main-category-filter');
  if (!mainFilterContainer) return;

  // 全部分类选项
  let html = `<button class="filter-btn active" data-main="all">全部分类</button>`;

  // 遍历生成所有主分类
  for (const key in CATEGORIES) {
    const category = CATEGORIES[key];
    html += `
      <button 
        class="filter-btn" 
        data-main="${category.id}"
        style="border-left: 3px solid ${category.themeColor}"
      >
        ${category.icon} ${category.name}
      </button>
    `;
  }

  mainFilterContainer.innerHTML = html;
}

// 2. 渲染子分类筛选器（根据主分类动态更新）
function renderSubCategoryFilter(mainCategoryId) {
  const subFilterContainer = document.getElementById('sub-category-filter');
  if (!subFilterContainer) return;

  // 全部子分类选项
  let html = `<button class="sub-filter-btn active" data-sub="all">全部子分类</button>`;

  // 主分类为全部时，不展示子分类
  if (mainCategoryId === 'all' || !CATEGORIES[mainCategoryId]) {
    subFilterContainer.innerHTML = html;
    return;
  }

  // 遍历生成对应主分类的子分类
  const subCategories = CATEGORIES[mainCategoryId].subCategories;
  subCategories.forEach(sub => {
    html += `
      <button class="sub-filter-btn" data-sub="${sub.id}">
        ${sub.name}
      </button>
    `;
  });

  subFilterContainer.innerHTML = html;
}

// 3. 渲染标签筛选器
function renderTagFilter() {
  const tagContainer = document.getElementById('tag-filter');
  if (!tagContainer) return;

  let html = '';
  PRESET_TAGS.forEach(tag => {
    html += `<span class="tag-item" data-tag="${tag}">${tag}</span>`;
  });

  tagContainer.innerHTML = html;
}

// 4. 执行作品筛选
function filterWorks() {
  let allWorks = getAllWorks();
  let filteredWorks = allWorks;

  // 主分类筛选
  if (filterState.mainCategory !== 'all') {
    filteredWorks = filteredWorks.filter(
      work => work.category.main === filterState.mainCategory
    );
  }

  // 子分类筛选
  if (filterState.subCategory !== 'all') {
    filteredWorks = filteredWorks.filter(
      work => work.category.sub === filterState.subCategory
    );
  }

  // 标签筛选
  if (filterState.selectedTags.length > 0) {
    filteredWorks = filteredWorks.filter(work => {
      return filterState.selectedTags.some(tag => work.tags.includes(tag));
    });
  }

  // 关键词搜索筛选
  if (filterState.searchKeyword.trim()) {
    const keyword = filterState.searchKeyword.trim().toLowerCase();
    filteredWorks = filteredWorks.filter(work => {
      return (
        work.title.toLowerCase().includes(keyword) ||
        work.description.toLowerCase().includes(keyword) ||
        work.location.toLowerCase().includes(keyword) ||
        work.photographer.toLowerCase().includes(keyword) ||
        work.tags.some(tag => tag.toLowerCase().includes(keyword))
      );
    });
  }

  return filteredWorks;
}

// 5. 渲染作品列表
function renderWorksList() {
  const worksGrid = document.getElementById('works-grid');
  const worksCount = document.getElementById('works-count');
  if (!worksGrid || !worksCount) return;

  const filteredWorks = filterWorks();
  const total = filteredWorks.length;

  // 更新作品数量
  worksCount.textContent = `共找到 ${total} 件作品`;

  // 无数据处理
  if (total === 0) {
    worksGrid.innerHTML = `<div class="no-data" style="text-align: center; padding: 3rem; color: #7f8c8d;">暂无符合条件的作品，换个筛选条件试试吧~</div>`;
    return;
  }

  // 分页处理
  const start = (filterState.currentPage - 1) * GLOBAL_CONST.PAGE_SIZE;
  const end = start + GLOBAL_CONST.PAGE_SIZE;
  const paginatedWorks = filteredWorks.slice(start, end);

  // 渲染作品卡片
  let html = '';
  paginatedWorks.forEach(work => {
    const category = CATEGORIES[work.category.main];
    html += `
      <div class="work-card" onclick="goToWorkDetail(${work.id})">
        <div class="card-img-wrapper">
          <img 
            src="${work.thumbnailUrl}" 
            alt="${work.title}" 
            loading="lazy"
          >
          <span class="category-badge" style="background-color: ${category.themeColor}">
            ${category.icon} ${category.name}
          </span>
        </div>
        <div class="card-content">
          <h3 class="work-title">${work.title}</h3>
          <p class="work-meta">
            <span>📷 ${work.photographer}</span>
            <span>📍 ${work.location}</span>
          </p>
          <div class="work-tags">
            ${work.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
          <div class="work-stats">
            <span>👁️ ${work.views}</span>
            <span>❤️ ${work.likes}</span>
          </div>
        </div>
      </div>
    `;
  });

  worksGrid.innerHTML = html;
  // 渲染分页
  renderPagination(total);
}

// 6. 渲染分页器
function renderPagination(total) {
  const paginationContainer = document.getElementById('pagination');
  if (!paginationContainer) return;

  const totalPage = Math.ceil(total / GLOBAL_CONST.PAGE_SIZE);
  if (totalPage <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }

  let html = '';
  // 上一页
  html += `<button class="page-btn" ${filterState.currentPage === 1 ? 'disabled' : ''} data-page="prev">上一页</button>`;
  // 页码
  for (let i = 1; i <= totalPage; i++) {
    html += `<button class="page-btn ${i === filterState.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  // 下一页
  html += `<button class="page-btn" ${filterState.currentPage === totalPage ? 'disabled' : ''} data-page="next">下一页</button>`;

  paginationContainer.innerHTML = html;
}

// 7. 绑定所有筛选事件
function bindFilterEvents() {
  // 主分类点击事件
  document.getElementById('main-category-filter').addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      // 更新按钮状态
      document.querySelectorAll('#main-category-filter .filter-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      e.target.classList.add('active');

      // 更新筛选状态
      filterState.mainCategory = e.target.dataset.main;
      filterState.subCategory = 'all';
      filterState.currentPage = 1;

      // 更新子分类
      renderSubCategoryFilter(filterState.mainCategory);
      // 重新渲染作品
      renderWorksList();
    }
  });

  // 子分类点击事件
  document.getElementById('sub-category-filter').addEventListener('click', (e) => {
    if (e.target.classList.contains('sub-filter-btn')) {
      document.querySelectorAll('#sub-category-filter .sub-filter-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      e.target.classList.add('active');

      filterState.subCategory = e.target.dataset.sub;
      filterState.currentPage = 1;
      renderWorksList();
    }
  });

  // 标签点击事件
  document.getElementById('tag-filter').addEventListener('click', (e) => {
    if (e.target.classList.contains('tag-item')) {
      const tag = e.target.dataset.tag;
      const index = filterState.selectedTags.indexOf(tag);

      // 切换标签选中状态
      if (index === -1) {
        filterState.selectedTags.push(tag);
        e.target.classList.add('active');
      } else {
        filterState.selectedTags.splice(index, 1);
        e.target.classList.remove('active');
      }

      filterState.currentPage = 1;
      renderWorksList();
    }
  });

  // 搜索框输入事件
  document.getElementById('gallery-search').addEventListener('input', (e) => {
    filterState.searchKeyword = e.target.value;
    filterState.currentPage = 1;
    renderWorksList();
  });

  // 分页点击事件
  document.getElementById('pagination').addEventListener('click', (e) => {
    if (e.target.classList.contains('page-btn') && !e.target.disabled) {
      const page = e.target.dataset.page;
      const totalPage = Math.ceil(filterWorks().length / GLOBAL_CONST.PAGE_SIZE);

      if (page === 'prev') {
        filterState.currentPage = Math.max(1, filterState.currentPage - 1);
      } else if (page === 'next') {
        filterState.currentPage = Math.min(totalPage, filterState.currentPage + 1);
      } else {
        filterState.currentPage = Number(page);
      }

      renderWorksList();
      // 滚动到顶部
      document.querySelector('.filter-section').scrollIntoView({ behavior: 'smooth' });
    }
  });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initGalleryPage);
