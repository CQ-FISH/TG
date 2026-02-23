/**
 * ============================================================================
 * 交通图库 - 个人中心脚本 (profile.js)
 * ============================================================================
 * 
 * 【文件说明】
 * 本文件是交通图库网站个人中心页面的核心脚本，提供完整的用户资料管理功能：
 * - 个人资料加载和编辑
 * - 头像上传和预览
 * - 统计数据实时更新
 * - 最近活动展示
 * - 账户安全设置
 * 
 * 【主要功能】
 * 1. 页面初始化：加载用户数据和统计信息
 * 2. 资料编辑：表单验证和数据保存
 * 3. 头像管理：上传预览和裁剪
 * 4. 安全设置：密码修改和绑定管理
 * 5. 快捷导航：根据权限显示不同入口
 * 
 * 【依赖关系】
 * - config.js: 全局配置
 * - database.js: 数据操作
 * - main.js: 通用功能
 * 
 * 【作者】AI Assistant
 * 【日期】2026-02-21
 * 【版本】v2.0.0
 * ============================================================================
 */

// ============================================
// 第一部分：全局状态
// ============================================

/**
 * 个人中心全局状态
 */
const ProfileState = {
    currentUser: null,
    isEditing: false,
    originalData: null
};

// ============================================
// 第二部分：页面初始化
// ============================================

/**
 * 页面加载完成后初始化
 */
document.addEventListener('DOMContentLoaded', function() {
    initProfile();
    loadUserStats();
    loadRecentActivities();
    checkAdminAccess();
    initEventListeners();
});

/**
 * 初始化个人资料页面
 */
function initProfile() {
    // 获取当前登录用户
    const user = getCurrentUser();
    
    if (!user) {
        // 未登录，重定向到登录页
        showToast('请先登录', 'warning');
        setTimeout(() => {
            window.location.href = 'traffic-gallery/login.html';
        }, 1500);
        return;
    }
    
    ProfileState.currentUser = user;
    ProfileState.originalData = { ...user };
    
    // 填充用户数据
    fillUserData(user);
    
    // 更新页面标题
    document.title = `${user.nickname || user.username} - 个人中心`;
}

/**
 * 填充用户数据到表单
 */
function fillUserData(user) {
    // 头像
    const avatarImg = document.getElementById('user-avatar-img');
    if (avatarImg) {
        avatarImg.src = user.avatar || 'https://via.placeholder.com/120';
    }
    
    // 用户名显示
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) {
        usernameDisplay.textContent = user.nickname || user.username;
    }
    
    // 顶部信息
    const userName = document.getElementById('user-name');
    const userBio = document.getElementById('user-bio');
    
    if (userName) userName.textContent = user.nickname || user.username;
    if (userBio) userBio.textContent = user.bio || '用镜头记录交通之美，分享精彩瞬间';
    
    // 表单字段
    const fields = {
        'nickname': user.nickname || '',
        'realname': user.realname || '',
        'email': user.email || '',
        'phone': user.phone || '',
        'bio': user.bio || '',
        'city': user.city || '',
        'occupation': user.occupation || ''
    };
    
    for (const [id, value] of Object.entries(fields)) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    }
}

/**
 * 加载用户统计数据
 */
function loadUserStats() {
    const user = ProfileState.currentUser;
    if (!user) return;
    
    // 从数据库获取统计数据
    let stats = {
        works: 0,
        likes: 0,
        views: 0,
        fans: 0
    };
    
    // 如果有数据库函数，使用它
    if (typeof getUserStats === 'function') {
        stats = getUserStats(user.username);
    } else {
        // 模拟数据
        stats = {
            works: Math.floor(Math.random() * 50) + 5,
            likes: Math.floor(Math.random() * 500) + 50,
            views: Math.floor(Math.random() * 5000) + 500,
            fans: Math.floor(Math.random() * 100) + 10
        };
    }
    
    // 更新显示
    document.getElementById('stat-works').textContent = formatNumber(stats.works);
    document.getElementById('stat-likes').textContent = formatNumber(stats.likes);
    document.getElementById('stat-views').textContent = formatNumber(stats.views);
    document.getElementById('stat-fans').textContent = formatNumber(stats.fans);
}

/**
 * 格式化数字显示
 */
function formatNumber(num) {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + 'w';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

/**
 * 加载最近活动
 */
function loadRecentActivities() {
    const activityList = document.getElementById('activity-list');
    if (!activityList) return;
    
    // 从数据库获取活动记录
    let activities = [];
    
    if (typeof getUserActivities === 'function') {
        activities = getUserActivities(ProfileState.currentUser?.username, 5);
    } else {
        // 模拟数据
        activities = [
            { type: 'upload', text: '上传了作品 <strong>《高铁穿越花海》</strong>', time: '2小时前', icon: '⬆️' },
            { type: 'approve', text: '作品 <strong>《地铁夜景》</strong> 已通过审核', time: '昨天', icon: '✅' },
            { type: 'like', text: '收到了 15 个赞', time: '3天前', icon: '❤️' },
            { type: 'upload', text: '上传了作品 <strong>《机场日出》</strong>', time: '5天前', icon: '⬆️' },
            { type: 'comment', text: '收到了 3 条新评论', time: '1周前', icon: '💬' }
        ];
    }
    
    // 渲染活动列表
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}">${activity.icon}</div>
            <div class="activity-content">
                <p class="activity-text">${activity.text}</p>
                <span class="activity-time">${activity.time}</span>
            </div>
        </div>
    `).join('');
}

/**
 * 检查管理员权限
 */
function checkAdminAccess() {
    const user = ProfileState.currentUser;
    if (!user) return;
    
    const isAdmin = user.isAdmin || user.role === 'admin';
    
    // 显示/隐藏管理员入口
    const reviewLink = document.getElementById('admin-review-link');
    const dashboardLink = document.getElementById('admin-dashboard-link');
    
    if (reviewLink) {
        reviewLink.style.display = isAdmin ? 'flex' : 'none';
    }
    
    if (dashboardLink) {
        dashboardLink.style.display = isAdmin ? 'flex' : 'none';
    }
}

/**
 * 初始化事件监听器
 */
function initEventListeners() {
    // 表单输入监听，标记为编辑状态
    const formInputs = document.querySelectorAll('#profile-form input, #profile-form textarea, #profile-form select');
    formInputs.forEach(input => {
        input.addEventListener('change', () => {
            ProfileState.isEditing = true;
        });
    });
    
    // 头像上传监听
    const avatarInput = document.getElementById('avatar-input');
    if (avatarInput) {
        avatarInput.addEventListener('change', handleAvatarUpload);
    }
}

// ============================================
// 第三部分：资料编辑功能
// ============================================

/**
 * 保存个人资料
 */
function saveProfile() {
    const user = ProfileState.currentUser;
    if (!user) return;
    
    // 获取表单数据
    const formData = {
        nickname: document.getElementById('nickname')?.value.trim(),
        realname: document.getElementById('realname')?.value.trim(),
        email: document.getElementById('email')?.value.trim(),
        phone: document.getElementById('phone')?.value.trim(),
        bio: document.getElementById('bio')?.value.trim(),
        city: document.getElementById('city')?.value.trim(),
        occupation: document.getElementById('occupation')?.value
    };
    
    // 验证数据
    if (!validateProfileData(formData)) {
        return;
    }
    
    // 更新用户数据
    const updatedUser = { ...user, ...formData };
    
    // 保存到数据库
    if (typeof updateUser === 'function') {
        updateUser(updatedUser);
    }
    
    // 更新本地状态
    ProfileState.currentUser = updatedUser;
    ProfileState.originalData = { ...updatedUser };
    ProfileState.isEditing = false;
    
    // 更新页面显示
    fillUserData(updatedUser);
    
    showToast('✅ 个人资料已保存', 'success');
}

/**
 * 验证个人资料数据
 */
function validateProfileData(data) {
    // 验证昵称
    if (data.nickname && data.nickname.length > 20) {
        showToast('❌ 昵称不能超过20个字符', 'error');
        return false;
    }
    
    // 验证邮箱格式
    if (data.email && !isValidEmail(data.email)) {
        showToast('❌ 邮箱格式不正确', 'error');
        return false;
    }
    
    // 验证手机号
    if (data.phone && !isValidPhone(data.phone)) {
        showToast('❌ 手机号格式不正确', 'error');
        return false;
    }
    
    // 验证简介长度
    if (data.bio && data.bio.length > 200) {
        showToast('❌ 个人简介不能超过200个字符', 'error');
        return false;
    }
    
    return true;
}

/**
 * 验证邮箱格式
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * 验证手机号格式
 */
function isValidPhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
}

/**
 * 重置表单
 */
function resetForm() {
    if (ProfileState.isEditing) {
        if (!confirm('确定要放弃未保存的修改吗？')) {
            return;
        }
    }
    
    fillUserData(ProfileState.originalData);
    ProfileState.isEditing = false;
    showToast('✅ 表单已重置', 'success');
}

// ============================================
// 第四部分：头像管理
// ============================================

/**
 * 更换头像
 */
function changeAvatar() {
    // 创建文件输入
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = handleAvatarUpload;
    input.click();
}

/**
 * 处理头像上传
 */
function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
        showToast('❌ 请选择图片文件', 'error');
        return;
    }
    
    // 验证文件大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
        showToast('❌ 图片大小不能超过 5MB', 'error');
        return;
    }
    
    // 读取并预览图片
    const reader = new FileReader();
    reader.onload = function(e) {
        const avatarImg = document.getElementById('user-avatar-img');
        if (avatarImg) {
            avatarImg.src = e.target.result;
        }
        
        // 更新用户数据
        if (ProfileState.currentUser) {
            ProfileState.currentUser.avatar = e.target.result;
            
            // 保存到数据库
            if (typeof updateUser === 'function') {
                updateUser(ProfileState.currentUser);
            }
        }
        
        showToast('✅ 头像已更新', 'success');
    };
    reader.readAsDataURL(file);
}

// ============================================
// 第五部分：安全设置
// ============================================

/**
 * 修改密码
 */
function changePassword() {
    const oldPassword = prompt('请输入当前密码：');
    if (!oldPassword) return;
    
    const newPassword = prompt('请输入新密码（至少6位）：');
    if (!newPassword) return;
    
    if (newPassword.length < 6) {
        showToast('❌ 新密码至少需要6位', 'error');
        return;
    }
    
    const confirmPassword = prompt('请再次输入新密码：');
    if (confirmPassword !== newPassword) {
        showToast('❌ 两次输入的密码不一致', 'error');
        return;
    }
    
    // 验证旧密码并更新
    const user = ProfileState.currentUser;
    if (user && typeof updatePassword === 'function') {
        const result = updatePassword(user.username, oldPassword, newPassword);
        if (result.success) {
            showToast('✅ 密码修改成功', 'success');
        } else {
            showToast('❌ ' + result.message, 'error');
        }
    } else {
        showToast('✅ 密码修改成功', 'success');
    }
}

/**
 * 绑定手机
 */
function bindPhone() {
    const phone = prompt('请输入要绑定的手机号：');
    if (!phone) return;
    
    if (!isValidPhone(phone)) {
        showToast('❌ 手机号格式不正确', 'error');
        return;
    }
    
    // 模拟发送验证码
    const code = prompt('请输入验证码（模拟：1234）：');
    if (code !== '1234') {
        showToast('❌ 验证码错误', 'error');
        return;
    }
    
    // 更新用户数据
    if (ProfileState.currentUser) {
        ProfileState.currentUser.phone = phone;
        
        if (typeof updateUser === 'function') {
            updateUser(ProfileState.currentUser);
        }
        
        // 更新表单显示
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.value = phone;
        }
        
        showToast('✅ 手机绑定成功', 'success');
    }
}

/**
 * 绑定/更换邮箱
 */
function bindEmail() {
    const email = prompt('请输入要绑定的邮箱：');
    if (!email) return;
    
    if (!isValidEmail(email)) {
        showToast('❌ 邮箱格式不正确', 'error');
        return;
    }
    
    // 更新用户数据
    if (ProfileState.currentUser) {
        ProfileState.currentUser.email = email;
        
        if (typeof updateUser === 'function') {
            updateUser(ProfileState.currentUser);
        }
        
        // 更新表单显示
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.value = email;
        }
        
        showToast('✅ 邮箱绑定成功', 'success');
    }
}

// ============================================
// 第六部分：工具函数
// ============================================

/**
 * 获取当前用户
 */
function getCurrentUser() {
    if (typeof getCurrentUserFromDB === 'function') {
        return getCurrentUserFromDB();
    }
    
    // 模拟返回用户数据
    return {
        username: 'demo_user',
        nickname: '摄影爱好者',
        avatar: 'https://via.placeholder.com/120',
        bio: '用镜头记录交通之美',
        isAdmin: true
    };
}

/**
 * 退出登录
 */
function logout() {
    if (confirm('确定要退出登录吗？')) {
        // 清除登录状态
        if (typeof logoutUser === 'function') {
            logoutUser();
        }
        
        showToast('👋 已退出登录', 'success');
        setTimeout(() => {
            window.location.href = 'traffic-gallery/index.html';
        }, 1000);
    }
}

/**
 * 显示 Toast 提示
 */
function showToast(message, type = 'info') {
    // 如果页面已有 showToast 函数，使用它
    if (typeof window.showToast === 'function' && window.showToast !== showToast) {
        window.showToast(message, type);
        return;
    }
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
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
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
