// ==================== State ====================
let currentView = 'list'; // list | replay
let activeEventFilter = 'all';
let activeAITab = 'all';
let isPlaying = false;
let playProgress = 35;

// Demo state (declared early to avoid TDZ issues — switchScenario may call cancelAutoDemo
// on page load via handleDeepLink before this file finishes executing)
let demoState = {
  running: false,
  paused: false,
  aborted: false,
  currentStep: 0,
  totalSteps: 9,
  timeouts: [],       // active setTimeout ids
  pausedSleeps: []    // { resolve, reject, remaining } — sleeps suspended by pause
};

// ==================== Scenario Switching ====================
function switchScenario(name) {
  if (!['bank', 'edu'].includes(name)) return;
  if (window.currentScenario === name) return;

  // Cancel any running auto demo
  if (typeof cancelAutoDemo === 'function') cancelAutoDemo();

  setScenario(name);

  // Update tab UI
  document.querySelectorAll('.scenario-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.scenario === name);
  });

  // Toggle auto demo button visibility (only edu has demo)
  const demoBtn = document.getElementById('btn-auto-demo');
  if (demoBtn) demoBtn.style.display = name === 'edu' ? 'inline-flex' : 'none';

  // Update app selector label (visual only)
  const appSelect = document.getElementById('app-select');
  if (appSelect) {
    if (name === 'edu') {
      appSelect.innerHTML = '<option selected>星辰大学-教务系统</option><option>星辰大学-移动端</option>';
    } else {
      appSelect.innerHTML = '<option selected>GlassBank-Web</option><option>GlassBank-Mobile</option>';
    }
  }

  // Back to list if in replay
  if (currentView === 'replay') {
    backToList();
  }

  // Re-render list
  currentPage = 1;
  renderSessionTable();
  updatePagination();

  // Update filter/title labels that mention scenario
  const nlSearch = document.getElementById('nl-search');
  if (nlSearch) {
    nlSearch.placeholder = name === 'edu'
      ? '自然语言搜索，如：选课失败的大三学生会话'
      : '自然语言搜索，如：手机端用户在注册页触发 rage click 的会话';
  }
}

// ==================== Utilities ====================
function fmtDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function scoreColor(score) {
  if (score >= 0.6) return 'var(--red)';
  if (score >= 0.3) return 'var(--orange)';
  if (score >= 0.15) return 'var(--yellow)';
  return 'var(--green)';
}

function rankClass(rank) {
  return rank.toLowerCase();
}

function fmtTime(ms) {
  const sec = Math.floor(ms / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ==================== Performance Helpers ====================
function perfStatus(metric, val) {
  const thresholds = {
    lcp: { good: 2500, fair: 4000 },
    inp: { good: 200, fair: 500 },
    cls: { good: 0.1, fair: 0.25 },
  };
  const t = thresholds[metric];
  if (!t) return 'good';
  if (val <= t.good) return 'good';
  if (val <= t.fair) return 'fair';
  return 'poor';
}

function fmtPerf(metric, val) {
  if (metric === 'cls') return val.toFixed(2);
  if (val >= 1000) return (val / 1000).toFixed(1) + 's';
  return val + 'ms';
}

// ==================== Platform-Aware Helpers ====================
function getAppType() {
  return window.tdemAppType || 'web';
}

function hasWebVitals() {
  return getAppType() === 'web';
}

// Called when app type changes from hub
function onAppSwitch(appType, appId) {
  window.tdemAppType = appType; // Ensure local state is up-to-date
  updatePlatformUI();
  renderSessionTable();
  // If currently in replay view, re-render perf panel and AI
  if (currentView === 'replay') {
    renderPerfPanel();
    renderAIContent();
  }
}

function updatePlatformUI() {
  const appType = getAppType();
  const isWeb = appType === 'web';

  // Show/hide Web Vitals columns in session table (th and td)
  document.querySelectorAll('[data-web-only]').forEach(el => {
    el.style.display = isWeb ? '' : 'none';
  });

  // Show/hide Web Vitals performance quick filter chips
  const perfFilters = document.getElementById('perf-quick-filters');
  if (perfFilters) {
    perfFilters.querySelectorAll('[data-filter="slow-lcp"],[data-filter="slow-inp"],[data-filter="bad-cls"]').forEach(el => {
      el.style.display = isWeb ? '' : 'none';
    });
    // Update label
    const label = perfFilters.querySelector('.perf-filter-label');
    if (label) {
      label.textContent = isWeb ? '性能筛选:' : appType === 'mini' ? '小程序性能筛选:' : 'App 性能筛选:';
    }
  }
}

// ==================== Session List ====================
let activePerfFilters = new Set();

function togglePerfFilter(chip) {
  const filter = chip.dataset.filter;
  if (activePerfFilters.has(filter)) {
    activePerfFilters.delete(filter);
    chip.classList.remove('active');
  } else {
    activePerfFilters.add(filter);
    chip.classList.add('active');
  }
  renderSessionTable();
}

function getFilteredSessions() {
  let sessions = sessionListData.sessions;
  if (activePerfFilters.size > 0) {
    const isWeb = getAppType() === 'web';
    sessions = sessions.filter(s => {
      if (!s.perf) return false;
      for (const f of activePerfFilters) {
        // Web Vitals filters only apply on web platform
        if (f === 'slow-lcp' && isWeb && s.perf.lcp > 2500) return true;
        if (f === 'slow-inp' && isWeb && s.perf.inp > 200) return true;
        if (f === 'bad-cls' && isWeb && s.perf.cls > 0.1) return true;
        if (f === 'long-tasks' && s.perf.long_tasks > 3) return true;
      }
      return false;
    });
  }
  return sessions;
}

function renderSessionTable() {
  const tbody = document.getElementById('session-tbody');
  const sessions = getFilteredSessions();
  const isWeb = getAppType() === 'web';

  tbody.innerHTML = sessions.map(s => {
    const sc = scoreColor(s.struggle_score);
    const rc = rankClass(s.struggle_rank);
    const p = s.perf || {};
    const lcpSt = perfStatus('lcp', p.lcp || 0);
    const inpSt = perfStatus('inp', p.inp || 0);
    // Only highlight perf issues for Web (LCP/INP); other platforms use different criteria
    const hasPerfIssue = isWeb ? (lcpSt === 'poor' || inpSt === 'poor') : (p.long_tasks > 5 || s.error_count > 3);
    return `
      <tr onclick="openReplay('${s.session_id}')" class="${hasPerfIssue ? 'perf-row-highlight' : ''}">
        <td><input type="checkbox" onclick="event.stopPropagation(); updateBatchToolbar()" data-sid="${s.session_id}"></td>
        <td class="mono">${s.start_time}</td>
        <td class="mono">${fmtDuration(s.duration)}</td>
        <td>
          <div class="score-bar">
            <div class="score-track"><div class="score-fill" style="width:${s.struggle_score * 100}%;background:${sc}"></div></div>
            <span class="mono" style="color:${sc}">${s.struggle_score.toFixed(2)}</span>
          </div>
        </td>
        <td><span class="rank-badge ${rc}">${s.struggle_rank}</span></td>
        <td class="mono">${s.user_id}</td>
        <td>${s.browser}</td>
        <td>${s.device_type}</td>
        <td>${s.os}</td>
        <td>${s.country}${s.state ? ', ' + s.state : ''}</td>
        <td class="mono">${s.page_count}</td>
        <td class="mono">${s.error_count > 0 ? `<span style="color:var(--red)">${s.error_count}</span>` : '0'}</td>
        <td class="perf-cell ${lcpSt}" data-web-only><span class="perf-indicator" style="background:${lcpSt === 'good' ? 'var(--green)' : lcpSt === 'fair' ? 'var(--orange)' : 'var(--red)'}"></span>${p.lcp ? fmtPerf('lcp', p.lcp) : '-'}</td>
        <td class="perf-cell ${inpSt}" data-web-only><span class="perf-indicator" style="background:${inpSt === 'good' ? 'var(--green)' : inpSt === 'fair' ? 'var(--orange)' : 'var(--red)'}"></span>${p.inp ? fmtPerf('inp', p.inp) : '-'}</td>
        <td>
          <div class="play-icon" onclick="event.stopPropagation(); openReplay('${s.session_id}')" title="查看回放">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // After rendering, re-apply data-web-only visibility
  updatePlatformUI();
}

// ==================== Advanced Filter ====================
function toggleAdvFilter() {
  document.getElementById('adv-filter-panel').classList.toggle('open');
}

// ==================== Batch Action Toolbar ====================
function updateBatchToolbar() {
  const checked = document.querySelectorAll('#session-tbody input[type="checkbox"]:checked');
  const toolbar = document.getElementById('batch-toolbar');
  const count = document.getElementById('batch-count');
  if (checked.length > 0) {
    toolbar.style.display = 'flex';
    count.textContent = checked.length;
  } else {
    toolbar.style.display = 'none';
  }
}

function batchAction(action) {
  const checked = document.querySelectorAll('#session-tbody input[type="checkbox"]:checked');
  const ids = Array.from(checked).map(cb => cb.dataset.sid);
  if (ids.length === 0) { showToast('请先选择会话'); return; }

  switch (action) {
    case 'tag':
      showToast(`已批量标记 ${ids.length} 个会话`);
      break;
    case 'export':
      showToast(`正在导出 ${ids.length} 个会话数据...`);
      break;
    case 'perf':
      showToast(`已选中 ${ids.length} 个会话进行性能对比分析`);
      // In real app, would open performance comparison view
      break;
    case 'clear':
      checked.forEach(cb => cb.checked = false);
      document.getElementById('select-all').checked = false;
      updateBatchToolbar();
      break;
  }
}

function applyAdvFilter() {
  // Collect active chips/toggles and create filter tags
  const chips = document.querySelectorAll('.adv-filter-panel .chip.active');
  const container = document.getElementById('active-filters');
  chips.forEach(chip => {
    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    tag.innerHTML = `${chip.textContent}<button class="filter-tag-close" onclick="this.parentElement.remove()">×</button>`;
    container.appendChild(tag);
    chip.classList.remove('active');
  });
  toggleAdvFilter();
  // Re-render session table to reflect filters
  renderSessionTable();
  showToast('筛选已应用');
}

document.getElementById('adv-filter-btn').addEventListener('click', toggleAdvFilter);

// Chip toggle
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => chip.classList.toggle('active'));
});

// Toggle button group
document.querySelectorAll('.toggle-group').forEach(group => {
  group.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      group.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});

// ==================== View Switching ====================
function openReplay(sessionId) {
  document.getElementById('list-view').style.display = 'none';
  document.getElementById('replay-view').style.display = 'flex';
  document.getElementById('replay-session-id').textContent = sessionId;
  currentView = 'replay';

  // Update session meta info from list data if available
  const session = sessionListData.sessions.find(s => s.session_id === sessionId);
  if (session) {
    const metaEl = document.getElementById('replay-meta');
    if (metaEl) {
      metaEl.innerHTML = `<span>${session.browser}</span><span>${session.device_type}</span><span>${session.os}</span><span>${session.country}${session.state ? ', ' + session.state : ''}</span>`;
    }
    const scoreEl = document.getElementById('replay-struggle-score');
    if (scoreEl) {
      const sc = scoreColor(session.struggle_score);
      scoreEl.style.color = sc;
      scoreEl.textContent = session.struggle_score.toFixed(2);
    }
    const rankEl = document.getElementById('replay-struggle-rank');
    if (rankEl) {
      rankEl.className = 'rank-badge ' + rankClass(session.struggle_rank);
      rankEl.textContent = session.struggle_rank;
    }
    const durEl = document.getElementById('total-time');
    if (durEl) {
      durEl.textContent = fmtDuration(session.duration);
    }
  }

  // Reset progress
  playProgress = 0;
  updateProgress(0);

  renderEventList();
  renderPageTimeline();
  renderAIContent();
  renderPerfPanel();
  renderPerfProgressMarkers();
  renderFunnelStepMarkers();

  // Initialize mock page with the first event of the current scenario
  const firstEvt = replaySessionData.events[0];
  if (firstEvt) updateMockPage(firstEvt);
}

// ==================== Panel Tab Switching (Events / Performance) ====================
function switchPanelTab(tab) {
  const panel = tab.dataset.panel;
  document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');

  const eventList = document.getElementById('event-list');
  const perfPanel = document.getElementById('perf-panel');
  const filterChips = document.getElementById('event-filter-chips');

  if (panel === 'events') {
    eventList.style.display = 'block';
    perfPanel.style.display = 'none';
    filterChips.style.display = 'flex';
  } else {
    eventList.style.display = 'none';
    perfPanel.style.display = 'block';
    filterChips.style.display = 'none';
  }
}

// ==================== Performance Panel Rendering ====================
function renderPerfPanel() {
  const perf = replaySessionData.perf;
  if (!perf) return;

  const appType = getAppType();
  const isWeb = appType === 'web';

  // Vitals grid — different metrics per platform
  const vitalsGrid = document.getElementById('perf-vitals-grid');
  let vitals;
  if (isWeb) {
    vitals = [
      { name: 'LCP', val: perf.lcp, fmt: fmtPerf('lcp', perf.lcp), metric: 'lcp' },
      { name: 'INP', val: perf.inp, fmt: fmtPerf('inp', perf.inp), metric: 'inp' },
      { name: 'CLS', val: perf.cls, fmt: perf.cls.toFixed(2), metric: 'cls' },
      { name: 'FCP', val: perf.fcp, fmt: fmtPerf('lcp', perf.fcp), metric: 'lcp' },
      { name: 'TTFB', val: perf.ttfb, fmt: fmtPerf('inp', perf.ttfb), metric: 'inp' },
      { name: 'Long Tasks', val: perf.long_tasks, fmt: String(perf.long_tasks), metric: null },
    ];
  } else if (appType === 'mini') {
    // 小程序指标
    vitals = [
      { name: '启动耗时', val: perf.launch_time || 1200, fmt: (perf.launch_time || 1200) + 'ms', metric: null },
      { name: '首次渲染', val: perf.first_render || 800, fmt: (perf.first_render || 800) + 'ms', metric: null },
      { name: '包大小', val: perf.pkg_size || 1.8, fmt: (perf.pkg_size || 1.8) + 'MB', metric: null },
      { name: 'JS Error', val: perf.js_errors || 2, fmt: String(perf.js_errors || 2), metric: null },
      { name: 'setData 耗时', val: perf.set_data_cost || 45, fmt: (perf.set_data_cost || 45) + 'ms', metric: null },
      { name: 'Long Tasks', val: perf.long_tasks || 3, fmt: String(perf.long_tasks || 3), metric: null },
    ];
  } else {
    // App 指标
    vitals = [
      { name: '冷启动', val: perf.cold_start || 2100, fmt: (perf.cold_start || 2100) + 'ms', metric: null },
      { name: 'ANR', val: perf.anr_count || 0, fmt: String(perf.anr_count || 0), metric: null },
      { name: '帧率', val: perf.fps || 58, fmt: (perf.fps || 58) + ' fps', metric: null },
      { name: '内存峰值', val: perf.memory_peak || 245, fmt: (perf.memory_peak || 245) + 'MB', metric: null },
      { name: 'Crash', val: perf.crash_count || 0, fmt: String(perf.crash_count || 0), metric: null },
      { name: 'API 错误', val: perf.api_errors || 1, fmt: String(perf.api_errors || 1), metric: null },
    ];
  }

  // Update section title
  const perfSections = document.querySelectorAll('.perf-panel-title');
  if (perfSections[0]) {
    perfSections[0].textContent = isWeb ? 'Web Vitals' : appType === 'mini' ? '小程序性能' : 'App 性能';
  }

  vitalsGrid.innerHTML = vitals.map(v => {
    let st = v.metric ? perfStatus(v.metric, v.val) : (v.val > 3 ? 'poor' : v.val > 1 ? 'fair' : 'good');
    const stColor = st === 'good' ? 'var(--green)' : st === 'fair' ? 'var(--orange)' : 'var(--red)';
    const stBg = st === 'good' ? 'var(--green-dim)' : st === 'fair' ? 'var(--orange-dim)' : 'var(--red-dim)';
    const stLabel = st === 'good' ? 'Good' : st === 'fair' ? 'Fair' : 'Poor';
    return `<div class="perf-vital-card">
      <div class="perf-vital-name">${v.name}</div>
      <div class="perf-vital-val" style="color:${stColor}">${v.fmt}</div>
      <span class="perf-vital-status" style="background:${stBg};color:${stColor}">${stLabel}</span>
    </div>`;
  }).join('');

  // Performance & Resource unified timeline — platform-aware
  const evtTimeline = document.getElementById('perf-events-timeline');
  const evtTitle = document.querySelectorAll('.perf-panel-title')[1];
  let perfEvents;
  if (isWeb) {
    // Merge perf_events + resources into a single timeline
    perfEvents = [...(perf.perf_events || [])];
    // Add resources as timeline entries (sorted by approximate load time)
    if (perf.resources) {
      const resTimestamps = { 'hero-image.webp': 800, 'app.bundle.js': 500, 'analytics.min.js': 1000, 'formValidator.js': 1200, 'styles.css': 400, 'Inter-font.woff2': 600 };
      perf.resources.forEach(r => {
        const ts = resTimestamps[r.name] || 1000;
        const durText = r.status === 'failed' ? 'FAIL' : r.duration + 'ms';
        const icon = r.status === 'slow' ? '🔴' : r.status === 'failed' ? '❌' : '📦';
        const statusHint = r.status === 'slow' ? ' — 慢' : r.status === 'failed' ? ' — 加载失败' : '';
        perfEvents.push({
          timestamp: ts,
          type: 'resource',
          label: r.type + ': ' + r.name,
          detail: r.size + ' · ' + durText + statusHint,
          icon: icon,
          isResource: true,
          resStatus: r.status
        });
      });
      perfEvents.sort((a, b) => a.timestamp - b.timestamp);
    }
    if (evtTitle) evtTitle.textContent = '性能 & 资源时间线';
  } else if (appType === 'mini') {
    if (evtTitle) evtTitle.textContent = '小程序事件时间线';
    perfEvents = [
      { timestamp: 0, type: 'launch', label: '启动', detail: '小程序冷启动开始', icon: '🚀' },
      { timestamp: 300, type: 'download', label: '包下载', detail: '代码包下载完成: 1.8MB', icon: '📦' },
      { timestamp: 700, type: 'first_render', label: '首次渲染', detail: '首个页面渲染完成: 700ms', icon: '🎨' },
      { timestamp: 5000, type: 'setdata', label: 'setData', detail: 'setData 耗时 45ms (列表更新)', icon: '📊' },
      { timestamp: 14000, type: 'long_task', label: 'Long Task', detail: 'Long task 120ms in formValidator.js', icon: '⏱️' },
      { timestamp: 28000, type: 'js_error', label: 'JS Error', detail: 'TypeError in page/register/index.js', icon: '🐛' },
      { timestamp: 55000, type: 'setdata', label: 'setData', detail: 'setData 耗时 180ms (大量数据)', icon: '📊' },
      { timestamp: 60000, type: 'slow_api', label: 'Slow API', detail: 'POST /api/register — 4.2s 响应', icon: '🐢' },
    ];
  } else {
    if (evtTitle) evtTitle.textContent = 'App 事件时间线';
    perfEvents = [
      { timestamp: 0, type: 'cold_start', label: '冷启动', detail: 'App 进程创建开始', icon: '🚀' },
      { timestamp: 200, type: 'application', label: 'Application', detail: 'Application.onCreate 耗时 400ms', icon: '⚙️' },
      { timestamp: 2100, type: 'first_frame', label: '首帧绘制', detail: '首帧渲染完成: 2.1s', icon: '🖼️' },
      { timestamp: 14000, type: 'anr', label: 'ANR 风险', detail: '主线程阻塞 3.2s (数据库查询)', icon: '🔴' },
      { timestamp: 35000, type: 'memory', label: '内存警告', detail: '内存峰值 245MB, 接近阈值', icon: '💾' },
      { timestamp: 60000, type: 'slow_api', label: 'Slow API', detail: 'POST /api/register — 4.2s 响应', icon: '🐢' },
    ];
  }
  evtTimeline.innerHTML = perfEvents.map(e => {
    const isRes = e.isResource;
    const resClass = isRes ? (' perf-evt-resource' + (e.resStatus === 'slow' ? ' res-slow' : e.resStatus === 'failed' ? ' res-failed' : '')) : '';
    // Color-code performance milestone events
    let milestoneClass = '';
    if (!isRes) {
      const t = e.type;
      if (t === 'ttfb') milestoneClass = ' perf-milestone perf-ms-ttfb';
      else if (t === 'fcp') milestoneClass = ' perf-milestone perf-ms-fcp';
      else if (t === 'lcp') milestoneClass = ' perf-milestone perf-ms-lcp';
      else if (t === 'inp') milestoneClass = ' perf-milestone perf-ms-inp';
      else if (t === 'layout_shift') milestoneClass = ' perf-milestone perf-ms-cls';
      else if (t === 'long_task') milestoneClass = ' perf-milestone perf-ms-longtask';
      else if (t === 'slow_api') milestoneClass = ' perf-milestone perf-ms-slowapi';
    }
    return `<div class="perf-evt-item${resClass}${milestoneClass}" onclick="jumpToTime(${e.timestamp})">
      <span class="perf-evt-time">${fmtTime(e.timestamp)}</span>
      <span class="perf-evt-icon">${e.icon}</span>
      <div class="perf-evt-body">
        <span class="perf-evt-label">${e.label}</span>
        <span class="perf-evt-detail">${e.detail}</span>
      </div>
    </div>`;
  }).join('');

  // Append waterfall deep-link as natural timeline tail (Web only)
  if (isWeb) {
    const resCount = perf.resources ? perf.resources.length : 0;
    const slowCount = perf.resources ? perf.resources.filter(r => r.status === 'slow').length : 0;
    const hint = slowCount > 0 ? `${slowCount} 个慢资源` : `${resCount} 个资源`;
    evtTimeline.innerHTML += `<div class="perf-evt-item perf-evt-waterfall-link" onclick="openFullWaterfall()">
      <span class="perf-evt-time" style="color:var(--blue)">📊</span>
      <span class="perf-evt-icon" style="font-size:0.7rem"></span>
      <div class="perf-evt-body">
        <span class="perf-evt-label" style="color:var(--blue)">查看完整瀑布图 →</span>
        <span class="perf-evt-detail">共 ${hint}，点击查看三分区时间线 · 耗时分解 · APM Trace 下钻</span>
      </div>
    </div>`;
  }
}

// ==================== Open Full Waterfall Page ====================
function openFullWaterfall() {
  const sessionId = replaySessionData.session_id || 'sess-e92d1f4a';
  const url = replaySessionData.pages && replaySessionData.pages[0]
    ? replaySessionData.pages[0].url : '/user/register';
  // Navigate via hub postMessage if embedded, otherwise direct
  if (window.parent !== window) {
    window.parent.postMessage({
      type: 'tdemNavigate',
      target: 'waterfall',
      params: { sessionId, url }
    }, '*');
  } else {
    window.open('../waterfall/index.html?sessionId=' + encodeURIComponent(sessionId), '_blank');
  }
}

// ==================== Performance Progress Markers ====================
function renderPerfProgressMarkers() {
  const perf = replaySessionData.perf;
  if (!perf) return;
  const progressBar = document.getElementById('progress-bar');
  const totalMs = replaySessionData.duration * 1000;
  const appType = getAppType();
  const isWeb = appType === 'web';

  // Remove old perf markers
  progressBar.querySelectorAll('.progress-marker[data-perf]').forEach(m => m.remove());

  // Use platform-appropriate events
  let events;
  if (isWeb) {
    events = perf.perf_events;
  } else if (appType === 'mini') {
    events = [
      { timestamp: 0, type: 'launch', label: '启动', detail: '小程序冷启动' },
      { timestamp: 300, type: 'download', label: '包下载', detail: '1.8MB' },
      { timestamp: 700, type: 'first_render', label: '首次渲染', detail: '700ms' },
      { timestamp: 5000, type: 'setdata', label: 'setData', detail: '45ms' },
      { timestamp: 14000, type: 'long_task', label: 'Long Task', detail: '120ms' },
      { timestamp: 55000, type: 'setdata', label: 'setData', detail: '180ms' },
      { timestamp: 60000, type: 'slow_api', label: 'Slow API', detail: '4.2s' },
    ];
  } else {
    events = [
      { timestamp: 0, type: 'cold_start', label: '冷启动', detail: '进程创建' },
      { timestamp: 2100, type: 'first_frame', label: '首帧', detail: '2.1s' },
      { timestamp: 14000, type: 'anr', label: 'ANR 风险', detail: '3.2s 阻塞' },
      { timestamp: 35000, type: 'memory', label: '内存警告', detail: '245MB' },
      { timestamp: 60000, type: 'slow_api', label: 'Slow API', detail: '4.2s' },
    ];
  }

  events.forEach(e => {
    const pct = (e.timestamp / totalMs) * 100;
    let markerClass = 'perf-long-task';
    if (e.type === 'lcp' || e.type === 'fcp' || e.type === 'first_render' || e.type === 'first_frame') markerClass = 'perf-lcp';
    else if (e.type === 'slow_api') markerClass = 'perf-slow-api';
    else if (e.type === 'layout_shift' || e.type === 'anr') markerClass = 'perf-layout-shift';
    else if (e.type === 'ttfb' || e.type === 'inp' || e.type === 'cold_start' || e.type === 'launch') markerClass = 'perf-lcp';

    const marker = document.createElement('div');
    marker.className = `progress-marker ${markerClass}`;
    marker.style.left = pct + '%';
    marker.title = `${e.label}: ${e.detail}`;
    marker.dataset.perf = '1';
    progressBar.appendChild(marker);
  });
}

// ==================== Funnel Step Markers on Timeline ====================
function renderFunnelStepMarkers() {
  const progressBar = document.getElementById('progress-bar');
  const totalMs = replaySessionData.duration * 1000;
  const pages = replaySessionData.pages;

  // Remove old funnel markers
  progressBar.querySelectorAll('.progress-marker.funnel-step-marker').forEach(m => m.remove());

  // Mock funnel steps (in production, would come from active funnel context)
  const funnelSteps = [
    { name: '首页', page: '/' },
    { name: '注册页', page: '/user/register' },
    { name: '注册成功', page: '/dashboard' }
  ];

  funnelSteps.forEach((step, i) => {
    const matchedPage = pages.find(p => p.page_url === step.page);
    if (!matchedPage) {
      // Step not reached — show as failed at the end of timeline
      const marker = document.createElement('div');
      marker.className = 'progress-marker funnel-step-marker';
      marker.style.left = '95%';
      marker.innerHTML = `
        <div class="funnel-marker-dot failed">✗</div>
        <div class="funnel-marker-label">Step ${i + 1}</div>
      `;
      marker.title = `漏斗步骤 ${i + 1}: ${step.name} — 未到达`;
      progressBar.appendChild(marker);
      return;
    }

    const pct = (matchedPage.enter_time / totalMs) * 100;
    // Check completion: next step also reached
    const nextStep = funnelSteps[i + 1];
    const completed = !nextStep || pages.some(p => p.page_url === nextStep.page);

    const marker = document.createElement('div');
    marker.className = 'progress-marker funnel-step-marker';
    marker.style.left = pct + '%';
    marker.innerHTML = `
      <div class="funnel-marker-dot ${completed ? 'completed' : 'failed'}">${completed ? '✓' : '✗'}</div>
      <div class="funnel-marker-label">Step ${i + 1}</div>
    `;
    marker.title = `漏斗步骤 ${i + 1}: ${step.name} — ${completed ? '完成' : '未完成'}`;
    progressBar.appendChild(marker);
  });
}

function backToList() {
  document.getElementById('list-view').style.display = 'block';
  document.getElementById('replay-view').style.display = 'none';
  // Close funnel studio drawer if open
  const overlay = document.getElementById('drawer-overlay');
  const panel = document.getElementById('drawer-panel');
  if (overlay) overlay.classList.remove('open');
  if (panel) panel.classList.remove('open');
  inlineStudioOpen = false;
  currentView = 'list';
}

// ==================== Event List ====================
function renderEventList() {
  const list = document.getElementById('event-list');
  const events = replaySessionData.events.filter(e => {
    if (activeEventFilter === 'all') return true;
    return e.category === activeEventFilter;
  });

  list.innerHTML = events.map((e, idx) => {
    let extraClass = '';
    if (e.is_struggle) extraClass = 'struggle';
    else if (e.category === 'technical') extraClass = 'technical';
    const isActive = idx === 9; // Highlight the rage click event as "current"

    // Show "add to funnel" button on page_view events
    const isPageView = e.event_type === 'page_view';
    const funnelBtn = isPageView ? `
      <button class="evt-funnel-btn" onclick="event.stopPropagation(); addPageToFunnel('${e.page_url}', '${e.detail.replace(/'/g, "\\'")}')" title="添加到漏斗步骤">
        ⚡ 漏斗
      </button>
    ` : '';

    return `
      <div class="event-item ${extraClass} ${isActive ? 'active' : ''}" onclick="jumpToEvent(${e.timestamp}, this)">
        <span class="event-time">${fmtTime(e.timestamp)}</span>
        <span class="event-icon">${e.icon}</span>
        <div class="event-info">
          <div class="event-label">${e.label}${funnelBtn}</div>
          <div class="event-detail" title="${e.detail}">${e.detail}</div>
        </div>
      </div>
    `;
  }).join('');
}

// Event filter chips
document.querySelectorAll('.event-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.event-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeEventFilter = chip.dataset.cat;
    renderEventList();
  });
});

function jumpToEvent(timestamp, clickedEl) {
  const pct = (timestamp / (replaySessionData.duration * 1000)) * 100;
  updateProgress(pct);

  // Update active event
  const items = document.querySelectorAll('.event-item');
  items.forEach(item => item.classList.remove('active'));
  if (clickedEl) clickedEl.classList.add('active');

  // Update mock page content
  const evt = replaySessionData.events.find(e => e.timestamp === timestamp);
  if (evt) updateMockPage(evt);
}

function updateProgress(pct) {
  playProgress = pct;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-handle').style.left = pct + '%';
  const currentSec = Math.round((pct / 100) * replaySessionData.duration);
  document.getElementById('current-time').textContent = fmtDuration(currentSec);

  // Sync event list highlight with current progress
  const currentMs = (pct / 100) * replaySessionData.duration * 1000;
  const items = document.querySelectorAll('.event-item');
  items.forEach(item => {
    item.classList.remove('active');
  });
  // Find the latest event that has already occurred
  const events = replaySessionData.events.filter(e => {
    if (activeEventFilter === 'all') return true;
    return e.category === activeEventFilter;
  });
  let matchIdx = -1;
  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i].timestamp <= currentMs) { matchIdx = i; break; }
  }
  if (matchIdx >= 0 && items[matchIdx]) {
    items[matchIdx].classList.add('active');
  }

  // Update mock page to reflect current playback position
  // Find the latest event from ALL events (not just filtered) at or before currentMs
  const allEvents = replaySessionData.events;
  let mockEvt = null;
  for (let i = allEvents.length - 1; i >= 0; i--) {
    if (allEvents[i].timestamp <= currentMs) { mockEvt = allEvents[i]; break; }
  }
  if (mockEvt) updateMockPage(mockEvt);
}

function updateMockPage(evt) {
  const mockUrl = document.getElementById('mock-url');
  const mockContent = document.getElementById('mock-content');
  const cursor = document.getElementById('cursor-indicator');

  // Dispatch by scenario
  if (window.currentScenario === 'edu') {
    renderEduMockPage(evt, mockUrl, mockContent);
  } else {
    renderBankMockPage(evt, mockUrl, mockContent);
  }

  // Animate cursor to random position
  cursor.style.top = (30 + Math.random() * 40) + '%';
  cursor.style.left = (30 + Math.random() * 40) + '%';
}

// ==================== Bank Scenario Mock Page ====================
function renderBankMockPage(evt, mockUrl, mockContent) {
  if (evt.page_url === '/user/register') {
    mockUrl.textContent = 'glassbk.digital/user/register';
    mockContent.innerHTML = `
      <div class="mock-page">
        <div class="mock-header">
          <div class="mock-logo">GlassBank</div>
          <div class="mock-nav-items"><span>Home</span><span>Products</span><span>About</span><span class="highlight">Register</span></div>
        </div>
        <div style="max-width:400px;margin:20px auto">
          <h2 style="font-size:1.3rem;font-weight:800;margin-bottom:20px;text-align:center">Create Account</h2>
          <div style="margin-bottom:14px">
            <label style="display:block;font-size:0.75rem;color:var(--text-3);margin-bottom:4px">Email</label>
            <div style="background:var(--bg-3);border:1px solid ${evt.event_type === 'input' && evt.detail.includes('email') ? 'var(--blue)' : 'var(--border)'};border-radius:var(--r-sm);padding:8px 12px;font-size:0.85rem;color:var(--text-2)">j***@gmail.com</div>
          </div>
          <div style="margin-bottom:14px">
            <label style="display:block;font-size:0.75rem;color:var(--text-3);margin-bottom:4px">Password</label>
            <div style="background:var(--bg-3);border:1px solid ${evt.detail.includes('password') || evt.event_type === 'validation_error' ? 'var(--red)' : 'var(--border)'};border-radius:var(--r-sm);padding:8px 12px;font-size:0.85rem;color:var(--text-2)">****</div>
            ${evt.event_type === 'validation_error' ? '<div style="font-size:0.72rem;color:var(--red);margin-top:4px">⚠ Password too weak</div>' : ''}
          </div>
          <button style="width:100%;padding:10px;background:${evt.event_type === 'rage_click' || evt.event_type === 'dead_click' ? 'var(--red)' : 'var(--blue)'};color:#fff;border:none;border-radius:var(--r-sm);font-weight:700;font-size:0.9rem;cursor:pointer;position:relative;${evt.event_type === 'rage_click' ? 'animation:shake 0.3s ease-in-out 3' : ''}">
            ${evt.event_type === 'rage_click' ? '🔴 ' : ''}Register
          </button>
          ${evt.event_type === 'api_error' ? '<div style="margin-top:12px;padding:10px;background:var(--red-dim);border:1px solid var(--red);border-radius:var(--r-sm);font-size:0.78rem;color:var(--red)">⚠ 500 Internal Server Error - Registration failed</div>' : ''}
          ${evt.event_type === 'js_error' ? '<div style="margin-top:12px;padding:10px;background:var(--orange-dim);border:1px solid var(--orange);border-radius:var(--r-sm);font-size:0.78rem;color:var(--orange)">🐛 TypeError: Cannot read property "validate" of undefined</div>' : ''}
        </div>
      </div>
    `;
  } else {
    mockUrl.textContent = 'glassbk.digital';
    mockContent.innerHTML = `
      <div class="mock-page">
        <div class="mock-header">
          <div class="mock-logo">GlassBank</div>
          <div class="mock-nav-items"><span>Home</span><span>Products</span><span>About</span><span class="highlight">Register</span></div>
        </div>
        <div class="mock-hero">
          <div class="mock-hero-text">Welcome to GlassBank</div>
          <div class="mock-hero-sub">Your trusted digital banking partner</div>
          <button class="mock-cta">Get Started</button>
        </div>
      </div>
    `;
  }
}

// ==================== Edu Scenario Mock Page ====================
function renderEduMockPage(evt, mockUrl, mockContent) {
  const page = evt.page_url || '';

  // Course list page
  if (page === '/course-selection/elective') {
    mockUrl.textContent = 'star-edu.cn/course-selection/elective';
    const ts = evt.timestamp || 0;
    // In first 5s, banner and thumbs are still loading
    const bannerLoaded = ts >= 5200;
    const thumbsLoaded = ts >= 8500;

    const courses = [
      { code: 'CS2041', name: '人工智能导论', subject: 'ai', teacher: '张教授', slots: '仅剩 3/180', hot: true },
      { code: 'CS3015', name: '机器学习基础', subject: 'ml', teacher: '李教授', slots: '15/120', hot: false },
      { code: 'CS2052', name: '数据库系统', subject: 'db', teacher: '王教授', slots: '42/150', hot: false },
      { code: 'CS2080', name: '操作系统', subject: 'os', teacher: '刘教授', slots: '28/120', hot: false },
      { code: 'CS2063', name: '算法设计与分析', subject: 'algo', teacher: '陈教授', slots: '仅剩 5/100', hot: true },
      { code: 'CS3021', name: '计算机网络', subject: 'net', teacher: '赵教授', slots: '58/180', hot: false },
    ];

    const isZigzag = evt.event_type === 'form_zigzag';

    mockContent.innerHTML = `
      <div class="mock-edu-page">
        <div class="mock-edu-header">
          <div class="mock-edu-logo">
            <div class="mock-edu-logo-icon">🎓</div>
            <span>星辰大学 · 教务系统</span>
          </div>
          <div class="mock-edu-nav">
            <span>首页</span>
            <span class="active">春季选课</span>
            <span>我的课表</span>
            <span>成绩查询</span>
          </div>
          <div class="mock-edu-user">
            <div class="mock-edu-avatar">学</div>
            <span>stu_2023***</span>
          </div>
        </div>
        <div class="mock-edu-banner">
          <div class="mock-edu-banner-text">
            <div class="mock-edu-banner-title">2026 春季选修课已开放</div>
            <div class="mock-edu-banner-sub">选课时间：2026-03-15 18:00 — 03-20 24:00</div>
          </div>
          <div class="mock-edu-banner-loading ${bannerLoaded ? 'loaded' : ''}">${bannerLoaded ? '' : '加载中 2.1s'}</div>
        </div>
        <div class="mock-edu-section">
          <div class="mock-edu-section-title">
            热门选修课 <span class="mock-edu-section-tag">高峰期抢课中</span>
          </div>
          <div class="mock-edu-grid">
            ${courses.map((c, i) => {
              const active = (evt.detail && evt.detail.includes(c.name)) || (isZigzag && (i === 0 || i === 1));
              return `
                <div class="mock-course-card ${c.hot ? 'hot' : ''} ${active ? 'active' : ''}">
                  <div class="mock-course-thumb ${thumbsLoaded ? '' : 'loading'}" data-subject="${c.subject}">
                    ${thumbsLoaded ? (c.subject === 'ai' ? '🤖' : c.subject === 'ml' ? '🧠' : c.subject === 'db' ? '🗄️' : c.subject === 'os' ? '💻' : c.subject === 'algo' ? '🔢' : '🌐') : ''}
                  </div>
                  <div class="mock-course-info">
                    <div class="mock-course-name">${c.name}</div>
                    <div class="mock-course-code">${c.code} · ${c.teacher}</div>
                    <div class="mock-course-meta">
                      <span>3 学分</span>
                      <span class="mock-course-slots">${c.slots}</span>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
    return;
  }

  // Course detail pages
  if (page === '/course/CS2041' || page === '/course/CS3015') {
    const isAI = page === '/course/CS2041';
    const name = isAI ? '人工智能导论' : '机器学习基础';
    const code = isAI ? 'CS2041' : 'CS3015';
    const teacher = isAI ? '张教授' : '李教授';
    const icon = isAI ? '🤖' : '🧠';
    const slots = isAI ? '仅剩 3/180' : '15/120';

    mockUrl.textContent = `star-edu.cn/course/${code}`;

    const btnLoading = evt.event_type === 'click' && evt.detail && evt.detail.includes('加入选课');
    const btnRage = evt.event_type === 'rage_click';
    const btnError = evt.event_type === 'api_error' || evt.event_type === 'dead_click';
    const showApiError = evt.event_type === 'api_error';
    const showJsError = evt.event_type === 'js_error';
    const showToast = evt.detail && evt.detail.includes('系统繁忙');
    const showResourceError = evt.event_type === 'resource_error' && evt.detail.includes('captcha');

    let btnClass = '';
    let btnText = '加入选课';
    if (btnLoading) { btnClass = 'loading'; btnText = '选课中'; }
    else if (btnRage || btnError) { btnClass = 'error'; btnText = btnRage ? '🔴 加入选课' : '加入失败，重试'; }

    mockContent.innerHTML = `
      <div class="mock-edu-page">
        <div class="mock-edu-header">
          <div class="mock-edu-logo">
            <div class="mock-edu-logo-icon">🎓</div>
            <span>星辰大学 · 教务系统</span>
          </div>
          <div class="mock-edu-nav">
            <span>首页</span>
            <span class="active">春季选课</span>
            <span>我的课表</span>
            <span>成绩查询</span>
          </div>
          <div class="mock-edu-user">
            <div class="mock-edu-avatar">学</div>
            <span>stu_2023***</span>
          </div>
        </div>
        <div class="mock-course-detail">
          <div class="mock-course-detail-header">
            <div class="mock-course-detail-thumb" style="background:${isAI ? 'linear-gradient(135deg,#4f8cff,#a78bfa)' : 'linear-gradient(135deg,#ed7b2f,#fbbf24)'}">${icon}</div>
            <div class="mock-course-detail-info">
              <h3>${name}</h3>
              <div class="mock-course-detail-tags">
                ${isAI ? '<span class="mock-course-detail-tag hot">🔥 热门</span>' : ''}
                <span class="mock-course-detail-tag">核心选修</span>
                <span class="mock-course-detail-tag">3 学分</span>
              </div>
              <div class="mock-course-detail-meta">
                <div>课程代码：<strong>${code}</strong> · 授课教师：<strong>${teacher}</strong></div>
                <div>开课时间：周二 3-4 节 · 周四 5-6 节</div>
                <div>余量：<strong style="color:#e34d59">${slots}</strong></div>
              </div>
            </div>
          </div>
          ${showResourceError ? '<div class="mock-edu-toast"><span class="mock-edu-toast-icon">🔗</span><span>验证码资源加载失败 (captcha.woff2 Network Error)</span></div>' : ''}
          ${showToast ? '<div class="mock-edu-toast"><span class="mock-edu-toast-icon">⚠️</span><span>系统繁忙，请稍后重试 (错误码: 500)</span></div>' : ''}
          ${showApiError ? '<div class="mock-edu-toast"><span class="mock-edu-toast-icon">🌐</span><span>POST /api/course/select → 500 Internal Server Error</span></div>' : ''}
          ${showJsError ? '<div class="mock-edu-toast" style="background:rgba(251,146,60,0.08);border-color:rgba(251,146,60,0.3);color:#ed7b2f"><span class="mock-edu-toast-icon">🐛</span><span>TypeError: Cannot read property "validate" of undefined</span></div>' : ''}
          <button class="mock-select-btn ${btnClass}">${btnText}</button>
        </div>
      </div>
    `;
    return;
  }

  // Student home (session end)
  if (page === '/student/home') {
    mockUrl.textContent = 'star-edu.cn/student/home';
    mockContent.innerHTML = `
      <div class="mock-edu-page">
        <div class="mock-edu-header">
          <div class="mock-edu-logo">
            <div class="mock-edu-logo-icon">🎓</div>
            <span>星辰大学 · 教务系统</span>
          </div>
          <div class="mock-edu-nav">
            <span class="active">首页</span>
            <span>春季选课</span>
            <span>我的课表</span>
            <span>成绩查询</span>
          </div>
          <div class="mock-edu-user">
            <div class="mock-edu-avatar">学</div>
            <span>stu_2023***</span>
          </div>
        </div>
        <div class="mock-edu-empty">
          <div style="font-size:2.5rem;margin-bottom:8px">😞</div>
          <div style="font-weight:700;color:#1b2a4e;font-size:0.95rem;margin-bottom:4px">用户放弃选课返回首页</div>
          <div>本次未完成任何选课</div>
        </div>
      </div>
    `;
    return;
  }

  // Fallback
  mockUrl.textContent = 'star-edu.cn';
  mockContent.innerHTML = `<div class="mock-edu-page"><div class="mock-edu-empty">${page}</div></div>`;
}

// ==================== Page Timeline ====================
function renderPageTimeline() {
  const timeline = document.getElementById('page-timeline');
  const totalDur = replaySessionData.duration * 1000;

  timeline.innerHTML = replaySessionData.pages.map(p => {
    const widthPct = (p.duration / totalDur) * 100;
    let cls = 'no-struggle';
    if (p.struggle_count >= 3) cls = 'high-struggle';
    else if (p.struggle_count >= 1) cls = 'low-struggle';

    return `<div class="page-segment ${cls}" style="width:${widthPct}%" onclick="jumpToTime(${p.enter_time})" title="${p.page_name} (${fmtTime(p.enter_time)} - ${fmtTime(p.leave_time)})">${p.page_name}</div>`;
  }).join('');
}

function jumpToTime(ms) {
  const pct = (ms / (replaySessionData.duration * 1000)) * 100;
  updateProgress(pct);
}

// ==================== Inline Funnel Studio ====================
let inlineStudioOpen = false;
let inlineSteps = [];

function toggleFunnelStudio() {
  const overlay = document.getElementById('drawer-overlay');
  const panel = document.getElementById('drawer-panel');
  if (!overlay || !panel) return;

  if (inlineStudioOpen) {
    overlay.classList.remove('open');
    panel.classList.remove('open');
    inlineStudioOpen = false;
  } else {
    // Extract steps from current session's page path
    extractStepsFromSession();
    overlay.classList.add('open');
    panel.classList.add('open');
    inlineStudioOpen = true;
    
    // Update drawer title to "Analyze This Path" mode
    const titleEl = document.querySelector('.drawer-title');
    if (titleEl) titleEl.textContent = '分析此路径';
    const badgeEl = document.getElementById('ifs-source-badge');
    if (badgeEl) badgeEl.textContent = '基于当前会话路径';
    
    renderInlineStudio();
    renderAnalyzePathHeader();
    checkMatchedFunnels();
  }
}

// Render "Analyze This Path" header with quick stats
function renderAnalyzePathHeader() {
  const headerArea = document.getElementById('ifs-path-analysis');
  if (!headerArea) return;
  
  const pathStr = inlineSteps.map(s => s.name).join(' → ');
  const hasStruggle = inlineSteps.some(s => s.struggle);
  
  headerArea.innerHTML = `
    <div class="ifs-path-banner">
      <div class="ifs-path-route">
        ${inlineSteps.map((s, i) => `
          <span class="ifs-path-node ${s.struggle ? 'struggle' : ''}">${s.name}${s.struggle ? ' ⚠️' : ''}</span>
          ${i < inlineSteps.length - 1 ? '<span class="ifs-path-arrow">→</span>' : ''}
        `).join('')}
      </div>
      <div class="ifs-path-quick-stats">
        <div class="ifs-qs-item">
          <span class="ifs-qs-val">15.2K</span>
          <span class="ifs-qs-label">同路径会话</span>
        </div>
        <div class="ifs-qs-item">
          <span class="ifs-qs-val" style="color:var(--green)">12.3%</span>
          <span class="ifs-qs-label">完成转化</span>
        </div>
        <div class="ifs-qs-item">
          <span class="ifs-qs-val" style="color:var(--red)">43.2%</span>
          <span class="ifs-qs-label">最大流失</span>
        </div>
      </div>
      ${hasStruggle ? `
        <div class="ifs-path-alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span>此路径有 <strong>${inlineSteps.filter(s => s.struggle).length} 个步骤</strong>存在用户挣扎，建议创建漏斗持续监控</span>
        </div>
      ` : ''}
    </div>
  `;
}

function extractStepsFromSession() {
  const pages = replaySessionData.pages;
  const seen = new Set();
  inlineSteps = [];
  pages.forEach(p => {
    if (!seen.has(p.page_url)) {
      seen.add(p.page_url);
      inlineSteps.push({
        name: p.page_name,
        page: p.page_url,
        match: 'exact',
        struggle: p.struggle_count > 0,
        duration: p.duration,
        struggle_count: p.struggle_count
      });
    }
  });

  // Set default funnel name
  const nameInput = document.getElementById('ifs-funnel-name');
  if (nameInput) {
    nameInput.value = inlineSteps.map(s => s.name).join(' → ') + ' 漏斗';
  }
}

function renderInlineStudio() {
  // Render steps editor
  const stepsContainer = document.getElementById('ifs-steps');
  stepsContainer.innerHTML = inlineSteps.map((step, i) => `
    <div class="ifs-step ${step.struggle ? 'has-struggle' : ''}" data-idx="${i}">
      <div class="ifs-step-header">
        <span class="ifs-step-num">${i + 1}</span>
        <input type="text" class="ifs-step-name-input" value="${step.name}" 
               onchange="inlineSteps[${i}].name = this.value; renderInlinePreview()">
        ${step.struggle ? '<span class="ifs-step-warn" title="此步骤有用户挣扎">⚠️</span>' : ''}
        <button class="ifs-step-del" onclick="removeInlineStep(${i})" title="删除">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="ifs-step-detail">
        <div class="ifs-step-field ifs-url-field">
          <span class="ifs-field-label">URL</span>
          <div class="ifs-url-autocomplete-wrapper">
            <input type="text" value="${step.page}" 
                   oninput="onUrlInput(${i}, this)"
                   onfocus="showUrlSuggestions(${i}, this)"
                   onchange="inlineSteps[${i}].page = this.value"
                   autocomplete="off">
            <div class="ifs-url-dropdown" id="ifs-url-dropdown-${i}"></div>
          </div>
        </div>
        <div class="ifs-step-field">
          <span class="ifs-field-label">匹配</span>
          <select onchange="inlineSteps[${i}].match = this.value">
            <option value="exact" ${step.match === 'exact' ? 'selected' : ''}>精确</option>
            <option value="prefix" ${step.match === 'prefix' ? 'selected' : ''}>前缀</option>
            <option value="regex" ${step.match === 'regex' ? 'selected' : ''}>正则</option>
          </select>
        </div>
      </div>
    </div>
  `).join('');

  renderInlinePreview();
  renderGroupStats();
  renderAIFunnelHint();
}

// ==================== URL Autocomplete ====================
// Collect all known page URLs from session data and mock common pages
function getKnownPageUrls() {
  const pages = [];
  const seen = new Set();
  
  // Pages from current session
  replaySessionData.pages.forEach(p => {
    if (!seen.has(p.page_url)) {
      seen.add(p.page_url);
      pages.push({ url: p.page_url, name: p.page_name, source: 'session', sessions: '当前会话' });
    }
  });
  
  // Extract pages from session events
  replaySessionData.events.forEach(e => {
    if (e.page_url && !seen.has(e.page_url)) {
      seen.add(e.page_url);
      const name = e.detail.split('/')[0].trim() || e.page_url;
      pages.push({ url: e.page_url, name: name, source: 'session', sessions: '当前会话' });
    }
  });
  
  // Mock common pages from the app (in production, this would come from an API)
  const commonPages = [
    { url: '/', name: 'Home', source: 'common', sessions: '89.2K' },
    { url: '/user/register', name: 'Register', source: 'common', sessions: '15.2K' },
    { url: '/user/login', name: 'Login', source: 'common', sessions: '32.1K' },
    { url: '/dashboard', name: 'Dashboard', source: 'common', sessions: '28.7K' },
    { url: '/products', name: 'Products', source: 'common', sessions: '18.4K' },
    { url: '/checkout', name: 'Checkout', source: 'common', sessions: '9.8K' },
    { url: '/user/profile', name: 'Profile', source: 'common', sessions: '12.3K' },
    { url: '/about', name: 'About', source: 'common', sessions: '5.1K' },
  ];
  commonPages.forEach(p => {
    if (!seen.has(p.url)) {
      seen.add(p.url);
      pages.push(p);
    }
  });
  
  return pages;
}

function showUrlSuggestions(stepIdx, inputEl) {
  const dropdown = document.getElementById(`ifs-url-dropdown-${stepIdx}`);
  if (!dropdown) return;
  
  const query = inputEl.value.toLowerCase();
  const allPages = getKnownPageUrls();
  const filtered = query 
    ? allPages.filter(p => p.url.toLowerCase().includes(query) || p.name.toLowerCase().includes(query))
    : allPages;
  
  if (filtered.length === 0) {
    dropdown.innerHTML = '<div class="ifs-url-empty">无匹配页面</div>';
    dropdown.classList.add('open');
    return;
  }
  
  dropdown.innerHTML = filtered.map(p => {
    const sourceTag = p.source === 'session' 
      ? '<span class="ifs-url-tag session">当前会话</span>'
      : '<span class="ifs-url-tag common">常用页面</span>';
    return `
      <div class="ifs-url-option" onmousedown="selectUrlSuggestion(${stepIdx}, '${p.url}', '${p.name}')">
        <div class="ifs-url-option-main">
          <span class="ifs-url-option-name">${p.name}</span>
          <span class="ifs-url-option-url">${p.url}</span>
        </div>
        <div class="ifs-url-option-meta">
          ${sourceTag}
          <span class="ifs-url-option-count">${p.sessions}</span>
        </div>
      </div>
    `;
  }).join('');
  dropdown.classList.add('open');
}

function onUrlInput(stepIdx, inputEl) {
  inlineSteps[stepIdx].page = inputEl.value;
  showUrlSuggestions(stepIdx, inputEl);
}

function selectUrlSuggestion(stepIdx, url, name) {
  inlineSteps[stepIdx].page = url;
  // If step name is default, auto-fill the name too
  if (inlineSteps[stepIdx].name === '新步骤' || !inlineSteps[stepIdx].name) {
    inlineSteps[stepIdx].name = name;
  }
  renderInlineStudio();
}

// Close all URL dropdowns on click outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.ifs-url-autocomplete-wrapper')) {
    document.querySelectorAll('.ifs-url-dropdown').forEach(dd => dd.classList.remove('open'));
  }
});

function renderInlinePreview() {
  const container = document.getElementById('ifs-mini-preview');
  container.innerHTML = `
    <div class="ifs-funnel-flow">
      ${inlineSteps.map((step, i) => `
        <div class="ifs-flow-step ${step.struggle ? 'struggle' : ''}">
          <div class="ifs-flow-num">${i + 1}</div>
          <div class="ifs-flow-name">${step.name}</div>
          ${step.struggle ? '<div class="ifs-flow-warn">⚠️</div>' : ''}
        </div>
        ${i < inlineSteps.length - 1 ? `
          <div class="ifs-flow-connector">
            <div class="ifs-flow-arrow">→</div>
          </div>
        ` : ''}
      `).join('')}
    </div>
  `;
}

function renderGroupStats() {
  const container = document.getElementById('ifs-group-stats');
  // Mock group stats based on path
  container.innerHTML = `
    <div class="ifs-stats-title">路径群体数据</div>
    <div class="ifs-stats-grid">
      <div class="ifs-stat-item">
        <span class="ifs-stat-val">15.2K</span>
        <span class="ifs-stat-label">经过此路径</span>
      </div>
      <div class="ifs-stat-item">
        <span class="ifs-stat-val" style="color:var(--green)">12.3%</span>
        <span class="ifs-stat-label">完成转化</span>
      </div>
      <div class="ifs-stat-item">
        <span class="ifs-stat-val" style="color:var(--red)">43.2%</span>
        <span class="ifs-stat-label">Step 2 流失</span>
      </div>
      <div class="ifs-stat-item">
        <span class="ifs-stat-val" style="color:var(--orange)">0.45</span>
        <span class="ifs-stat-label">平均挣扎分</span>
      </div>
    </div>
  `;
}

function renderAIFunnelHint() {
  const container = document.getElementById('ifs-ai-hint');
  const hasStruggle = inlineSteps.some(s => s.struggle);
  container.innerHTML = `
    <div class="ifs-ai-card">
      <div class="ifs-ai-header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        <span>AI 分析</span>
      </div>
      <div class="ifs-ai-insights">
        ${hasStruggle ? `
          <div class="ifs-ai-item">🔴 Step 2 (Register) 有 <strong>5 次挣扎事件</strong>，是此路径的主要瓶颈</div>
          <div class="ifs-ai-item">🐛 32% 的同路径用户在 Step 2 遇到 JS Error</div>
          <div class="ifs-ai-item">💡 修复表单校验逻辑可提升转化率约 3-5pp</div>
        ` : `
          <div class="ifs-ai-item">✅ 此路径无明显挣扎点，转化表现良好</div>
        `}
      </div>
    </div>
  `;
}

function checkMatchedFunnels() {
  // Mock: check if current path matches any existing funnel
  const hint = document.getElementById('ifs-match-hint');
  const text = document.getElementById('ifs-match-text');
  // Simulate a match with "注册流程漏斗"
  const pathPages = inlineSteps.map(s => s.page);
  if (pathPages.includes('/user/register')) {
    hint.style.display = 'flex';
    text.textContent = '此路径匹配已有漏斗「注册流程漏斗」(2/4 步骤匹配)';
  } else {
    hint.style.display = 'none';
  }
}

function openMatchedFunnel() {
  navigateToPage('funnel-analysis', { from: 'session-replay', funnel: 'funnel_001' });
}

function addInlineStep(prefillPage, prefillName) {
  if (inlineSteps.length >= 10) {
    showToast('最多支持 10 个步骤');
    return;
  }
  inlineSteps.push({
    name: prefillName || '新步骤',
    page: prefillPage || '',
    match: 'exact',
    struggle: false,
    duration: 0,
    struggle_count: 0
  });
  renderInlineStudio();
}

// Quick-add from event list page_view button
function addPageToFunnel(pageUrl, detail) {
  // Parse page name from detail (e.g. "Home /" → "Home")
  const pageName = detail.split('/')[0].trim() || pageUrl;
  
  // If Funnel Studio is not open, open it first
  if (!inlineStudioOpen) {
    toggleFunnelStudio();
  }
  
  // Check if this URL is already in the steps
  const exists = inlineSteps.some(s => s.page === pageUrl);
  if (exists) {
    showToast(`「${pageName}」已在漏斗步骤中`);
    return;
  }
  
  addInlineStep(pageUrl, pageName);
  showToast(`已添加「${pageName}」到漏斗步骤 #${inlineSteps.length}`);
}

function removeInlineStep(idx) {
  if (inlineSteps.length <= 2) {
    showToast('至少需要 2 个步骤');
    return;
  }
  inlineSteps.splice(idx, 1);
  renderInlineStudio();
}

function saveAndStayFunnel() {
  const name = document.getElementById('ifs-funnel-name').value || '自定义漏斗';
  showToast(`漏斗「${name}」已保存 (${inlineSteps.length} 步骤)`);
}

function saveAndViewFunnelReport() {
  const name = document.getElementById('ifs-funnel-name').value || '自定义漏斗';
  showToast(`漏斗「${name}」已保存，正在跳转报告...`);
  
  // Navigate to funnel analysis with the steps
  const steps = inlineSteps.map(s => ({
    name: s.name,
    page: s.page,
    match: s.match
  }));
  
  setTimeout(() => {
    navigateToPage('funnel-analysis', {
      from: 'session-replay',
      action: 'view',
      funnel: 'funnel_new',
      session_id: document.getElementById('replay-session-id').textContent
    });
  }, 800);
}

// Legacy function — now opens inline studio instead of navigating away
function createFunnelFromSession() {
  toggleFunnelStudio();
}

function viewSimilarSessions() {
  showToast('正在筛选同路径会话... (共 15,200 个匹配)');
}

// ==================== AI Panel ====================
function toggleAIPanel() {
  document.getElementById('ai-panel').classList.toggle('collapsed');
}

function renderAIContent() {
  const container = document.getElementById('ai-content');
  const data = replaySessionData.ai_insights;

  if (activeAITab === 'all') {
    container.innerHTML = `
      <div class="ai-summary">${data.summary}</div>
      <div class="ai-section-title">Key Takeaways</div>
      ${data.key_takeaways.map(t => `<div class="ai-takeaway">${t}</div>`).join('')}
    `;
  } else if (activeAITab === 'technical') {
    container.innerHTML = `
      <div class="ai-section-title">Technical Insights</div>
      ${data.technical_insights.map(t => `<div class="ai-takeaway">${t}</div>`).join('')}
    `;
  } else if (activeAITab === 'performance') {
    const perf = replaySessionData.perf;
    const perfInsights = data.performance_insights || [];
    const appType = getAppType();
    const isWeb = appType === 'web';

    let perfCards = '';
    if (isWeb && perf) {
      perfCards = `<div style="display:flex;gap:12px;margin-bottom:12px;flex-wrap:wrap">
        <div style="background:var(--bg-3);border-radius:var(--r-sm);padding:6px 12px;font-size:0.72rem;font-family:var(--font-mono)">
          LCP <strong style="color:${perfStatus('lcp',perf.lcp)==='good'?'var(--green)':perfStatus('lcp',perf.lcp)==='fair'?'var(--orange)':'var(--red)'}">${fmtPerf('lcp',perf.lcp)}</strong>
        </div>
        <div style="background:var(--bg-3);border-radius:var(--r-sm);padding:6px 12px;font-size:0.72rem;font-family:var(--font-mono)">
          INP <strong style="color:${perfStatus('inp',perf.inp)==='good'?'var(--green)':perfStatus('inp',perf.inp)==='fair'?'var(--orange)':'var(--red)'}">${fmtPerf('inp',perf.inp)}</strong>
        </div>
        <div style="background:var(--bg-3);border-radius:var(--r-sm);padding:6px 12px;font-size:0.72rem;font-family:var(--font-mono)">
          CLS <strong style="color:${perfStatus('cls',perf.cls)==='good'?'var(--green)':perfStatus('cls',perf.cls)==='fair'?'var(--orange)':'var(--red)'}">${perf.cls.toFixed(2)}</strong>
        </div>
        <div style="background:var(--bg-3);border-radius:var(--r-sm);padding:6px 12px;font-size:0.72rem;font-family:var(--font-mono)">
          Long Tasks <strong style="color:${perf.long_tasks>3?'var(--red)':perf.long_tasks>1?'var(--orange)':'var(--green)'}">${perf.long_tasks}</strong>
        </div>
      </div>`;
    } else if (appType === 'mini' && perf) {
      perfCards = `<div style="display:flex;gap:12px;margin-bottom:12px;flex-wrap:wrap">
        <div style="background:var(--bg-3);border-radius:var(--r-sm);padding:6px 12px;font-size:0.72rem;font-family:var(--font-mono)">
          启动耗时 <strong style="color:var(--orange)">${perf.launch_time || 1200}ms</strong>
        </div>
        <div style="background:var(--bg-3);border-radius:var(--r-sm);padding:6px 12px;font-size:0.72rem;font-family:var(--font-mono)">
          首次渲染 <strong style="color:var(--orange)">${perf.first_render || 800}ms</strong>
        </div>
        <div style="background:var(--bg-3);border-radius:var(--r-sm);padding:6px 12px;font-size:0.72rem;font-family:var(--font-mono)">
          setData <strong style="color:var(--green)">${perf.set_data_cost || 45}ms</strong>
        </div>
        <div style="background:var(--bg-3);border-radius:var(--r-sm);padding:6px 12px;font-size:0.72rem;font-family:var(--font-mono)">
          包大小 <strong style="color:var(--orange)">${perf.pkg_size || 1.8}MB</strong>
        </div>
      </div>`;
    } else if (appType === 'app' && perf) {
      perfCards = `<div style="display:flex;gap:12px;margin-bottom:12px;flex-wrap:wrap">
        <div style="background:var(--bg-3);border-radius:var(--r-sm);padding:6px 12px;font-size:0.72rem;font-family:var(--font-mono)">
          冷启动 <strong style="color:var(--red)">${perf.cold_start || 2100}ms</strong>
        </div>
        <div style="background:var(--bg-3);border-radius:var(--r-sm);padding:6px 12px;font-size:0.72rem;font-family:var(--font-mono)">
          ANR <strong style="color:${(perf.anr_count||0)>0?'var(--red)':'var(--green)'}">${perf.anr_count || 0}</strong>
        </div>
        <div style="background:var(--bg-3);border-radius:var(--r-sm);padding:6px 12px;font-size:0.72rem;font-family:var(--font-mono)">
          帧率 <strong style="color:${(perf.fps||58)<50?'var(--red)':(perf.fps||58)<55?'var(--orange)':'var(--green)'}">${perf.fps || 58} fps</strong>
        </div>
        <div style="background:var(--bg-3);border-radius:var(--r-sm);padding:6px 12px;font-size:0.72rem;font-family:var(--font-mono)">
          内存峰值 <strong style="color:var(--orange)">${perf.memory_peak || 245}MB</strong>
        </div>
      </div>`;
    }

    const crossTitle = isWeb ? '⚡ Performance × Behavior 交叉分析' :
                       appType === 'mini' ? '⚡ 小程序性能 × 行为交叉分析' : '⚡ App 性能 × 行为交叉分析';

    // Platform-specific insights
    let insights = perfInsights;
    if (!isWeb) {
      if (appType === 'mini') {
        insights = [
          '🚀 小程序启动耗时 1.2s，超过理想值 1s；建议分包加载和减少同步 API 调用',
          '📊 页面注册流程中 setData 调用 2 次，第二次耗时 180ms — 数据量过大，建议 diff 更新',
          '🐛 JS Error 在表单校验逻辑中出现，与用户挣扎行为高度相关',
          '🐢 POST /api/register 耗时 4.2s，与 rage click 时间点吻合',
          '📦 代码包 1.8MB，接近 2MB 限制 — 建议清理未使用代码'
        ];
      } else {
        insights = [
          '🚀 冷启动 2.1s，Application.onCreate 占 400ms — 建议延迟初始化非必要 SDK',
          '🔴 检测到 ANR 风险：主线程数据库查询阻塞 3.2s，应迁移至后台线程',
          '💾 内存峰值 245MB，接近系统警告阈值 — 建议检查图片缓存策略',
          '🐢 POST /api/register 耗时 4.2s，与用户 rage click 时间点吻合',
          '📊 帧率 58fps 基本达标，但在表单交互密集期降至 45fps'
        ];
      }
    }

    container.innerHTML = `
      <div class="ai-section-title">${crossTitle}</div>
      ${perfCards}
      ${insights.map(t => `<div class="ai-takeaway">${t}</div>`).join('')}
    `;
  } else {
    container.innerHTML = `
      <div class="ai-section-title">Behavioral Insights</div>
      ${data.behavioral_insights.map(t => `<div class="ai-takeaway">${t}</div>`).join('')}
    `;
  }
}

document.querySelectorAll('.ai-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.ai-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeAITab = tab.dataset.tab;
    renderAIContent();
  });
});

// ==================== Play/Pause Simulation ====================
let playInterval = null;

document.getElementById('play-btn').addEventListener('click', function() {
  isPlaying = !isPlaying;
  this.innerHTML = isPlaying
    ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
    : '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';

  if (isPlaying) {
    playInterval = setInterval(() => {
      playProgress += 0.5;
      if (playProgress >= 100) {
        playProgress = 100;
        isPlaying = false;
        clearInterval(playInterval);
        document.getElementById('play-btn').innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
      }
      updateProgress(playProgress);
    }, 100);
  } else {
    clearInterval(playInterval);
  }
});

// Progress bar click
document.getElementById('progress-bar').addEventListener('click', function(e) {
  const rect = this.getBoundingClientRect();
  const pct = ((e.clientX - rect.left) / rect.width) * 100;
  updateProgress(Math.max(0, Math.min(100, pct)));
});

// ==================== Natural Language Search ====================
document.getElementById('nl-search').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    const query = this.value.trim();
    if (!query) return;

    // Simulate AI parsing
    const container = document.getElementById('active-filters');
    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    tag.innerHTML = `NL: "${query}"<button class="filter-tag-close" onclick="this.parentElement.remove()">×</button>`;
    container.appendChild(tag);
    this.value = '';
  }
});

// ==================== Session Navigation ====================
function navigateSession(dir) {
  const sessions = sessionListData.sessions;
  const currentId = document.getElementById('replay-session-id').textContent;
  const idx = sessions.findIndex(s => s.session_id === currentId);
  const newIdx = idx + dir;
  if (newIdx >= 0 && newIdx < sessions.length) {
    openReplay(sessions[newIdx].session_id);
  } else {
    showToast(dir < 0 ? '已是第一个会话' : '已是最后一个会话');
  }
}

// ==================== Cross-Page Navigation ====================
function navigateToPage(page, params) {
  if (window.tdemNavigate) {
    window.tdemNavigate(page, params);
  } else if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'navigate', page: page, params: params }, '*');
  } else {
    const base = page === 'journey' ? '../index.html' : '../' + page + '/index.html';
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    window.location.href = base + qs;
  }
}

// Create dropdown (click-based instead of hover)
function toggleCreateDropdown(e) {
  e.stopPropagation();
  const menu = document.getElementById('create-dropdown-menu');
  menu.classList.toggle('open');
}

function createAction(type) {
  const menu = document.getElementById('create-dropdown-menu');
  menu.classList.remove('open');
  if (type === 'funnel') {
    createFunnelFromSession();
  } else {
    const labels = { page: 'Page', action: 'Action', attribute: 'Attribute', validator: 'Validator' };
    showToast((labels[type] || type) + ' — 即将上线');
  }
}

// Close dropdown on outside click
document.addEventListener('click', (e) => {
  const dd = document.getElementById('create-dropdown');
  const menu = document.getElementById('create-dropdown-menu');
  if (dd && menu && !dd.contains(e.target)) {
    menu.classList.remove('open');
  }
});

// ==================== Keyboard Shortcuts ====================
document.addEventListener('keydown', (e) => {
  if (currentView === 'replay') {
    if (e.key === 'Escape') {
      if (inlineStudioOpen) {
        toggleFunnelStudio();
      } else {
        backToList();
      }
    }
  }
});

// CSS shake animation injection
const style = document.createElement('style');
style.textContent = `@keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }`;
document.head.appendChild(style);

// ==================== Sorting ====================
let sortField = 'start_time';
let sortDir = 'desc';

document.querySelectorAll('.sortable').forEach(th => {
  th.addEventListener('click', () => {
    const field = th.dataset.sort;
    if (sortField === field) {
      sortDir = sortDir === 'desc' ? 'asc' : 'desc';
    } else {
      sortField = field;
      sortDir = 'desc';
    }
    // Update sort icon UI
    document.querySelectorAll('.sortable .sort-icon').forEach(icon => icon.textContent = '');
    let icon = th.querySelector('.sort-icon');
    if (!icon) {
      icon = document.createElement('span');
      icon.className = 'sort-icon';
      th.appendChild(icon);
    }
    icon.textContent = sortDir === 'desc' ? '↓' : '↑';

    // Sort the sessions
    sessionListData.sessions.sort((a, b) => {
      let va, vb;
      if (field === 'perf_lcp') {
        va = (a.perf && a.perf.lcp) || 0;
        vb = (b.perf && b.perf.lcp) || 0;
      } else if (field === 'perf_inp') {
        va = (a.perf && a.perf.inp) || 0;
        vb = (b.perf && b.perf.inp) || 0;
      } else {
        va = a[field]; vb = b[field];
      }
      if (typeof va === 'string') {
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortDir === 'asc' ? va - vb : vb - va;
    });
    renderSessionTable();
  });
});

// ==================== Select All ====================
document.getElementById('select-all').addEventListener('change', function() {
  const checkboxes = document.querySelectorAll('#session-tbody input[type="checkbox"]');
  checkboxes.forEach(cb => cb.checked = this.checked);
  updateBatchToolbar();
});

// ==================== Pagination ====================
let currentPage = 1;
const totalPages = 3975;

function updatePagination() {
  const controls = document.querySelector('.pagination-controls');
  let pages = [];
  if (currentPage > 1) pages.push({ text: '«', page: currentPage - 1 });
  else pages.push({ text: '«', page: 0, disabled: true });

  // Show pages around current
  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages, currentPage + 1);
  if (start > 1) { pages.push({ text: '1', page: 1 }); if (start > 2) pages.push({ text: '...', dots: true }); }
  for (let i = start; i <= end; i++) pages.push({ text: String(i), page: i });
  if (end < totalPages) { if (end < totalPages - 1) pages.push({ text: '...', dots: true }); pages.push({ text: String(totalPages), page: totalPages }); }

  if (currentPage < totalPages) pages.push({ text: '»', page: currentPage + 1 });
  else pages.push({ text: '»', page: 0, disabled: true });

  controls.innerHTML = pages.map(p => {
    if (p.dots) return '<span class="page-dots">...</span>';
    const cls = ['page-btn'];
    if (p.page === currentPage) cls.push('active');
    const dis = p.disabled ? ' disabled' : '';
    return `<button class="${cls.join(' ')}"${dis} data-page="${p.page}">${p.text}</button>`;
  }).join('');

  controls.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pg = parseInt(btn.dataset.page);
      if (pg > 0 && pg !== currentPage) {
        currentPage = pg;
        updatePagination();
        showToast(`已切换到第 ${currentPage} 页`);
      }
    });
  });
}

updatePagination();

// ==================== Share / Tag ====================
document.getElementById('share-btn').addEventListener('click', () => {
  const sessionId = document.getElementById('replay-session-id').textContent;
  const url = window.location.origin + window.location.pathname + '?session=' + sessionId;
  showToast('分享链接已复制到剪贴板');
  if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
});

document.getElementById('tag-btn').addEventListener('click', () => {
  const sessionId = document.getElementById('replay-session-id').textContent;
  showToast(`会话 ${sessionId} 已标记`);
});

// ==================== Skip Forward / Backward ====================
document.getElementById('skip-back-btn').addEventListener('click', () => {
  const skipPct = (5 / replaySessionData.duration) * 100;
  updateProgress(Math.max(0, playProgress - skipPct));
});

document.getElementById('skip-fwd-btn').addEventListener('click', () => {
  const skipPct = (5 / replaySessionData.duration) * 100;
  updateProgress(Math.min(100, playProgress + skipPct));
});

// ==================== Fullscreen ====================
document.getElementById('fullscreen-btn').addEventListener('click', () => {
  const screen = document.getElementById('player-screen');
  if (!document.fullscreenElement) {
    screen.requestFullscreen().catch(() => showToast('全屏功能不可用'));
  } else {
    document.exitFullscreen();
  }
});

// ==================== Toast ====================
function showToast(message) {
  let toast = document.getElementById('tdem-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'tdem-toast';
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:var(--bg-3);border:1px solid var(--border-light);border-radius:var(--r-md);padding:10px 20px;font-size:0.82rem;color:var(--text-1);box-shadow:var(--shadow-lg);z-index:9999;opacity:0;transition:all 0.3s ease;pointer-events:none;display:flex;align-items:center;gap:8px;';
    document.body.appendChild(toast);
  }
  toast.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' + message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 2500);
}

// ==================== Init ====================
renderSessionTable();
updatePlatformUI();

// Handle incoming URL params (deep link from other pages)
(function handleDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session');
  const from = params.get('from');
  const scenario = params.get('scenario');
  const autoplay = params.get('autoplay');

  // Switch scenario if requested
  if (scenario === 'edu' || scenario === 'bank') {
    switchScenario(scenario);
  }

  // Show a "from" breadcrumb hint
  if (from) {
    const hint = document.createElement('div');
    hint.style.cssText = 'padding:6px 20px;background:var(--blue-dim);border-bottom:1px solid var(--blue);font-size:0.75rem;color:var(--blue);display:flex;align-items:center;gap:8px;cursor:pointer;';
    const fromLabel = from === 'journey' ? 'Customer Journey' : from === 'funnel-analysis' ? 'Funnel Analysis' : from;
    hint.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
      来自 <strong>${fromLabel}</strong> — 点击返回
    `;
    hint.addEventListener('click', () => navigateToPage(from === 'journey' ? 'journey' : from));
    const listView = document.getElementById('list-view');
    listView.insertBefore(hint, listView.firstChild);
  }

  // Auto open a specific session
  if (sessionId) {
    setTimeout(() => openReplay(sessionId), 100);
  }

  // Auto-start demo if requested (edu scenario only)
  if (autoplay === '1' && scenario === 'edu') {
    setTimeout(() => {
      if (typeof runAutoDemo === 'function') runAutoDemo();
    }, 1200);
  }
})();

// ==================== Auto Demo Orchestration ====================
// (demoState declared at top of file to avoid TDZ issues)

function sleep(ms) {
  return new Promise((resolve, reject) => {
    if (demoState.aborted) { reject(new Error('aborted')); return; }
    // If currently paused, queue immediately with full duration
    if (demoState.paused) {
      demoState.pausedSleeps.push({ resolve, reject, remaining: ms });
      return;
    }
    const startTime = Date.now();
    const t = setTimeout(() => {
      demoState.timeouts = demoState.timeouts.filter(x => x.id !== t);
      if (demoState.aborted) reject(new Error('aborted'));
      else resolve();
    }, ms);
    // Store with metadata so pause can compute remaining time
    demoState.timeouts.push({ id: t, resolve, reject, startTime, duration: ms });
  });
}

function pauseAutoDemo() {
  if (!demoState.running || demoState.paused) return;
  demoState.paused = true;
  // Freeze all pending timeouts — compute remaining ms and store for resume
  demoState.timeouts.forEach(entry => {
    clearTimeout(entry.id);
    const elapsed = Date.now() - entry.startTime;
    const remaining = Math.max(0, entry.duration - elapsed);
    demoState.pausedSleeps.push({ resolve: entry.resolve, reject: entry.reject, remaining });
  });
  demoState.timeouts = [];
}

function resumeAutoDemo() {
  if (!demoState.running || !demoState.paused) return;
  demoState.paused = false;
  // Re-schedule all paused sleeps with their remaining time
  const sleeps = demoState.pausedSleeps.splice(0);
  sleeps.forEach(({ resolve, reject, remaining }) => {
    const startTime = Date.now();
    const t = setTimeout(() => {
      demoState.timeouts = demoState.timeouts.filter(x => x.id !== t);
      if (demoState.aborted) reject(new Error('aborted'));
      else resolve();
    }, remaining);
    demoState.timeouts.push({ id: t, resolve, reject, startTime, duration: remaining });
  });
}

function showDemoTooltip(targetSel, text, opts = {}) {
  const tooltip = document.getElementById('demo-tooltip');
  const stepEl = document.getElementById('demo-tooltip-step');
  const textEl = document.getElementById('demo-tooltip-text');
  if (!tooltip || !textEl) return;

  textEl.innerHTML = text;
  stepEl.textContent = `第 ${demoState.currentStep} / ${demoState.totalSteps} 步`;

  // Clear previous arrow classes
  tooltip.classList.remove('arrow-up', 'arrow-down', 'arrow-left', 'arrow-right');

  // Clear previous highlights
  document.querySelectorAll('.demo-highlight').forEach(el => el.classList.remove('demo-highlight'));

  // Find target
  let target = null;
  if (targetSel) {
    if (typeof targetSel === 'string') {
      target = document.querySelector(targetSel);
    } else {
      target = targetSel;
    }
  }

  if (target) {
    target.classList.add('demo-highlight');
    // Position tooltip near target
    const rect = target.getBoundingClientRect();
    const ttWidth = 340;
    const ttHeight = 120;
    const placement = opts.placement || 'bottom';
    let top, left;
    if (placement === 'bottom') {
      top = rect.bottom + 14;
      left = rect.left + rect.width / 2 - ttWidth / 2;
      tooltip.classList.add('arrow-up');
    } else if (placement === 'top') {
      top = rect.top - ttHeight - 14;
      left = rect.left + rect.width / 2 - ttWidth / 2;
      tooltip.classList.add('arrow-down');
    } else if (placement === 'right') {
      top = rect.top + rect.height / 2 - ttHeight / 2;
      left = rect.right + 14;
      tooltip.classList.add('arrow-left');
    } else if (placement === 'left') {
      top = rect.top + rect.height / 2 - ttHeight / 2;
      left = rect.left - ttWidth - 14;
      tooltip.classList.add('arrow-right');
    }
    // Clamp into viewport
    top = Math.max(12, Math.min(window.innerHeight - ttHeight - 12, top));
    left = Math.max(12, Math.min(window.innerWidth - ttWidth - 12, left));
    tooltip.style.transform = 'none';
    tooltip.style.top = top + 'px';
    tooltip.style.left = left + 'px';
  } else {
    // Center fallback
    tooltip.style.top = '50%';
    tooltip.style.left = '50%';
    tooltip.style.transform = 'translate(-50%, -50%)';
  }

  tooltip.classList.add('active');
}

function hideDemoTooltip() {
  const tooltip = document.getElementById('demo-tooltip');
  if (tooltip) tooltip.classList.remove('active');
  document.querySelectorAll('.demo-highlight').forEach(el => el.classList.remove('demo-highlight'));
}

function updateDemoBadge(pct) {
  const badge = document.getElementById('demo-badge');
  const prog = document.getElementById('demo-badge-progress');
  if (badge) badge.style.display = demoState.running ? 'flex' : 'none';
  if (prog) prog.textContent = Math.round(pct) + '%';
}

async function runAutoDemo() {
  if (demoState.running) return;
  // Ensure we are in edu scenario
  if (window.currentScenario !== 'edu') switchScenario('edu');
  // Back to list
  if (currentView === 'replay') backToList();

  demoState = { running: true, paused: false, aborted: false, currentStep: 0, totalSteps: 9, timeouts: [], pausedSleeps: [] };
  document.getElementById('demo-mask').classList.add('active');
  updateDemoBadge(0);

  const btn = document.getElementById('btn-auto-demo');
  if (btn) btn.disabled = true;

  try {
    // Step 1 — 0s~5s — 列表页：高亮首条"选课失败"会话
    demoState.currentStep = 1;
    await sleep(400);
    const firstRow = document.querySelector('#session-tbody tr');
    showDemoTooltip(firstRow,
      `<strong>发现异常会话</strong><br>首条会话挣扎分 <span class="hl-red">0.85 (Poor)</span>，用户 stu_2023*** 在春季选课开放瞬间尝试选《人工智能导论》——点击这条会话进入回放。`,
      { placement: 'bottom' });
    updateDemoBadge(5);
    await sleep(4500);

    // Step 2 — 5s~8s — 自动进入回放
    demoState.currentStep = 2;
    hideDemoTooltip();
    await sleep(300);
    openReplay('sess_edu001');
    updateDemoBadge(12);
    await sleep(800);
    const player = document.getElementById('player-screen');
    showDemoTooltip(player,
      `<strong>进入会话回放</strong><br>所见即所得地看到用户在选课页面的真实操作——右侧是用户的实际画面，左侧是所有行为事件流。`,
      { placement: 'left' });
    await sleep(2500);

    // Step 3 — 8s~15s — 播放到 Rage Click（20s 处）
    demoState.currentStep = 3;
    hideDemoTooltip();
    await sleep(200);
    jumpToTime(20000);
    // Highlight rage click event in list
    const rageEvent = Array.from(document.querySelectorAll('.event-item'))
      .find(el => el.textContent.includes('Rage Click') && el.textContent.includes('6 次'));
    if (rageEvent) rageEvent.scrollIntoView({ behavior: 'smooth', block: 'center' });
    updateDemoBadge(25);
    await sleep(600);
    showDemoTooltip(rageEvent,
      `<strong><span class="hl-red">Rage Click 愤怒点击</span></strong><br>用户在"加入选课"按钮上 1.5 秒内疯狂点了 <strong>6 次</strong>——系统自动识别为挣扎事件，右侧按钮出现红色抖动反馈。`,
      { placement: 'right' });
    await sleep(5500);

    // Step 4 — 15s~22s — 切到错误 Tab
    demoState.currentStep = 4;
    hideDemoTooltip();
    await sleep(300);
    const errTab = document.querySelector('.event-chip[data-cat="technical"]');
    if (errTab) {
      errTab.click();
    }
    updateDemoBadge(40);
    await sleep(500);
    showDemoTooltip(errTab,
      `<strong>切到"错误"视图</strong><br>这次选课触发了 <span class="hl-red">3 次 API 500</span>、<span class="hl-red">1 次 JS Error</span>、<span class="hl-red">1 次资源加载失败</span>、<span class="hl-red">1 次 Console Error</span>——全部有调用栈和请求详情。`,
      { placement: 'right' });
    await sleep(5500);

    // Step 5 — 22s~25s — 切到性能面板
    demoState.currentStep = 5;
    hideDemoTooltip();
    await sleep(300);
    const perfTab = document.querySelector('.panel-tab[data-panel="perf"]');
    if (perfTab) switchPanelTab(perfTab);
    updateDemoBadge(52);
    await sleep(600);

    // Step 6 — 25s~30s — 高亮 LCP 卡片
    demoState.currentStep = 6;
    const lcpCard = Array.from(document.querySelectorAll('.perf-vital-card'))
      .find(el => el.textContent.includes('LCP'));
    showDemoTooltip(lcpCard,
      `<strong><span class="hl-red">LCP 5.2 秒！</span></strong><br>最大内容绘制耗时严重超标（阈值 2.5s），是这次选课失败的第一个性能元凶。INP 680ms、CLS 0.32 同样是 Poor 级别。`,
      { placement: 'bottom' });
    await sleep(5000);

    // Step 7 — 30s~38s — 滚动到慢资源
    demoState.currentStep = 7;
    hideDemoTooltip();
    await sleep(300);
    const perfPanel = document.getElementById('perf-panel');
    if (perfPanel) perfPanel.scrollTop = 260;
    const slowRes = Array.from(document.querySelectorAll('.perf-evt-item.res-slow'))[0];
    if (slowRes) slowRes.scrollIntoView({ behavior: 'smooth', block: 'center' });
    updateDemoBadge(66);
    await sleep(600);
    showDemoTooltip(slowRes,
      `<strong>LCP 慢的根因就在这里</strong><br>首屏加载了 <span class="hl-red">hero-banner.jpg (1.8MB)</span> 和 <span class="hl-red">12 张课表缩略图</span>，累计阻塞 11.8s；其中 courseSelector.js 还卡住主线程。`,
      { placement: 'right' });
    await sleep(6000);

    // Step 8 — 38s~45s — 点击资源跳转到对应时刻
    demoState.currentStep = 8;
    hideDemoTooltip();
    await sleep(300);
    // Jump player to the slow API moment (28s)
    jumpToTime(28000);
    updateDemoBadge(80);
    await sleep(600);
    showDemoTooltip(document.getElementById('player-screen'),
      `<strong>点击性能指标 → 看到真实操作</strong><br>跳到选课接口超时的瞬间，用户正在点"加入选课"，但 <span class="hl-red">POST /api/course/select 响应 8.2s 后 500</span>——性能指标与用户行为完全对应。`,
      { placement: 'left' });
    await sleep(6000);

    // Step 9 — 45s~50s — AI 归因
    demoState.currentStep = 9;
    hideDemoTooltip();
    await sleep(300);
    // Expand AI panel if collapsed
    const aiPanel = document.getElementById('ai-panel');
    if (aiPanel && aiPanel.classList.contains('collapsed')) {
      aiPanel.classList.remove('collapsed');
    }
    // Switch to Performance tab
    const perfAITab = document.querySelector('.ai-tab[data-tab="performance"]');
    if (perfAITab) perfAITab.click();
    updateDemoBadge(92);
    await sleep(600);
    showDemoTooltip(aiPanel,
      `<strong>AI 自动归因 + 修复建议</strong><br><span class="hl-purple">93% 的挣扎事件发生在 Slow API / Long Task 期间</span>。AI 给出 3 条高优修复建议：压缩 hero-banner、课表图懒加载、选课 API 引入限流排队。`,
      { placement: 'top' });
    await sleep(5500);

    updateDemoBadge(100);
    // End
    hideDemoTooltip();
    await sleep(300);
  } catch (e) {
    // aborted
  } finally {
    cleanupDemo();
  }
}

function cancelAutoDemo() {
  if (!demoState.running) return;
  demoState.aborted = true;
  demoState.timeouts.forEach(entry => clearTimeout(entry.id));
  // Reject any paused sleeps so the async chain terminates
  demoState.pausedSleeps.forEach(entry => entry.reject(new Error('aborted')));
  demoState.pausedSleeps = [];
  cleanupDemo();
}

function cleanupDemo() {
  demoState.running = false;
  demoState.paused = false;
  demoState.timeouts = [];
  demoState.pausedSleeps = [];
  hideDemoTooltip();
  const mask = document.getElementById('demo-mask');
  if (mask) mask.classList.remove('active');
  const badge = document.getElementById('demo-badge');
  if (badge) badge.style.display = 'none';
  const btn = document.getElementById('btn-auto-demo');
  if (btn) btn.disabled = false;
  document.querySelectorAll('.demo-highlight').forEach(el => el.classList.remove('demo-highlight'));
}

// ESC to cancel demo
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && demoState.running) {
    cancelAutoDemo();
  }
});

// Listen for parent postMessage commands (when embedded in PPT iframe)
window.addEventListener('message', (e) => {
  if (!e.data || typeof e.data !== 'object') return;
  const { type } = e.data;
  if (type === 'toggleDemo') {
    if (demoState.running && !demoState.paused) {
      // Pause
      pauseAutoDemo();
      window.parent.postMessage({ type: 'demoStateChange', running: false }, '*');
    } else if (demoState.running && demoState.paused) {
      // Resume
      resumeAutoDemo();
      window.parent.postMessage({ type: 'demoStateChange', running: true }, '*');
    } else {
      // Not running — start fresh
      runAutoDemo();
      window.parent.postMessage({ type: 'demoStateChange', running: true }, '*');
    }
  } else if (type === 'reloadDemo') {
    cancelAutoDemo();
    if (currentView === 'replay') backToList();
    playProgress = 0;
    setTimeout(() => {
      runAutoDemo();
      window.parent.postMessage({ type: 'demoStateChange', running: true }, '*');
    }, 300);
  } else if (type === 'queryDemoState') {
    window.parent.postMessage({ type: 'demoStateChange', running: demoState.running && !demoState.paused }, '*');
  }
});

// Notify parent when demo ends naturally
const _origCleanupDemo = cleanupDemo;
cleanupDemo = function() {
  _origCleanupDemo();
  window.parent.postMessage({ type: 'demoStateChange', running: false }, '*');
};

// Apply initial scenario from window.currentScenario (set by handleDeepLink)
if (window.currentScenario === 'edu') {
  const btn = document.getElementById('btn-auto-demo');
  if (btn) btn.style.display = 'inline-flex';
  document.querySelectorAll('.scenario-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.scenario === 'edu');
  });
}

