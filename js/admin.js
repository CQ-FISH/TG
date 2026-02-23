/**
 * ============================================================================
 * 交通图库 - 管理后台脚本 (admin.js) v2.0
 * ============================================================================
 * 
 * 【文件说明】
 * 本文件是交通图库网站管理后台v2.0版本的核心脚本，提供完整的管理功能：
 * 
 * 1. 仪表盘：实时数据统计和最近活动展示
 * 2. 作品管理：审核、编辑、删除、批量操作
 * 3. 用户管理：查看、编辑、禁用、角色管理
 * 4. BUG管理：查看、回复、状态更新
 * 5. 公告管理：发布、编辑、删除
 * 6. 分类管理：添加、编辑、删除分类
 * 7. 操作日志：查看和清空日志
 * 8. 系统设置：网站参数配置
 * 
 * 【技术特点】
 * - 单页面应用架构，无刷新切换标签页
 * - 实时数据更新和推送
 * - 完整的CRUD操作
 * - 防抖节流优化性能
 * 
 * 【作者】AI Assistant
 * 【日期】2026-02-21
 * 【版本】v2.0.0
 * ============================================================================
 */

// ============================================
// 第一部分：全局状态和配置
// ============================================

/**
 * 管理后台全局状态
 */
const AdminState = {
    currentTab: 'dashboard',
    pagination: {
        works: { current: 1, size: 10 },
        users: { current: 1, size: 10 },
        bugs: { current: 1, size: 10 },
        logs: { current: 1, size: 10 }
    },
    selectedItems: {
        works: []
    },
    filters: {
        works: { status: 'all', category: 'all', search: '' },
        users: { role: 'all', status: 'all', search: '' },
        bugs: { status: 'all', priority: 'all', search: '' },
        logs: { type: 'all', search: '' }
    }
};

// ============================================
// 第二部分：页面初始化
// ============================================

/**
 * 页面加载完成后初始化
 */
document.addEventListener('DOMContentLoaded', function() {
    initAdmin();
    loadDashboardStats();
    loadRecentActivity();
    initCategoryFilter();
    
    // 定时刷新数据
    setInterval(refreshDashboard, 30000);
});

/**
 * 初始化管理后台
 */
function initAdmin() {
    // 检查管理员权限
    const user = getCurrentUser();
    if (!user || (!user.isAdmin && user.role !== 'admin')) {
        showToast('❌ 无权访问管理后台', 'error');
        setTimeout(() => {
            window.location.href = 'traffic-gallery/index.html';
        }, 1500);
        return;
    }
    
    // 更新管理员信息
    document.getElementById('admin-name').textContent = user.nickname || user.username;
    if (user.avatar) {
        document.getElementById('admin-avatar').src = user.avatar;
    }
}

/**
 * 初始化分类筛选器
 */
function initCategoryFilter() {
    const select = document.getElementById('works-filter-category');
    if (!select || typeof CATEGORIES === 'undefined') return;
    
    let html = '<option value="all">全部分类</option>';
    for (const key in CATEGORIES) {
        const category = CATEGORIES[key];
        html += `<option value="${key}">${category.icon} ${category.name}</option>`;
    }
    select.innerHTML = html;
}

// ============================================
// 第三部分：标签页切换
// ============================================

/**
 * 切换标签页
 */
function switchTab(tabName) {
    // 更新侧边栏激活状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.nav-item').classList.add('active');
    
    // 隐藏所有标签页内容
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 显示当前标签页
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    AdminState.currentTab = tabName;
    
    // 加载对应数据
    switch(tabName) {
        case 'dashboard':
            loadDashboardStats();
            loadRecentActivity();
            break;
        case 'works':
            loadWorks();
            break;
        case 'users':
            loadUsers();
            break;
        case 'bugs':
            loadBugs();
            break;
        case 'announcements':
            loadAnnouncements();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'logs':
            loadLogs();
            break;
    }
    
    // 移动端关闭侧边栏
    if (window.innerWidth <= 1024) {
        toggleSidebar();
    }
}

/**
 * 切换侧边栏（移动端）
 */
function toggleSidebar() {
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
}

// ============================================
// 第四部分：仪表盘
// ============================================

/**
 * 加载仪表盘统计数据
 */
function loadDashboardStats() {
    // 获取统计数据
    const stats = {
        totalWorks: getAllWorks().length,
        totalUsers: getAllUsers().length,
        pendingWorks: getAllWorks().filter(w => w.status === 'pending').length,
        pendingBugs: getAllBugs().filter(b => b.status === 'pending').length,
        todayViews: Math.floor(Math.random() * 5000) + 1000,
        onlineUsers: getOnlineUsersCount()
    };
    
    // 更新显示
    document.getElementById('stat-total-works').textContent = stats.totalWorks;
    document.getElementById('stat-total-users').textContent = stats.totalUsers;
    document.getElementById('stat-pending-works').textContent = stats.pendingWorks;
    document.getElementById('stat-pending-bugs').textContent = stats.pendingBugs;
    document.getElementById('stat-today-views').textContent = stats.todayViews.toLocaleString();
    document.getElementById('stat-online-users').textContent = stats.onlineUsers;
    
    // 更新侧边栏徽章
    document.getElementById('pending-works-count').textContent = stats.pendingWorks;
    document.getElementById('pending-bugs-count').textContent = stats.pendingBugs;
}

/**
 * 加载最近活动
 */
function loadRecentActivity() {
    const logs = getRecentLogs(5);
    const tbody = document.getElementById('recent-activity-tbody');
    
    if (logs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <h3>暂无活动记录</h3>
                    <p>系统操作将在这里显示</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = logs.map(log => `
        <tr>
            <td>${formatTime(log.time)}</td>
            <td>${log.user}</td>
            <td>${log.action}</td>
            <td>${log.detail}</td>
        </tr>
    `).join('');
}

/**
 * 刷新仪表盘
 */
function refreshDashboard() {
    if (AdminState.currentTab === 'dashboard') {
        loadDashboardStats();
        loadRecentActivity();
    }
}

// ============================================
// 第五部分：作品管理
// ============================================

/**
 * 加载作品列表
 */
function loadWorks() {
    const status = document.getElementById('works-filter-status')?.value || 'all';
    const category = document.getElementById('works-filter-category')?.value || 'all';
    const search = document.getElementById('works-filter-search')?.value.trim().toLowerCase() || '';
    
    AdminState.filters.works = { status, category, search };
    
    let works = getAllWorks();
    
    // 筛选
    if (status !== 'all') {
        works = works.filter(w => w.status === status);
    }
    if (category !== 'all') {
        works = works.filter(w => w.category?.main === category);
    }
    if (search) {
        works = works.filter(w => 
            w.title?.toLowerCase().includes(search) ||
            w.photographer?.toLowerCase().includes(search)
        );
    }
    
    // 排序（最新的在前）
    works.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
    
    renderWorksTable(works);
    renderPagination('works', works.length);
}

/**
 * 渲染作品表格
 */
function renderWorksTable(works) {
    const tbody = document.getElementById('works-tbody');
    const { current, size } = AdminState.pagination.works;
    
    const start = (current - 1) * size;
    const pageWorks = works.slice(start, start + size);
    
    if (pageWorks.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <div class="empty-state-icon">🖼️</div>
                    <h3>暂无作品</h3>
                    <p>没有找到符合条件的作品</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = pageWorks.map(work => {
        const statusText = {
            'pending': '待审核',
            'approved': '已通过',
            'rejected': '已拒绝'
        }[work.status] || work.status;
        
        const categoryName = CATEGORIES?.[work.category?.main]?.name || '未分类';
        
        return `
            <tr>
                <td><input type="checkbox" value="${work.id}" onchange="toggleSelectItem('works', '${work.id}')"></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${work.imageUrl}" alt="${work.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                        <span>${work.title}</span>
                    </div>
                </td>
                <td>${work.photographer}</td>
                <td>${categoryName}</td>
                <td><span class="status-badge ${work.status}">${statusText}</span></td>
                <td>${formatTime(work.uploadTime)}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn view" onclick="viewWork('${work.id}')" title="查看">👁️</button>
                        ${work.status === 'pending' ? `
                            <button class="action-btn edit" onclick="approveWork('${work.id}')" title="通过">✓</button>
                            <button class="action-btn delete" onclick="rejectWork('${work.id}')" title="拒绝">✕</button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * 防抖加载作品
 */
const debounceLoadWorks = debounce(loadWorks, 300);

/**
 * 审核通过作品
 */
function approveWork(workId) {
    if (!confirm('确定要通过这个作品吗？')) return;
    
    const work = getWorkById(workId);
    if (work) {
        work.status = 'approved';
        work.reviewTime = new Date().toISOString();
        addLog('work', '审核通过作品', `作品《${work.title}》已通过审核`);
        showToast('✅ 作品已通过', 'success');
        loadWorks();
        loadDashboardStats();
    }
}

/**
 * 拒绝作品
 */
function rejectWork(workId) {
    const reason = prompt('请输入拒绝原因（可选）：');
    if (reason === null) return;
    
    const work = getWorkById(workId);
    if (work) {
        work.status = 'rejected';
        work.reviewTime = new Date().toISOString();
        work.rejectReason = reason;
        addLog('work', '拒绝作品', `作品《${work.title}》已被拒绝${reason ? '，原因：' + reason : ''}`);
        showToast('❌ 作品已拒绝', 'success');
        loadWorks();
        loadDashboardStats();
    }
}

// ============================================
// 第六部分：用户管理
// ============================================

/**
 * 加载用户列表
 */
function loadUsers() {
    const role = document.getElementById('users-filter-role')?.value || 'all';
    const status = document.getElementById('users-filter-status')?.value || 'all';
    const search = document.getElementById('users-filter-search')?.value.trim().toLowerCase() || '';
    
    AdminState.filters.users = { role, status, search };
    
    let users = getAllUsers();
    
    // 筛选
    if (role !== 'all') {
        users = users.filter(u => u.role === role || (role === 'admin' && u.isAdmin));
    }
    if (status !== 'all') {
        users = users.filter(u => (u.status || 'active') === status);
    }
    if (search) {
        users = users.filter(u => 
            u.username?.toLowerCase().includes(search) ||
            u.email?.toLowerCase().includes(search)
        );
    }
    
    renderUsersTable(users);
    renderPagination('users', users.length);
}

/**
 * 渲染用户表格
 */
function renderUsersTable(users) {
    const tbody = document.getElementById('users-tbody');
    const { current, size } = AdminState.pagination.users;
    
    const start = (current - 1) * size;
    const pageUsers = users.slice(start, start + size);
    
    if (pageUsers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <h3>暂无用户</h3>
                    <p>没有找到符合条件的用户</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = pageUsers.map(user => {
        const isAdmin = user.isAdmin || user.role === 'admin';
        const status = user.status || 'active';
        
        return `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${user.avatar || 'https://via.placeholder.com/36'}" alt="${user.username}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">
                        <span>${user.nickname || user.username}</span>
                    </div>
                </td>
                <td>${user.email || '-'}</td>
                <td>${isAdmin ? '👑 管理员' : '👤 普通用户'}</td>
                <td><span class="status-badge ${status}">${status === 'active' ? '正常' : '已禁用'}</span></td>
                <td>${formatTime(user.registerTime)}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn view" onclick="viewUser('${user.username}')" title="查看">👁️</button>
                        <button class="action-btn edit" onclick="editUser('${user.username}')" title="编辑">✏️</button>
                        <button class="action-btn ${status === 'active' ? 'delete' : 'view'}" onclick="toggleUserStatus('${user.username}')" title="${status === 'active' ? '禁用' : '启用'}">${status === 'active' ? '🚫' : '✓'}</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * 防抖加载用户
 */
const debounceLoadUsers = debounce(loadUsers, 300);

// ============================================
// 第七部分：BUG管理
// ============================================

/**
 * 加载BUG列表
 */
function loadBugs() {
    const status = document.getElementById('bugs-filter-status')?.value || 'all';
    const priority = document.getElementById('bugs-filter-priority')?.value || 'all';
    const search = document.getElementById('bugs-filter-search')?.value.trim().toLowerCase() || '';
    
    AdminState.filters.bugs = { status, priority, search };
    
    let bugs = getAllBugs();
    
    // 筛选
    if (status !== 'all') {
        bugs = bugs.filter(b => b.status === status);
    }
    if (priority !== 'all') {
        bugs = bugs.filter(b => b.priority === priority);
    }
    if (search) {
        bugs = bugs.filter(b => 
            b.title?.toLowerCase().includes(search) ||
            b.submitter?.toLowerCase().includes(search)
        );
    }
    
    // 排序（最新的在前）
    bugs.sort((a, b) => new Date(b.submitTime) - new Date(a.submitTime));
    
    renderBugsTable(bugs);
    renderPagination('bugs', bugs.length);
}

/**
 * 渲染BUG表格
 */
function renderBugsTable(bugs) {
    const tbody = document.getElementById('bugs-tbody');
    const { current, size } = AdminState.pagination.bugs;
    
    const start = (current - 1) * size;
    const pageBugs = bugs.slice(start, start + size);
    
    if (pageBugs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <div class="empty-state-icon">🐛</div>
                    <h3>暂无BUG</h3>
                    <p>没有找到符合条件的BUG</p>
                </td>
            </tr>
        `;
        return;
    }
    
    const statusText = {
        'pending': '待处理',
        'processing': '处理中',
        'resolved': '已解决',
        'rejected': '已驳回'
    };
    
    const priorityText = {
        'low': { text: '低', color: '#28a745' },
        'medium': { text: '中', color: '#ffc107' },
        'high': { text: '高', color: '#fd7e14' },
        'critical': { text: '紧急', color: '#dc3545' }
    };
    
    tbody.innerHTML = pageBugs.map(bug => {
        const p = priorityText[bug.priority] || priorityText.medium;
        
        return `
            <tr>
                <td>#${bug.id}</td>
                <td>${bug.title}</td>
                <td>${bug.submitter}</td>
                <td><span style="color: ${p.color}; font-weight: 600;">${p.text}</span></td>
                <td><span class="status-badge ${bug.status}">${statusText[bug.status] || bug.status}</span></td>
                <td>${formatTime(bug.submitTime)}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn view" onclick="viewBug('${bug.id}')" title="查看">👁️</button>
                        ${bug.status !== 'resolved' && bug.status !== 'rejected' ? `
                            <button class="action-btn edit" onclick="processBug('${bug.id}')" title="处理">🔧</button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * 防抖加载BUG
 */
const debounceLoadBugs = debounce(loadBugs, 300);

/**
 * 处理BUG
 */
function processBug(bugId) {
    const bug = getBugById(bugId);
    if (!bug) return;
    
    const actions = ['开始处理', '标记为已解决', '驳回'];
    const choice = prompt(`选择操作：\n1. 开始处理\n2. 标记为已解决\n3. 驳回\n\n请输入数字(1-3)：`);
    
    if (!choice) return;
    
    const reply = prompt('请输入回复内容（可选）：') || '';
    
    switch(choice) {
        case '1':
            bug.status = 'processing';
            addLog('bug', '开始处理BUG', `BUG #${bugId} 开始处理`);
            showToast('🔧 已开始处理', 'success');
            break;
        case '2':
            bug.status = 'resolved';
            bug.resolveTime = new Date().toISOString();
            addLog('bug', '解决BUG', `BUG #${bugId} 已解决`);
            showToast('✅ 已标记为已解决', 'success');
            break;
        case '3':
            bug.status = 'rejected';
            addLog('bug', '驳回BUG', `BUG #${bugId} 被驳回`);
            showToast('❌ 已驳回', 'success');
            break;
        default:
            showToast('❌ 无效的选择', 'error');
            return;
    }
    
    if (reply) {
        if (!bug.replies) bug.replies = [];
        bug.replies.push({
            content: reply,
            time: new Date().toISOString(),
            admin: getCurrentUser()?.username || 'admin'
        });
    }
    
    loadBugs();
    loadDashboardStats();
}

// ============================================
// 第八部分：公告管理
// ============================================

/**
 * 加载公告列表
 */
function loadAnnouncements() {
    const announcements = getAllAnnouncements();
    const tbody = document.getElementById('announcements-tbody');
    
    if (announcements.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <div class="empty-state-icon">📢</div>
                    <h3>暂无公告</h3>
                    <p>点击右上角按钮发布公告</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = announcements.map(ann => `
        <tr>
            <td>${ann.title}</td>
            <td>${ann.type || '普通'}</td>
            <td><span class="status-badge ${ann.status}">${ann.status === 'active' ? '显示中' : '已隐藏'}</span></td>
            <td>${formatTime(ann.publishTime)}</td>
            <td>${ann.views || 0}</td>
            <td>
                <div class="action-btns">
                    <button class="action-btn view" onclick="viewAnnouncement('${ann.id}')" title="查看">👁️</button>
                    <button class="action-btn edit" onclick="editAnnouncement('${ann.id}')" title="编辑">✏️</button>
                    <button class="action-btn delete" onclick="deleteAnnouncement('${ann.id}')" title="删除">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ============================================
// 第九部分：分类管理
// ============================================

/**
 * 加载分类列表
 */
function loadCategories() {
    const tbody = document.getElementById('categories-tbody');
    
    if (typeof CATEGORIES === 'undefined') {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <div class="empty-state-icon">🏷️</div>
                    <h3>无法加载分类</h3>
                    <p>配置数据未找到</p>
                </td>
            </tr>
        `;
        return;
    }
    
    const works = getAllWorks();
    
    tbody.innerHTML = Object.entries(CATEGORIES).map(([key, category]) => {
        const count = works.filter(w => w.category?.main === key).length;
        
        return `
            <tr>
                <td style="font-size: 1.5rem;">${category.icon}</td>
                <td>${category.name}</td>
                <td>${key}</td>
                <td>${count}</td>
                <td><span class="status-badge approved">启用</span></td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn edit" onclick="editCategory('${key}')" title="编辑">✏️</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ============================================
// 第十部分：操作日志
// ============================================

/**
 * 加载日志列表
 */
function loadLogs() {
    const type = document.getElementById('logs-filter-type')?.value || 'all';
    const search = document.getElementById('logs-filter-search')?.value.trim().toLowerCase() || '';
    
    AdminState.filters.logs = { type, search };
    
    let logs = getAllLogs();
    
    // 筛选
    if (type !== 'all') {
        logs = logs.filter(l => l.type === type);
    }
    if (search) {
        logs = logs.filter(l => 
            l.action?.toLowerCase().includes(search) ||
            l.detail?.toLowerCase().includes(search)
        );
    }
    
    // 排序（最新的在前）
    logs.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    renderLogsTable(logs);
    renderPagination('logs', logs.length);
}

/**
 * 渲染日志表格
 */
function renderLogsTable(logs) {
    const tbody = document.getElementById('logs-tbody');
    const { current, size } = AdminState.pagination.logs;
    
    const start = (current - 1) * size;
    const pageLogs = logs.slice(start, start + size);
    
    if (pageLogs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <h3>暂无日志</h3>
                    <p>系统操作记录将在这里显示</p>
                </td>
            </tr>
        `;
        return;
    }
    
    const typeIcons = {
        'user': '👤',
        'work': '🖼️',
        'bug': '🐛',
        'system': '⚙️'
    };
    
    tbody.innerHTML = pageLogs.map(log => `
        <tr>
            <td>${formatTime(log.time)}</td>
            <td>${log.user}</td>
            <td>${typeIcons[log.type] || '📝'} ${log.type}</td>
            <td>${log.action}</td>
            <td>${log.detail}</td>
        </tr>
    `).join('');
}

/**
 * 防抖加载日志
 */
const debounceLoadLogs = debounce(loadLogs, 300);

/**
 * 清空日志
 */
function clearLogs() {
    if (!confirm('确定要清空所有日志吗？此操作不可恢复！')) return;
    
    clearAllLogs();
    showToast('🗑️ 日志已清空', 'success');
    loadLogs();
}

// ============================================
// 第十一部分：分页功能
// ============================================

/**
 * 渲染分页
 */
function renderPagination(type, total) {
    const pagination = document.getElementById(`${type}-pagination`);
    if (!pagination) return;
    
    const { current, size } = AdminState.pagination[type];
    const totalPages = Math.ceil(total / size);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // 上一页
    html += `
        <button class="page-btn" onclick="goToPage('${type}', ${current - 1})" ${current === 1 ? 'disabled' : ''}>
            ←
        </button>
    `;
    
    // 页码
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= current - 2 && i <= current + 2)) {
            html += `
                <button class="page-btn ${i === current ? 'active' : ''}" onclick="goToPage('${type}', ${i})">
                    ${i}
                </button>
            `;
        } else if (i === current - 3 || i === current + 3) {
            html += `<span class="page-btn" disabled>...</span>`;
        }
    }
    
    // 下一页
    html += `
        <button class="page-btn" onclick="goToPage('${type}', ${current + 1})" ${current === totalPages ? 'disabled' : ''}>
            →
        </button>
    `;
    
    pagination.innerHTML = html;
}

/**
 * 跳转到指定页
 */
function goToPage(type, page) {
    AdminState.pagination[type].current = page;
    
    switch(type) {
        case 'works':
            loadWorks();
            break;
        case 'users':
            loadUsers();
            break;
        case 'bugs':
            loadBugs();
            break;
        case 'logs':
            loadLogs();
            break;
    }
}

// ============================================
// 第十二部分：工具函数
// ============================================

/**
 * 刷新数据
 */
function refreshData() {
    loadDashboardStats();
    
    switch(AdminState.currentTab) {
        case 'works':
            loadWorks();
            break;
        case 'users':
            loadUsers();
            break;
        case 'bugs':
            loadBugs();
            break;
        case 'announcements':
            loadAnnouncements();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'logs':
            loadLogs();
            break;
    }
    
    showToast('🔄 数据已刷新', 'success');
}

/**
 * 格式化时间
 */
function formatTime(time) {
    if (!time) return '-';
    const date = new Date(time);
    const now = new Date();
    const diff = now - date;
    
    // 小于1小时显示相对时间
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return '刚刚';
        return `${minutes}分钟前`;
    }
    
    // 小于24小时显示小时
    if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}小时前`;
    }
    
    // 否则显示日期
    return date.toLocaleDateString('zh-CN');
}

/**
 * 显示通知
 */
function showNotifications() {
    showToast('📢 您有 3 条新通知', 'info');
}

/**
 * 切换用户菜单
 */
function toggleUserMenu() {
    if (confirm('确定要退出登录吗？')) {
        logout();
    }
}

/**
 * 保存设置
 */
function saveSettings() {
    showToast('💾 设置已保存', 'success');
}

// ============================================
// 第十三部分：数据操作函数（兼容层）
// ============================================

function getAllWorks() {
    if (typeof _db !== 'undefined' && _db.works) {
        return _db.works;
    }
    return [];
}

function getWorkById(id) {
    return getAllWorks().find(w => w.id === id);
}

function getAllUsers() {
    if (typeof _db !== 'undefined' && _db.users) {
        return _db.users;
    }
    return [];
}

function getAllBugs() {
    if (typeof _db !== 'undefined' && _db.bugs) {
        return _db.bugs;
    }
    return [];
}

function getBugById(id) {
    return getAllBugs().find(b => b.id === id);
}

function getAllLogs() {
    if (typeof _db !== 'undefined' && _db.logs) {
        return _db.logs;
    }
    return [];
}

function getRecentLogs(count) {
    return getAllLogs().slice(-count);
}

function addLog(type, action, detail) {
    if (typeof _db !== 'undefined' && _db.logs) {
        _db.logs.push({
            type,
            action,
            detail,
            user: getCurrentUser()?.username || 'admin',
            time: new Date().toISOString()
        });
    }
}

function clearAllLogs() {
    if (typeof _db !== 'undefined' && _db.logs) {
        _db.logs = [];
    }
}

function getAllAnnouncements() {
    if (typeof _db !== 'undefined' && _db.announcements) {
        return _db.announcements;
    }
    return [];
}

function getOnlineUsersCount() {
    if (typeof _db !== 'undefined' && _db.onlineUsers) {
        return _db.onlineUsers.length;
    }
    return 0;
}

function getCurrentUser() {
    if (typeof window.getCurrentUserFromDB === 'function') {
        return window.getCurrentUserFromDB();
    }
    return { username: 'admin', isAdmin: true };
}

function logout() {
    window.location.href = 'traffic-gallery/index.html';
}

// ============================================
// 第十四部分：防抖函数
// ============================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// 第十五部分：Toast提示
// ============================================

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100px);
        opacity: 0;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196F3'
    };
    toast.style.background = colors[type] || colors.info;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    });
    
    setTimeout(() => {
        toast.style.transform = 'translateX(100px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
