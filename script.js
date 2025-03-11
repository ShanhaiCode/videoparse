document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const videoUrlInput = document.getElementById('video-url');
    const clearBtn = document.getElementById('clear-btn');
    const parseBtn = document.getElementById('parse-btn');
    const resultSection = document.getElementById('result-section');
    const closeResult = document.getElementById('close-result');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultContent = document.getElementById('result-content');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const videoTitle = document.getElementById('video-title');
    const videoCover = document.getElementById('video-cover');
    const downloadLink = document.getElementById('download-link');
    const playBtn = document.getElementById('play-btn');
    const copyLink = document.getElementById('copy-link');
    const videoPlayerContainer = document.getElementById('video-player-container');
    const videoPlayer = document.getElementById('video-player');
    const closePlayer = document.getElementById('close-player');
    const toast = document.getElementById('toast');
    const toastMessage = document.querySelector('.toast-message');
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    // FAQ元素
    const faqItems = document.querySelectorAll('.faq-item');

    // API配置
    const API_URL = 'https://api.yyy001.com/api/videoparse';
    
    // 创建下载代理函数
    async function createDownloadableLink(url, filename) {
        try {
            // 创建下载链接前显示加载提示
            showToast('正在准备下载...', 'info');
            
            // 尝试通过iframe对象绕过防盗链限制
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            
            try {
                // 在iframe中创建下载链接
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                const downloadTrigger = iframeDoc.createElement('a');
                downloadTrigger.href = url;
                downloadTrigger.download = filename;
                downloadTrigger.target = '_blank';
                iframeDoc.body.appendChild(downloadTrigger);
                
                // 尝试触发下载并捕获可能的错误
                try {
                    downloadTrigger.click();
                    setTimeout(() => {
                        document.body.removeChild(iframe);
                    }, 2000);
                    return { success: true, directUrl: url };
                } catch (e) {
                    console.error('iframe下载失败:', e);
                }
            } catch (e) {
                console.error('iframe创建失败:', e);
            }
            
            // 如果iframe方法失败，尝试直接下载
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                document.body.removeChild(link);
            }, 100);
            
            return { success: true, directUrl: url };
        } catch (error) {
            console.error('创建下载链接失败：', error);
            return { success: false, directUrl: url, error };
        }
    }

    // 初始化
    init();
    setupFaqInteraction();
    setupSmoothScroll();
    animateElements();
    setupNavScroll();
    setupMobileNav();

    // 初始化函数
    function init() {
        // 绑定事件监听器
        videoUrlInput.addEventListener('input', handleInputChange);
        clearBtn.addEventListener('click', clearInput);
        parseBtn.addEventListener('click', parseVideo);
        closeResult.addEventListener('click', hideResult);
        playBtn.addEventListener('click', playVideo);
        closePlayer.addEventListener('click', closeVideoPlayer);
        copyLink.addEventListener('click', copyVideoLink);
        mobileToggle.addEventListener('click', toggleMobileMenu);
        
        // 按下Enter键也可以触发解析
        videoUrlInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                parseVideo();
            }
        });

        // 为按钮添加点击效果
        addButtonEffect(parseBtn);
        addButtonEffect(clearBtn);
        addButtonEffect(playBtn);
        addButtonEffect(copyLink);
        addButtonEffect(closeResult);
        addButtonEffect(closePlayer);
        
        // 添加输入框自动获取粘贴内容
        videoUrlInput.addEventListener('focus', () => {
            navigator.clipboard.readText()
                .then(text => {
                    if (text && text.includes('http') && videoUrlInput.value === '') {
                        videoUrlInput.value = text;
                        handleInputChange();
                    }
                }).catch(err => {
                    // 剪贴板权限被拒绝或其他错误，静默处理
                });
        });
        
        // 添加搜索容器悬停效果
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.addEventListener('mouseenter', () => {
                parseBtn.classList.add('pulse');
            });
            
            searchContainer.addEventListener('mouseleave', () => {
                parseBtn.classList.remove('pulse');
            });
        }

        // 初始化特性卡片
        setupFeatureCards();
        
        // 观察特性卡片
        observeFeatureCards();

        // 设置卡片动画
        setupAnimations();
        
        // 监听滚动动画
        observeScrollAnimations();

        // 设置FAQ交互
        setupFaqInteraction();
        
        // 观察FAQ项目以触发进入动画
        observeFaqItems();
    }
    
    // 设置FAQ交互
    function setupFaqInteraction() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        // 添加初始索引用于动画
        faqItems.forEach((item, index) => {
            item.style.setProperty('--index', index);
        });
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', () => {
                // 如果当前项已经激活，则关闭它
                if (item.classList.contains('active')) {
                    item.classList.remove('active');
                    return;
                }
                
                // 关闭所有其他FAQ项
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // 打开当前FAQ项
                item.classList.add('active');
            });
        });
        
        // 初始化时打开第一个FAQ项
        if (faqItems.length > 0) {
            faqItems[0].classList.add('active');
        }
        
        // 添加无障碍支持
        setupFaqAccessibility();
    }

    function setupFaqAccessibility() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        faqQuestions.forEach(question => {
            // 添加适当的ARIA属性
            question.setAttribute('role', 'button');
            question.setAttribute('aria-expanded', question.parentElement.classList.contains('active'));
            
            const answerId = `faq-answer-${Math.random().toString(36).substring(2, 9)}`;
            const answer = question.nextElementSibling;
            answer.id = answerId;
            question.setAttribute('aria-controls', answerId);
            
            // 键盘访问支持
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    question.click();
                }
            });
            
            // 更新ARIA状态
            question.addEventListener('click', () => {
                const isExpanded = question.parentElement.classList.contains('active');
                question.setAttribute('aria-expanded', isExpanded);
            });
        });
    }

    function observeFaqItems() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        // 如果不支持IntersectionObserver，直接显示所有FAQ项
        if (!('IntersectionObserver' in window)) {
            faqItems.forEach(item => {
                item.style.opacity = 1;
                item.style.transform = 'translateY(0)';
            });
            return;
        }
        
        const faqObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 元素进入视口，应用动画
                    entry.target.style.opacity = '';
                    entry.target.style.transform = '';
                    // 已观察过的元素不再需要观察
                    faqObserver.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // 观察所有FAQ项
        faqItems.forEach(item => {
            faqObserver.observe(item);
        });
    }

    // 设置平滑滚动
    function setupSmoothScroll() {
        // 只选择导航菜单中的链接和页脚链接，明确排除下载链接和其他外部链接
        document.querySelectorAll('.main-nav a[href^="#"], a.footer-link[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                
                // 如果是空锚点或下载链接，不进行处理
                if (!targetId || targetId === "#" || this.hasAttribute('download')) {
                    return;
                }
                
                try {
                    // 安全地尝试查找目标元素
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        e.preventDefault();
                        
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                        
                        // 如果在移动视图中，点击导航链接后关闭菜单
                        if (window.innerWidth <= 768) {
                            mainNav.style.display = 'none';
                        }
                    }
                } catch (error) {
                    console.error('滚动处理出错:', error, '目标ID:', targetId);
                    // 不阻止默认行为，让浏览器正常处理
                }
            });
        });
    }

    // 处理输入变化
    function handleInputChange() {
        if (videoUrlInput.value.trim() !== '') {
            clearBtn.style.opacity = '1';
            clearBtn.style.pointerEvents = 'auto';
        } else {
            clearBtn.style.opacity = '0';
            clearBtn.style.pointerEvents = 'none';
        }
    }

    // 清空输入
    function clearInput() {
        videoUrlInput.value = '';
        clearBtn.style.opacity = '0';
        clearBtn.style.pointerEvents = 'none';
        videoUrlInput.focus();
    }

    // 解析视频
    function parseVideo() {
        const videoUrl = videoUrlInput.value.trim();
        
        if (!videoUrl) {
            showToast('请输入视频链接', 'error');
            return;
        }

        // 显示结果区域和加载动画
        resultSection.style.display = 'block';
        loadingSpinner.style.display = 'flex';
        resultContent.style.display = 'none';
        videoPlayerContainer.style.display = 'none';
        errorMessage.style.display = 'none';

        // 滚动到结果区域
        resultSection.scrollIntoView({ behavior: 'smooth' });

        // 调用API
        fetchVideoInfo(videoUrl);
    }

    // 调用API获取视频信息
    function fetchVideoInfo(videoUrl) {
        // 显示加载动画
        loadingSpinner.style.display = 'flex';
        resultContent.style.display = 'none';
        errorMessage.style.display = 'none';
        
        // API配置
        const primaryAPI = `${API_URL}?url=${encodeURIComponent(videoUrl)}`;
        const fallbackAPI = `https://api.yyy001.com/api/videoparse2?url=${encodeURIComponent(videoUrl)}`;
        
        console.log(`尝试请求主API: ${primaryAPI}`);
        
        // 添加请求头和参数来绕过限制
        fetch(primaryAPI, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Referer': window.location.href,
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'include',  // 包含cookies
            mode: 'cors'
        })
            .then(response => response.json())
            .then(data => {
                if (data && data.code === 200 && data.data) {
                    // 成功获取数据
                    displayVideoInfo(data.data);
                } else {
                    // API返回失败信息，尝试备用API
                    tryFallbackAPI(fallbackAPI);
                }
            })
            .catch(error => {
                tryFallbackAPI(fallbackAPI);
            });
    }
    
    // 尝试使用备用API
    function tryFallbackAPI(apiUrl) {
        fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Referer': window.location.href
            },
            mode: 'cors'
        })
        .then(response => response.json())
        .then(data => {
            if (data && (data.code === 200 || data.success)) {
                const processedData = {
                    title: data.data?.title || data.title || '未知标题',
                    cover: data.data?.cover || data.cover || '',
                    url: data.data?.url || data.url || '',
                    music: data.data?.music || data.music || '',
                    author: data.data?.author || data.author || '未知作者',
                    platform: data.data?.platform || data.platform || '未知平台'
                };
                
                if (processedData.url && processedData.cover) {
                    displayVideoInfo(processedData);
                } else {
                    tryDirectDisplayResult(data);
                }
            } else {
                tryDirectDisplayResult(data);
            }
        })
        .catch(error => {
            tryDirectDisplayResult({ error: '解析失败', message: '无法连接到解析服务' });
        });
    }
    
    // 当常规显示方法失败时，尝试直接构建和显示结果
    function tryDirectDisplayResult(apiData) {
        try {
            // 确保结果区域元素存在
            const resultSection = document.getElementById('result-section');
            const resultContent = document.getElementById('result-content');
            const loadingSpinner = document.getElementById('loading-spinner');
            const errorMessage = document.getElementById('error-message');
            
            if (!resultSection || !resultContent) {
                throw new Error('找不到结果容器元素');
            }
            
            // 准备数据
            const data = apiData.data || {};
            const videoUrl = data.downurl || data.video || '';
            const coverUrl = data.cover || '';
            const title = data.text || '未知标题';
            
            // 显示结果区域
            resultSection.style.display = 'block';
            loadingSpinner.style.display = 'none';
            resultContent.style.display = 'block';
            errorMessage.style.display = 'none';
            
            // 清空现有内容
            resultContent.innerHTML = '';
            
            // 创建新的内容
            const resultHTML = `
                <div class="result-header">
                    <h3 class="video-title">${title}</h3>
                </div>
                
                <div class="video-preview">
                    <img src="${coverUrl}" alt="视频封面" class="video-cover" onerror="this.src='img/no-image.jpg'">
                </div>
                
                <div class="action-buttons" style="display: flex; gap: 10px; margin-top: 15px;">
                    <button id="direct-play-btn" class="action-btn" style="background-color: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-play"></i>
                        <span>播放视频</span>
                    </button>
                    
                    <button id="direct-download-btn" class="action-btn" style="background-color: #2196F3; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-download"></i>
                        <span>下载视频</span>
                    </button>
                    
                    <button id="direct-copy-btn" class="action-btn" style="background-color: #FF9800; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-copy"></i>
                        <span>复制链接</span>
                    </button>
                </div>
                
                ${coverUrl ? `
                <div class="additional-downloads" style="display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
                    <button id="direct-cover-btn" class="download-btn cover-btn" style="display: flex; align-items: center; gap: 8px; padding: 8px 15px; background-color: #9c27b0; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                        <i class="fas fa-image"></i>
                        <span>下载封面</span>
                    </button>
                </div>
                ` : ''}
            `;
            
            // 设置内容
            resultContent.innerHTML = resultHTML;
            
            // 添加事件监听器
            document.getElementById('direct-play-btn').addEventListener('click', function() {
                playVideo();
            });
            
            document.getElementById('direct-download-btn').addEventListener('click', function() {
                createDownloadableLink(videoUrl, title + '.mp4')
                    .then(result => {
                        if (result.success) {
                            showToast('正在下载视频...', 'success');
                        } else {
                            window.open(videoUrl, '_blank');
                            showToast('下载可能受限，已在新窗口打开链接', 'info');
                        }
                    });
            });
            
            document.getElementById('direct-copy-btn').addEventListener('click', function() {
                copyWithFallback(videoUrl);
                showToast('视频链接已复制到剪贴板', 'success');
            });
            
            if (coverUrl && document.getElementById('direct-cover-btn')) {
                document.getElementById('direct-cover-btn').addEventListener('click', function() {
                    createDownloadableLink(coverUrl, title + '.jpg')
                        .then(result => {
                            if (result.success) {
                                showToast('正在下载封面...', 'success');
                            } else {
                                window.open(coverUrl, '_blank');
                                showToast('已打开封面图片，请右键选择"图片另存为"保存', 'info');
                            }
                        });
                });
            }
            
            // 存储视频URL用于播放
            if (videoPlayer) {
                videoPlayer.setAttribute('data-src', videoUrl);
            }
            
            showToast('使用备用接口解析成功', 'success');
        } catch (error) {
            console.error('直接显示结果时出错:', error);
            showError('解析成功但显示出错，请联系管理员');
        }
    }

    // 显示视频信息
    function displayVideoInfo(videoData) {
        // 隐藏加载动画，显示结果内容
        loadingSpinner.style.display = 'none';
        resultContent.style.display = 'block';
        
        // 更新视频信息
        let videoUrl = videoData.url || '';
        videoTitle.textContent = videoData.title || '未知视频';
        videoCover.src = videoData.cover || '';
        
        // 处理可能的视频URL格式
        if (videoUrl.startsWith('//')) {
            videoUrl = 'https:' + videoUrl;
        }
        
        // 移除平台限制检查
        // 恢复播放按钮默认状态
        playBtn.innerHTML = '<i class="fas fa-play"></i><span>播放视频</span>';
        playBtn.classList.remove('restricted');
        playBtn.style.backgroundColor = '';
        playBtn.style.borderColor = '';
        playBtn.style.color = '';
        
        // 移除可能存在的限制提示
        const existingNotice = resultContent.querySelector('.restriction-notice');
        if (existingNotice) {
            resultContent.removeChild(existingNotice);
        }
        
        // 设置下载链接处理函数
        if (videoUrl) {
            // 存储原始URL信息
            downloadLink.setAttribute('data-url', videoUrl);
            downloadLink.setAttribute('data-filename', (videoData.title || '视频下载') + '.mp4');
            
            // 设置初始下载属性
            downloadLink.href = videoUrl;
            downloadLink.setAttribute('target', '_blank');
            downloadLink.setAttribute('rel', 'noopener noreferrer');
            downloadLink.setAttribute('download', (videoData.title || '视频下载') + '.mp4');
            
            // 统一处理所有平台的下载
            downloadLink.onclick = function(e) {
                console.log('下载链接点击: ', videoUrl);
                // 尝试直接下载
                createDownloadableLink(videoUrl, (videoData.title || '视频下载') + '.mp4')
                    .then(result => {
                        if (result.success) {
                            showToast('正在下载视频...', 'success');
                        } else {
                            showToast('下载可能受限，如果浏览器打开了视频页面，请在视频上右键选择"另存为"', 'info');
                        }
                    });
            };
        } else {
            downloadLink.href = '#';
            downloadLink.onclick = function(e) {
                e.preventDefault();
                showToast('无法获取下载链接', 'error');
            };
        }
        
        // 添加下载封面和背景音乐的功能按钮
        const additionalDownloads = document.createElement('div');
        additionalDownloads.className = 'additional-downloads';
        additionalDownloads.style.cssText = `
            display: flex;
            gap: 10px;
            margin-top: 15px;
            flex-wrap: wrap;
        `;
        
        // 创建下载封面的按钮
        if (coverUrl) {
            const downloadCoverBtn = document.createElement('button');
            downloadCoverBtn.className = 'download-btn cover-btn';
            downloadCoverBtn.innerHTML = '<i class="fas fa-image"></i><span>下载封面</span>';
            downloadCoverBtn.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 15px;
                background-color: #9c27b0;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s ease;
            `;
            
            downloadCoverBtn.addEventListener('mouseover', function() {
                this.style.backgroundColor = '#7B1FA2';
            });
            
            downloadCoverBtn.addEventListener('mouseout', function() {
                this.style.backgroundColor = '#9c27b0';
            });
            
            downloadCoverBtn.onclick = function() {
                createDownloadableLink(coverUrl, (videoData.title || '视频封面') + '.jpg')
                    .then(result => {
                        if (result.success) {
                            showToast('正在下载封面图片...', 'success');
                        } else {
                            // 使用封面的直接链接
                            window.open(coverUrl, '_blank');
                            showToast('已打开封面图片，请右键选择"图片另存为"保存', 'info');
                        }
                    });
            };
            
            additionalDownloads.appendChild(downloadCoverBtn);
            addButtonEffect(downloadCoverBtn);
        }
        
        // 创建下载音乐的按钮
        if (videoData.music_url) {
            const downloadMusicBtn = document.createElement('button');
            downloadMusicBtn.className = 'download-btn music-btn';
            downloadMusicBtn.innerHTML = '<i class="fas fa-music"></i><span>下载音乐</span>';
            downloadMusicBtn.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 15px;
                background-color: #FF9800;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s ease;
            `;
            
            downloadMusicBtn.addEventListener('mouseover', function() {
                this.style.backgroundColor = '#F57C00';
            });
            
            downloadMusicBtn.addEventListener('mouseout', function() {
                this.style.backgroundColor = '#FF9800';
            });
            
            downloadMusicBtn.onclick = function() {
                createDownloadableLink(videoData.music_url, (videoData.title || '背景音乐') + '.mp3')
                    .then(result => {
                        if (result.success) {
                            showToast('正在下载背景音乐...', 'success');
                        } else {
                            // 使用音乐的直接链接
                            window.open(videoData.music_url, '_blank');
                            showToast('已打开音乐链接，请另存为MP3文件', 'info');
                        }
                    });
            };
            
            additionalDownloads.appendChild(downloadMusicBtn);
            addButtonEffect(downloadMusicBtn);
        }
        
        // 创建全部资源打包下载按钮
        if ((videoUrl && coverUrl) || (videoUrl && videoData.music_url) || (coverUrl && videoData.music_url)) {
            const downloadAllBtn = document.createElement('button');
            downloadAllBtn.className = 'download-btn all-btn';
            downloadAllBtn.innerHTML = '<i class="fas fa-download"></i><span>下载全部资源</span>';
            downloadAllBtn.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 15px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s ease;
            `;
            
            downloadAllBtn.addEventListener('mouseover', function() {
                this.style.backgroundColor = '#388E3C';
            });
            
            downloadAllBtn.addEventListener('mouseout', function() {
                this.style.backgroundColor = '#4CAF50';
            });
            
            downloadAllBtn.onclick = function() {
                showToast('正在准备所有资源...', 'info');
                
                // 显示资源列表对话框
                const resourceList = document.createElement('div');
                resourceList.className = 'resource-list-dialog';
                resourceList.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    z-index: 1000;
                    max-width: 500px;
                    width: 90%;
                `;
                
                // 添加遮罩层
                const overlay = document.createElement('div');
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    z-index: 999;
                `;
                
                // 创建对话框内容
                resourceList.innerHTML = `
                    <h3 style="margin-top: 0; color: #333; margin-bottom: 15px;">可用资源下载</h3>
                    <p style="color: #666; margin-bottom: 20px;">选择您想要下载的资源：</p>
                    <div class="resource-items" style="display: flex; flex-direction: column; gap: 12px;">
                        ${videoUrl ? `
                            <div class="resource-item" style="display: flex; align-items: center; padding: 10px; border: 1px solid #eee; border-radius: 4px;">
                                <input type="checkbox" id="dl-video" checked style="margin-right: 10px;">
                                <label for="dl-video" style="display: flex; align-items: center; gap: 8px; flex: 1; cursor: pointer;">
                                    <i class="fas fa-video" style="color: #2196F3;"></i>
                                    <span>视频文件</span>
                                </label>
                                <button class="dl-btn" data-url="${videoUrl}" data-type="video" style="background: #2196F3; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                                    下载
                                </button>
                            </div>
                        ` : ''}
                        
                        ${coverUrl ? `
                            <div class="resource-item" style="display: flex; align-items: center; padding: 10px; border: 1px solid #eee; border-radius: 4px;">
                                <input type="checkbox" id="dl-cover" checked style="margin-right: 10px;">
                                <label for="dl-cover" style="display: flex; align-items: center; gap: 8px; flex: 1; cursor: pointer;">
                                    <i class="fas fa-image" style="color: #9c27b0;"></i>
                                    <span>封面图片</span>
                                </label>
                                <button class="dl-btn" data-url="${coverUrl}" data-type="cover" style="background: #9c27b0; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                                    下载
                                </button>
                            </div>
                        ` : ''}
                        
                        ${videoData.music_url ? `
                            <div class="resource-item" style="display: flex; align-items: center; padding: 10px; border: 1px solid #eee; border-radius: 4px;">
                                <input type="checkbox" id="dl-music" checked style="margin-right: 10px;">
                                <label for="dl-music" style="display: flex; align-items: center; gap: 8px; flex: 1; cursor: pointer;">
                                    <i class="fas fa-music" style="color: #FF9800;"></i>
                                    <span>背景音乐</span>
                                </label>
                                <button class="dl-btn" data-url="${videoData.music_url}" data-type="music" style="background: #FF9800; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                                    下载
                                </button>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                        <button id="cancel-download" style="padding: 8px 15px; background: #f5f5f5; color: #333; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">
                            取消
                        </button>
                        <button id="download-selected" style="padding: 8px 15px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            下载选中项
                        </button>
                    </div>
                `;
                
                // 添加到文档
                document.body.appendChild(overlay);
                document.body.appendChild(resourceList);
                
                // 绑定事件
                document.getElementById('cancel-download').onclick = function() {
                    document.body.removeChild(overlay);
                    document.body.removeChild(resourceList);
                };
                
                document.getElementById('download-selected').onclick = function() {
                    const selectedItems = [];
                    
                    if (videoUrl && document.getElementById('dl-video')?.checked) {
                        selectedItems.push({
                            url: videoUrl,
                            filename: (videoData.title || '视频下载') + '.mp4',
                            type: 'video'
                        });
                    }
                    
                    if (coverUrl && document.getElementById('dl-cover')?.checked) {
                        selectedItems.push({
                            url: coverUrl,
                            filename: (videoData.title || '视频封面') + '.jpg',
                            type: 'cover'
                        });
                    }
                    
                    if (videoData.music_url && document.getElementById('dl-music')?.checked) {
                        selectedItems.push({
                            url: videoData.music_url,
                            filename: (videoData.title || '背景音乐') + '.mp3',
                            type: 'music'
                        });
                    }
                    
                    // 下载选中的资源
                    if (selectedItems.length > 0) {
                        downloadMultipleResources(selectedItems);
                        document.body.removeChild(overlay);
                        document.body.removeChild(resourceList);
                    } else {
                        showToast('请至少选择一项资源', 'error');
                    }
                };
                
                // 单独下载按钮事件
                const downloadButtons = resourceList.querySelectorAll('.dl-btn');
                downloadButtons.forEach(btn => {
                    btn.onclick = function() {
                        const url = this.getAttribute('data-url');
                        const type = this.getAttribute('data-type');
                        let filename = videoData.title || '未知文件';
                        
                        if (type === 'video') filename += '.mp4';
                        else if (type === 'cover') filename += '.jpg';
                        else if (type === 'music') filename += '.mp3';
                        
                        createDownloadableLink(url, filename)
                            .then(result => {
                                if (result.success) {
                                    showToast(`正在下载${type === 'video' ? '视频' : type === 'cover' ? '封面' : '音乐'}...`, 'success');
                                } else {
                                    window.open(url, '_blank');
                                    showToast(`已打开${type === 'video' ? '视频' : type === 'cover' ? '封面' : '音乐'}链接，请手动保存`, 'info');
                                }
                            });
                    };
                });
            };
            
            additionalDownloads.appendChild(downloadAllBtn);
            addButtonEffect(downloadAllBtn);
        }
        
        // 将下载按钮组添加到结果区域
        if (additionalDownloads.children.length > 0) {
            // 检查是否已存在
            const existingDownloads = resultContent.querySelector('.additional-downloads');
            if (existingDownloads) {
                try {
                    // 确保父子关系正确，再移除元素
                    if (existingDownloads.parentNode === resultContent) {
                        resultContent.removeChild(existingDownloads);
                    } else {
                        // 如果父子关系不正确，可能是因为DOM结构变化，直接移除该元素
                        existingDownloads.parentNode?.removeChild(existingDownloads);
                    }
                } catch (error) {
                    console.warn('移除旧的下载按钮时出错:', error);
                    // 发生错误时，不要中断程序，继续执行
                }
            }
            
            // 在操作按钮下方插入新的下载按钮组
            const actionButtons = resultContent.querySelector('.action-buttons');
            if (actionButtons) {
                actionButtons.parentNode.insertBefore(additionalDownloads, actionButtons.nextSibling);
            } else {
                resultContent.appendChild(additionalDownloads);
            }
        }
        
        // 存储播放链接
        videoPlayer.setAttribute('data-src', videoUrl);
        
        // 存储下载链接用于复制
        copyLink.setAttribute('data-link', videoUrl);
        
        // 显示成功提示
        showToast('视频解析成功', 'success');
        
        // 添加按钮效果
        addButtonEffect(downloadLink);
        addButtonEffect(playBtn);
        addButtonEffect(copyLink);
    }
    
    // 下载多个资源
    async function downloadMultipleResources(resources) {
        if (!resources || resources.length === 0) return;
        
        showToast(`准备下载 ${resources.length} 个资源...`, 'info');
        
        // 按顺序下载资源
        for (let i = 0; i < resources.length; i++) {
            const resource = resources[i];
            const typeText = resource.type === 'video' ? '视频' : resource.type === 'cover' ? '封面' : '音乐';
            
            showToast(`正在下载 ${typeText} (${i+1}/${resources.length})...`, 'info');
            
            try {
                const result = await createDownloadableLink(resource.url, resource.filename);
                if (!result.success) {
                    window.open(resource.url, '_blank');
                    showToast(`${typeText}下载可能受限，已在新窗口打开`, 'info');
                }
                
                // 添加延迟以防止浏览器阻止多个下载
                await new Promise(resolve => setTimeout(resolve, 1500));
            } catch (error) {
                console.error(`下载${typeText}失败:`, error);
                showToast(`${typeText}下载失败`, 'error');
            }
        }
        
        showToast('所有资源下载已完成', 'success');
    }

    // 显示错误信息
    function showError(message) {
        loadingSpinner.style.display = 'none';
        resultContent.style.display = 'none';
        errorMessage.style.display = 'flex';
        errorText.textContent = message;
        
        // 显示错误提示
        showToast('解析失败: ' + message, 'error');
        
        // 添加重试按钮
        const retryButton = document.createElement('button');
        retryButton.className = 'retry-btn';
        retryButton.innerHTML = '<i class="fas fa-redo"></i> 重新尝试';
        retryButton.onclick = function() {
            const currentUrl = videoUrlInput.value.trim();
            if (currentUrl) {
                parseVideo();
            }
        };
        
        // 清除之前的重试按钮（如果有）
        const oldRetryButton = errorMessage.querySelector('.retry-btn');
        if (oldRetryButton) {
            errorMessage.removeChild(oldRetryButton);
        }
        
        // 添加到错误消息区域
        errorMessage.appendChild(retryButton);
    }

    // 隐藏结果区域
    function hideResult() {
        resultSection.style.display = 'none';
        // 停止视频播放
        closeVideoPlayer();
    }

    // 播放视频
    function playVideo() {
        const videoSrc = videoPlayer.getAttribute('data-src');
        
        if (!videoSrc) {
            showToast('视频源不可用', 'error');
            return;
        }
        
        if (videoPlayerContainer.style.display === 'block') {
            closeVideoPlayer();
            return;
        }
        
        videoPlayer.src = videoSrc;
        videoPlayerContainer.style.display = 'block';
    }

    // 关闭视频播放器
    function closeVideoPlayer() {
        videoPlayerContainer.style.display = 'none';
        resultContent.style.display = 'block';
        
        // 暂停视频播放并清除源
        videoPlayer.pause();
        videoPlayer.src = '';
    }

    // 复制视频链接
    function copyVideoLink() {
        const videoSrc = window.currentVideoUrl;
        
        if (!videoSrc) {
            showToast('没有可用的视频链接', 'error');
            return;
        }
        
        copyWithFallback(videoSrc);
    }
    
    // 复制文本的传统备用方案
    function copyWithFallback(text) {
        try {
            // 创建临时输入框
            const tempInput = document.createElement('textarea');
            tempInput.style.position = 'fixed';
            tempInput.style.opacity = '0';
            tempInput.value = text;
            document.body.appendChild(tempInput);
            
            // 选择文本并执行复制命令
            tempInput.select();
            tempInput.setSelectionRange(0, 99999); // 移动设备兼容性
            
            const successful = document.execCommand('copy');
            document.body.removeChild(tempInput);
            
            if (successful) {
                showToast('链接已复制到剪贴板', 'success');
                addButtonEffect(copyLink); // 添加按钮效果反馈
            } else {
                showToast('复制失败，请手动选择链接并复制', 'error');
                // 显示可选择的链接
                showSelectableLink(text);
            }
        } catch (err) {
            console.error('传统复制方法失败:', err);
            showToast('复制失败，请手动选择链接并复制', 'error');
            // 显示可选择的链接
            showSelectableLink(text);
        }
    }
    
    // 显示可选择的链接文本框
    function showSelectableLink(text) {
        // 检查是否已存在可选择的链接框
        let selectableBox = document.getElementById('selectable-link-box');
        if (selectableBox) {
            document.body.removeChild(selectableBox);
        }
        
        // 创建可选择的链接框
        selectableBox = document.createElement('div');
        selectableBox.id = 'selectable-link-box';
        selectableBox.style.cssText = `
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            padding: 15px;
            background: white;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            border-radius: 8px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            align-items: center;
        `;
        
        // 添加标题
        const title = document.createElement('h4');
        title.textContent = '请选择并复制以下链接:';
        title.style.margin = '0 0 10px 0';
        selectableBox.appendChild(title);
        
        // 添加链接输入框
        const linkInput = document.createElement('textarea');
        linkInput.value = text;
        linkInput.style.cssText = `
            width: 100%;
            min-width: 300px;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            resize: none;
            margin-bottom: 10px;
        `;
        linkInput.rows = 3;
        linkInput.onclick = function() { this.select(); };
        selectableBox.appendChild(linkInput);
        
        // 添加关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '关闭';
        closeBtn.style.cssText = `
            padding: 8px 15px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        `;
        closeBtn.onclick = function() {
            document.body.removeChild(selectableBox);
        };
        selectableBox.appendChild(closeBtn);
        
        // 添加到页面
        document.body.appendChild(selectableBox);
        
        // 自动选择链接
        linkInput.select();
    }

    // 显示提示信息
    function showToast(message, type = 'success') {
        toastMessage.textContent = message;
        toast.className = 'toast visible ' + type;
        
        // 3秒后自动隐藏
        setTimeout(() => {
            toast.className = 'toast';
        }, 3000);
    }

    // 切换移动端菜单
    function toggleMobileMenu() {
        const mainNav = document.querySelector('.main-nav');
        mainNav.classList.toggle('active');
        
        // 防止菜单打开时页面滚动
        if (mainNav.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    // 导航栏滚动效果
    function setupNavScroll() {
        const header = document.querySelector('header');
        const scrollThreshold = 50;
        
        function handleScroll() {
            if (window.scrollY > scrollThreshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
        
        window.addEventListener('scroll', handleScroll);
        // 初始检查
        handleScroll();
    }
    
    // 优化移动端导航体验
    function setupMobileNav() {
        const mobileToggle = document.querySelector('.mobile-toggle');
        const mainNav = document.querySelector('.main-nav');
        const navLinks = document.querySelectorAll('.main-nav a');
        
        if (!mobileToggle || !mainNav) return;
        
        // 点击导航链接后自动关闭导航菜单
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    mainNav.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
        
        // 点击页面其他区域关闭导航菜单
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                mainNav.classList.contains('active') && 
                !mainNav.contains(e.target) && 
                !mobileToggle.contains(e.target)) {
                mainNav.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // 为按钮添加点击效果
    function addButtonEffect(button) {
        if (!button) return;
        
        button.addEventListener('mousedown', () => {
            button.classList.add('button-pressed');
        });
        
        button.addEventListener('mouseup', () => {
            button.classList.remove('button-pressed');
        });
        
        button.addEventListener('mouseleave', () => {
            button.classList.remove('button-pressed');
        });
    }
    
    // 动画页面元素
    animateElements();
    
    function animateElements() {
        // 添加滚动时的动画效果
        const animateOnScroll = () => {
            const elements = document.querySelectorAll('.feature-card, .platform-card, .step-card, .testimonial-card');
            elements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                const elementVisible = 150;
                
                if (elementTop < window.innerHeight - elementVisible) {
                    element.classList.add('fade-in');
                }
            });
        };
        
        window.addEventListener('scroll', animateOnScroll);
        animateOnScroll(); // 初始调用
        
        // 添加解析按钮的脉冲动画
        const pulseAnimation = () => {
            const parseBtn = document.getElementById('parse-btn');
            if (parseBtn && !parseBtn.classList.contains('loading')) {
                parseBtn.classList.add('pulse');
                
                setTimeout(() => {
                    parseBtn.classList.remove('pulse');
                }, 1000);
                
                setTimeout(pulseAnimation, 4000);
            }
        };
        
        // 延迟启动脉冲动画
        setTimeout(pulseAnimation, 3000);
        
        // 添加统计数字动画
        animateStatNumbers();
    }

    // 统计数字动画效果
    function animateStatNumbers() {
        const statItems = document.querySelectorAll('.stat-item');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // 设置动画延迟
                    const statNumber = entry.target.querySelector('.stat-number');
                    if (statNumber) {
                        statNumber.style.setProperty('--i', index);
                    }
                    
                    // 添加启动动画的类
                    entry.target.classList.add('stat-animate');
                    
                    // 使用计数动画
                    const valueElement = entry.target.querySelector('.stat-number');
                    const value = valueElement.textContent;
                    
                    // 对于百分比值特殊处理
                    if (value.includes('%')) {
                        animatePercentage(valueElement, parseFloat(value));
                    }
                    // 对于带+号的大数值使用另一种方法
                    else if (value.includes('+')) {
                        animateLargeNumber(valueElement, value);
                    }
                    
                    // 停止观察已经显示的元素
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        
        // 开始观察所有统计项
        statItems.forEach(item => {
            observer.observe(item);
        });
    }

    // 百分比数值动画
    function animatePercentage(element, targetValue) {
        const duration = 2000; // 动画持续时间（毫秒）
        const frameDuration = 1000 / 60; // 假设60fps
        const totalFrames = Math.round(duration / frameDuration);
        let frame = 0;
        
        const counter = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            const currentValue = easeOutCubic(progress) * targetValue;
            
            element.textContent = currentValue.toFixed(1) + '%';
            
            if (frame === totalFrames) {
                clearInterval(counter);
            }
        }, frameDuration);
    }

    // 大数值动画（带+号）
    function animateLargeNumber(element, finalValue) {
        // 去掉+号和逗号，转换为纯数字
        const numericValue = parseInt(finalValue.replace(/[+,]/g, ''));
        const duration = 2500; // 动画持续时间（毫秒）
        const frameDuration = 1000 / 30; // 降低帧率，避免过多DOM操作
        const totalFrames = Math.round(duration / frameDuration);
        let frame = 0;
        
        const counter = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            const currentValue = Math.floor(easeOutCubic(progress) * numericValue);
            
            // 添加千位分隔符
            element.textContent = currentValue.toLocaleString() + '+';
            
            if (frame === totalFrames) {
                clearInterval(counter);
                element.textContent = finalValue; // 确保最终显示原始值
            }
        }, frameDuration);
    }

    // 缓动函数使动画更自然
    function easeOutCubic(x) {
        return 1 - Math.pow(1 - x, 3);
    }

    // 初始化特性卡片的动画
    function setupFeatureCards() {
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach((card, index) => {
            // 设置延迟变量供CSS动画使用
            card.style.setProperty('--i', index);
            
            // 添加交互效果
            card.addEventListener('mouseenter', function() {
                // 添加微妙的3D倾斜效果
                card.addEventListener('mousemove', handleCardTilt);
            });
            
            card.addEventListener('mouseleave', function() {
                // 移除倾斜效果
                card.removeEventListener('mousemove', handleCardTilt);
                // 重置变换
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    // 卡片倾斜效果处理函数
    function handleCardTilt(e) {
        const card = this;
        const boundingRect = card.getBoundingClientRect();
        const cardCenterX = boundingRect.left + boundingRect.width / 2;
        const cardCenterY = boundingRect.top + boundingRect.height / 2;
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // 计算鼠标与卡片中心的相对位置
        const offsetX = (mouseX - cardCenterX) / (boundingRect.width / 2);
        const offsetY = (mouseY - cardCenterY) / (boundingRect.height / 2);
        
        // 根据鼠标位置添加微妙的倾斜效果
        const tiltX = offsetY * 5; // 垂直方向倾斜角度
        const tiltY = -offsetX * 5; // 水平方向倾斜角度
        
        // 应用变换
        card.style.transform = `translateY(-10px) perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    }

    // 观察特性卡片进入视口，触发动画
    function observeFeatureCards() {
        const cards = document.querySelectorAll('.feature-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // 添加交错动画延迟
                    setTimeout(() => {
                        entry.target.classList.add('fade-in');
                    }, index * 150);
                    
                    // 停止观察已经动画的元素
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
        });
        
        // 开始观察所有卡片
        cards.forEach(card => {
            observer.observe(card);
        });
    }

    function setupAnimations() {
        // 为所有平台卡片设置延迟动画
        const platformCards = document.querySelectorAll('.platform-card');
        platformCards.forEach((card, index) => {
            card.style.setProperty('--i', index % 5); // 每行大约5个卡片，循环设置延迟
        });
        
        // 为所有步骤卡片设置延迟动画
        const stepCards = document.querySelectorAll('.step-card');
        stepCards.forEach((card, index) => {
            card.style.setProperty('--i', index);
        });
        
        // 为所有评价卡片设置延迟动画
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        testimonialCards.forEach((card, index) => {
            card.style.setProperty('--i', index);
            
            // 为每个评价卡片中的星星设置不同的延迟
            const stars = card.querySelectorAll('.testimonial-rating i');
            stars.forEach((star, starIndex) => {
                star.style.setProperty('--i', starIndex);
            });
        });
    }

    function observeScrollAnimations() {
        const animationItems = document.querySelectorAll('.platform-card, .step-card, .testimonial-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });
        
        animationItems.forEach(item => {
            observer.observe(item);
        });
    }
}); 