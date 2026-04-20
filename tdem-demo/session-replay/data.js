// ==================== SESSION REPLAY MOCK DATA ====================
// 双场景：bank（银行业务 - GlassBank）/ edu（在线选课 - 星辰大学）

// ============ 银行业务场景（原始场景） ============
const sessionListDataBank = {
  total: 79500,
  page: 1,
  page_size: 20,
  sessions: [
    { session_id: "sess_abc123", start_time: "2026-03-09 14:32", duration: 85, struggle_score: 0.73, struggle_rank: "Poor", user_id: "****", browser: "Chrome 88", device_type: "Desktop", os: "Windows 10", country: "US", state: "Virginia", city: "Leesburg", page_count: 4, error_count: 3, has_struggle: true, perf: { lcp: 3200, inp: 380, cls: 0.18, fcp: 1800, ttfb: 420, long_tasks: 5 } },
    { session_id: "sess_def456", start_time: "2026-03-09 14:28", duration: 192, struggle_score: 0.12, struggle_rank: "Excellent", user_id: "user_01", browser: "Safari 17", device_type: "Desktop", os: "macOS", country: "US", state: "California", city: "San Jose", page_count: 8, error_count: 0, has_struggle: false, perf: { lcp: 1200, inp: 85, cls: 0.02, fcp: 600, ttfb: 150, long_tasks: 0 } },
    { session_id: "sess_ghi789", start_time: "2026-03-09 14:15", duration: 45, struggle_score: 0.65, struggle_rank: "Poor", user_id: "****", browser: "Firefox 121", device_type: "Desktop", os: "Linux", country: "DE", state: "Bavaria", city: "Munich", page_count: 2, error_count: 5, has_struggle: true, perf: { lcp: 4100, inp: 520, cls: 0.25, fcp: 2400, ttfb: 680, long_tasks: 8 } },
    { session_id: "sess_jkl012", start_time: "2026-03-09 13:58", duration: 320, struggle_score: 0.28, struggle_rank: "Good", user_id: "user_15", browser: "Chrome 88", device_type: "Desktop", os: "Windows 10", country: "UK", state: "London", city: "London", page_count: 12, error_count: 1, has_struggle: true, perf: { lcp: 1800, inp: 150, cls: 0.05, fcp: 900, ttfb: 220, long_tasks: 1 } },
    { session_id: "sess_mno345", start_time: "2026-03-09 13:45", duration: 156, struggle_score: 0.41, struggle_rank: "Fair", user_id: "****", browser: "Edge 120", device_type: "Desktop", os: "Windows 11", country: "CA", state: "Ontario", city: "Toronto", page_count: 6, error_count: 2, has_struggle: true, perf: { lcp: 2800, inp: 280, cls: 0.12, fcp: 1500, ttfb: 350, long_tasks: 3 } },
    { session_id: "sess_pqr678", start_time: "2026-03-09 13:32", duration: 240, struggle_score: 0.05, struggle_rank: "Excellent", user_id: "user_28", browser: "Chrome 88", device_type: "Desktop", os: "macOS", country: "US", state: "New York", city: "New York", page_count: 10, error_count: 0, has_struggle: false, perf: { lcp: 950, inp: 60, cls: 0.01, fcp: 450, ttfb: 120, long_tasks: 0 } },
    { session_id: "sess_stu901", start_time: "2026-03-09 13:20", duration: 78, struggle_score: 0.58, struggle_rank: "Fair", user_id: "****", browser: "Safari 17", device_type: "Desktop", os: "macOS", country: "PH", state: "Metro Manila", city: "Manila", page_count: 3, error_count: 4, has_struggle: true, perf: { lcp: 3500, inp: 420, cls: 0.15, fcp: 2100, ttfb: 580, long_tasks: 6 } },
    { session_id: "sess_vwx234", start_time: "2026-03-09 13:05", duration: 410, struggle_score: 0.09, struggle_rank: "Excellent", user_id: "user_42", browser: "Chrome 88", device_type: "Desktop", os: "Windows 10", country: "US", state: "Texas", city: "Houston", page_count: 15, error_count: 0, has_struggle: false, perf: { lcp: 1100, inp: 70, cls: 0.02, fcp: 520, ttfb: 130, long_tasks: 0 } },
    { session_id: "sess_yza567", start_time: "2026-03-09 12:55", duration: 62, struggle_score: 0.82, struggle_rank: "Poor", user_id: "****", browser: "Firefox 121", device_type: "Desktop", os: "Linux", country: "KZ", state: "Almaty", city: "Almaty", page_count: 2, error_count: 6, has_struggle: true, perf: { lcp: 5200, inp: 650, cls: 0.32, fcp: 3100, ttfb: 920, long_tasks: 12 } },
    { session_id: "sess_bcd890", start_time: "2026-03-09 12:42", duration: 185, struggle_score: 0.33, struggle_rank: "Good", user_id: "user_56", browser: "Chrome 88", device_type: "Desktop", os: "Windows 10", country: "US", state: "Illinois", city: "Chicago", page_count: 7, error_count: 1, has_struggle: true, perf: { lcp: 2000, inp: 180, cls: 0.06, fcp: 1000, ttfb: 250, long_tasks: 2 } },
    { session_id: "sess_efg123", start_time: "2026-03-09 12:30", duration: 95, struggle_score: 0.47, struggle_rank: "Fair", user_id: "****", browser: "Safari 17", device_type: "Desktop", os: "macOS", country: "AU", state: "NSW", city: "Sydney", page_count: 4, error_count: 2, has_struggle: true, perf: { lcp: 2600, inp: 310, cls: 0.09, fcp: 1400, ttfb: 380, long_tasks: 4 } },
    { session_id: "sess_hij456", start_time: "2026-03-09 12:18", duration: 275, struggle_score: 0.15, struggle_rank: "Good", user_id: "user_73", browser: "Chrome 88", device_type: "Desktop", os: "Windows 10", country: "US", state: "Florida", city: "Miami", page_count: 9, error_count: 0, has_struggle: false, perf: { lcp: 1500, inp: 120, cls: 0.03, fcp: 750, ttfb: 180, long_tasks: 1 } }
  ]
};

const replaySessionDataBank = {
  session_id: "sess_abc123",
  duration: 85,
  struggle_score: 0.73,
  struggle_rank: "Poor",
  user_id: "****",
  browser: "Chrome 88",
  device_type: "Desktop",
  os: "Windows 10",
  country: "US",
  events: [
    { event_id: "evt_001", timestamp: 0, event_type: "page_view", label: "Page View", detail: "Home /", page_url: "/", is_struggle: false, icon: "📄", category: "behavior" },
    { event_id: "evt_002", timestamp: 3000, event_type: "click", label: "Click", detail: 'Click on A.nav-register "Register"', page_url: "/", is_struggle: false, icon: "👆", category: "behavior" },
    { event_id: "evt_003", timestamp: 5000, event_type: "scroll", label: "Scroll", detail: "Scroll down 320px", page_url: "/", is_struggle: false, icon: "↕️", category: "behavior" },
    { event_id: "evt_004", timestamp: 11000, event_type: "page_view", label: "Page Navigation", detail: "Register /user/register", page_url: "/user/register", is_struggle: false, icon: "🔄", category: "behavior" },
    { event_id: "evt_005", timestamp: 15000, event_type: "click", label: "Click", detail: 'Click on INPUT#email', page_url: "/user/register", is_struggle: false, icon: "👆", category: "behavior" },
    { event_id: "evt_006", timestamp: 18000, event_type: "input", label: "Input", detail: 'Type in INPUT#email: "j***@gmail.com"', page_url: "/user/register", is_struggle: false, icon: "⌨️", category: "behavior" },
    { event_id: "evt_007", timestamp: 22000, event_type: "click", label: "Click", detail: 'Click on INPUT#password', page_url: "/user/register", is_struggle: false, icon: "👆", category: "behavior" },
    { event_id: "evt_008", timestamp: 25000, event_type: "input", label: "Input", detail: 'Type in INPUT#password: "****"', page_url: "/user/register", is_struggle: false, icon: "⌨️", category: "behavior" },
    { event_id: "evt_009", timestamp: 30000, event_type: "validation_error", label: "Validation Error", detail: "Password too weak", page_url: "/user/register", is_struggle: true, icon: "⚠️", category: "technical" },
    { event_id: "evt_010", timestamp: 33000, event_type: "rage_click", label: "Rage Click", detail: 'Rage Click on BUTTON#submit (5 clicks in 1.2s)', page_url: "/user/register", is_struggle: true, icon: "🔴", category: "struggle" },
    { event_id: "evt_011", timestamp: 38000, event_type: "input", label: "Input", detail: 'Re-type in INPUT#password: "****"', page_url: "/user/register", is_struggle: false, icon: "⌨️", category: "behavior" },
    { event_id: "evt_012", timestamp: 42000, event_type: "dead_click", label: "Dead Click", detail: 'Dead Click on BUTTON#submit (no response)', page_url: "/user/register", is_struggle: true, icon: "⚪", category: "struggle" },
    { event_id: "evt_013", timestamp: 48000, event_type: "form_zigzag", label: "Form Zig-Zag", detail: 'Zig-zag between #email and #password (3 times)', page_url: "/user/register", is_struggle: true, icon: "🔀", category: "struggle" },
    { event_id: "evt_013b", timestamp: 50000, event_type: "thrash_cursor", label: "Thrash Cursor", detail: 'Erratic mouse movement around #submit button area (1.8s)', page_url: "/user/register", is_struggle: true, icon: "🖱️", category: "struggle" },
    { event_id: "evt_013c", timestamp: 52000, event_type: "long_hesitation", label: "Long Hesitation", detail: 'User paused for 8.2s before #terms-checkbox', page_url: "/user/register", is_struggle: true, icon: "⏸️", category: "struggle" },
    { event_id: "evt_014", timestamp: 55000, event_type: "js_error", label: "JS Error", detail: 'TypeError: Cannot read property "validate" of undefined', page_url: "/user/register", is_struggle: false, icon: "🐛", category: "technical" },
    { event_id: "evt_014b", timestamp: 56500, event_type: "slow_click", label: "Slow Click", detail: 'Click on BUTTON#submit → Response time 3.2s (threshold: 1s)', page_url: "/user/register", is_struggle: true, icon: "⏳", category: "struggle" },
    { event_id: "evt_015", timestamp: 60000, event_type: "click", label: "Click", detail: 'Click on BUTTON#submit', page_url: "/user/register", is_struggle: false, icon: "👆", category: "behavior" },
    { event_id: "evt_015b", timestamp: 62000, event_type: "excessive_scroll", label: "Excessive Scroll", detail: 'Rapid scrolling up/down 5 times in 2.5s on /user/register', page_url: "/user/register", is_struggle: true, icon: "📜", category: "struggle" },
    { event_id: "evt_016", timestamp: 65000, event_type: "api_error", label: "API Error", detail: "POST /api/register → 500 Internal Server Error", page_url: "/user/register", is_struggle: false, icon: "🌐", category: "technical" },
    { event_id: "evt_016b", timestamp: 66500, event_type: "console_error", label: "Console Error", detail: 'Uncaught SyntaxError in analytics.min.js:42', page_url: "/user/register", is_struggle: false, icon: "⚠️", category: "technical" },
    { event_id: "evt_016c", timestamp: 67500, event_type: "resource_error", label: "Resource Error", detail: 'Failed to load: https://fonts.googleapis.com/css2?family=Inter', page_url: "/user/register", is_struggle: false, icon: "🔗", category: "technical" },
    { event_id: "evt_017", timestamp: 70000, event_type: "rage_click", label: "Rage Click", detail: 'Rage Click on BUTTON#submit (8 clicks in 2s)', page_url: "/user/register", is_struggle: true, icon: "🔴", category: "struggle" },
    { event_id: "evt_018", timestamp: 80000, event_type: "click", label: "Click", detail: 'Click on A.back-link "← Back"', page_url: "/user/register", is_struggle: false, icon: "👆", category: "behavior" },
    { event_id: "evt_019", timestamp: 85000, event_type: "page_view", label: "Session End", detail: "Session ended on Home /", page_url: "/", is_struggle: false, icon: "🏁", category: "behavior" }
  ],
  pages: [
    { page_url: "/", page_name: "Home", enter_time: 0, leave_time: 11000, duration: 11000, struggle_count: 0, error_count: 0 },
    { page_url: "/user/register", page_name: "Register", enter_time: 11000, leave_time: 80000, duration: 69000, struggle_count: 5, error_count: 2 },
    { page_url: "/", page_name: "Home", enter_time: 80000, leave_time: 85000, duration: 5000, struggle_count: 0, error_count: 0 }
  ],
  perf: {
    lcp: 3200, inp: 380, cls: 0.18, fcp: 1800, ttfb: 420, long_tasks: 5,
    waterfall: [
      { metric: 'TTFB', start: 0, end: 420, value: '420ms', status: 'good', color: 'var(--teal)' },
      { metric: 'FCP', start: 420, end: 1800, value: '1.8s', status: 'fair', color: 'var(--orange)' },
      { metric: 'LCP', start: 420, end: 3200, value: '3.2s', status: 'poor', color: 'var(--red)' },
      { metric: 'DOM Ready', start: 0, end: 2100, value: '2.1s', status: 'fair', color: 'var(--yellow)' },
      { metric: 'Page Load', start: 0, end: 3800, value: '3.8s', status: 'poor', color: 'var(--red)' },
    ],
    perf_events: [
      { timestamp: 420, type: 'ttfb', label: 'TTFB', detail: 'First byte received: 420ms', icon: '🌐' },
      { timestamp: 1800, type: 'fcp', label: 'FCP', detail: 'First Contentful Paint: 1.8s', icon: '🎨' },
      { timestamp: 3200, type: 'lcp', label: 'LCP', detail: 'Largest Contentful Paint: 3.2s (hero image)', icon: '🖼️' },
      { timestamp: 14000, type: 'long_task', label: 'Long Task', detail: 'Long task 120ms in formValidator.js', icon: '⏱️' },
      { timestamp: 28000, type: 'long_task', label: 'Long Task', detail: 'Long task 85ms in analytics.bundle.js', icon: '⏱️' },
      { timestamp: 33000, type: 'inp', label: 'INP', detail: 'Interaction to Next Paint: 380ms (click #submit)', icon: '👆' },
      { timestamp: 42000, type: 'layout_shift', label: 'Layout Shift', detail: 'CLS +0.12 — ad banner loaded above fold', icon: '📐' },
      { timestamp: 55000, type: 'long_task', label: 'Long Task', detail: 'Long task 200ms in validation pipeline', icon: '⏱️' },
      { timestamp: 60000, type: 'slow_api', label: 'Slow API', detail: 'POST /api/register — 4.2s response', icon: '🐢' },
      { timestamp: 65000, type: 'long_task', label: 'Long Task', detail: 'Long task 95ms in error handler', icon: '⏱️' },
      { timestamp: 72000, type: 'layout_shift', label: 'Layout Shift', detail: 'CLS +0.06 — error toast pushes content', icon: '📐' },
    ],
    resources: [
      { name: 'hero-image.webp', type: 'Image', size: '245 KB', duration: 1200, status: 'slow' },
      { name: 'app.bundle.js', type: 'Script', size: '380 KB', duration: 800, status: 'ok' },
      { name: 'analytics.min.js', type: 'Script', size: '92 KB', duration: 450, status: 'ok' },
      { name: 'formValidator.js', type: 'Script', size: '45 KB', duration: 320, status: 'ok' },
      { name: 'styles.css', type: 'Stylesheet', size: '28 KB', duration: 180, status: 'ok' },
      { name: 'Inter-font.woff2', type: 'Font', size: '65 KB', duration: 0, status: 'failed' },
    ]
  },
  ai_insights: {
    summary: "The user aimed to create an account on the GlassBank website. They failed to achieve that goal due to multiple struggles encountered with the registration form. The user experienced validation errors, rage clicks on the submit button, thrash cursor behavior, form zig-zag, long hesitation, excessive scrolling, and a server-side error (500) that prevented registration completion. Struggle Score: 0.73 (Poor).",
    key_takeaways: [
      "Improve the responsiveness of the Register page submit button — multiple rage clicks and slow click detected (3.2s response)",
      "Address form validation UX to avoid form zig-zag between email and password fields (3 occurrences)",
      "Fix server-side registration API returning 500 errors",
      "Consider adding real-time password strength indicator to reduce validation errors",
      "Investigate long hesitation (8.2s) before terms checkbox — unclear copy or privacy concerns?",
      "Address thrash cursor behavior around submit button — indicates user confusion"
    ],
    technical_insights: [
      "2 validation errors on password field (password strength requirement unclear)",
      "1 JS TypeError in form validation logic (undefined property access)",
      "1 API 500 error on POST /api/register endpoint",
      "1 Console SyntaxError in analytics.min.js:42",
      "1 Resource load failure: Google Fonts CDN"
    ],
    behavioral_insights: [
      "User exhibited form zig-zag pattern between email and password (3 occurrences)",
      "Multiple rage clicks detected on submit button (13 total clicks, 2 clusters)",
      "1 dead click on submit button indicating unresponsive UI",
      "Thrash cursor detected — erratic mouse movement for 1.8s around submit area",
      "Long hesitation (8.2s) before terms checkbox, suggesting confusion",
      "Excessive scrolling (5 rapid up/down in 2.5s) indicating frustration",
      "Slow click response (3.2s) exceeding 1s threshold",
      "Session ended with user abandoning registration and returning to Home"
    ],
    performance_insights: [
      "🔴 LCP 3.2s (Poor) — hero image hero-image.webp (245KB) is the largest element; consider lazy loading or WebP optimization",
      "🔴 INP 380ms (Poor) — worst interaction: click on #submit button; long task (200ms) in validation pipeline blocks main thread",
      "🟡 CLS 0.18 (Needs Improvement) — 2 layout shifts: ad banner injection (+0.12) and error toast (+0.06); reserve space with CSS aspect-ratio",
      "⚡ 5 Long Tasks detected, 3 during form interaction — formValidator.js and analytics.bundle.js are blocking; consider code splitting",
      "🐢 POST /api/register takes 4.2s — server response time is 10× expected; correlates with user's rage click cluster at 00:33",
      "🔗 Performance × Behavior correlation: 82% of struggle events (rage click, dead click, thrash cursor) occurred during or after long task periods",
      "📊 This session's LCP is 78% slower than P75 average (1.8s), suggesting device/network degradation or unoptimized initial payload"
    ]
  }
};

// ============ 在线选课场景（新增场景） ============
// 星辰大学教务系统 star-edu-web | 春季选修课开放时间 2026-03-15 18:00
// 剧本：大三本科生抢《人工智能导论》热门课，因页面慢+资源多+接口超时失败
const sessionListDataEdu = {
  total: 12800,
  page: 1,
  page_size: 20,
  sessions: [
    { session_id: "sess_edu001", start_time: "2026-03-15 18:00", duration: 120, struggle_score: 0.85, struggle_rank: "Poor", user_id: "stu_2023***", browser: "Chrome 120", device_type: "Desktop", os: "Windows 11", country: "CN", state: "北京", city: "海淀区", page_count: 4, error_count: 5, has_struggle: true, perf: { lcp: 5200, inp: 680, cls: 0.32, fcp: 2800, ttfb: 1200, long_tasks: 9 } },
    { session_id: "sess_edu002", start_time: "2026-03-15 18:00", duration: 95, struggle_score: 0.78, struggle_rank: "Poor", user_id: "stu_2023***", browser: "Safari 17", device_type: "Mobile", os: "iOS 17", country: "CN", state: "上海", city: "徐汇区", page_count: 3, error_count: 4, has_struggle: true, perf: { lcp: 4800, inp: 620, cls: 0.28, fcp: 2500, ttfb: 1050, long_tasks: 8 } },
    { session_id: "sess_edu003", start_time: "2026-03-15 18:01", duration: 58, struggle_score: 0.72, struggle_rank: "Poor", user_id: "stu_2022***", browser: "Chrome 120", device_type: "Desktop", os: "macOS", country: "CN", state: "广东", city: "深圳", page_count: 2, error_count: 3, has_struggle: true, perf: { lcp: 4500, inp: 550, cls: 0.24, fcp: 2300, ttfb: 980, long_tasks: 7 } },
    { session_id: "sess_edu004", start_time: "2026-03-15 18:00", duration: 180, struggle_score: 0.35, struggle_rank: "Fair", user_id: "stu_2023***", browser: "Edge 120", device_type: "Desktop", os: "Windows 10", country: "CN", state: "浙江", city: "杭州", page_count: 6, error_count: 1, has_struggle: true, perf: { lcp: 3200, inp: 280, cls: 0.12, fcp: 1600, ttfb: 520, long_tasks: 3 } },
    { session_id: "sess_edu005", start_time: "2026-03-15 18:02", duration: 220, struggle_score: 0.18, struggle_rank: "Good", user_id: "stu_2023***", browser: "Chrome 120", device_type: "Desktop", os: "Windows 11", country: "CN", state: "江苏", city: "南京", page_count: 8, error_count: 0, has_struggle: false, perf: { lcp: 1800, inp: 150, cls: 0.05, fcp: 900, ttfb: 280, long_tasks: 1 } },
    { session_id: "sess_edu006", start_time: "2026-03-15 18:03", duration: 65, struggle_score: 0.68, struggle_rank: "Poor", user_id: "stu_2022***", browser: "Firefox 121", device_type: "Desktop", os: "Windows 10", country: "CN", state: "四川", city: "成都", page_count: 2, error_count: 3, has_struggle: true, perf: { lcp: 4200, inp: 480, cls: 0.22, fcp: 2100, ttfb: 850, long_tasks: 6 } },
    { session_id: "sess_edu007", start_time: "2026-03-15 18:00", duration: 320, struggle_score: 0.08, struggle_rank: "Excellent", user_id: "stu_2024***", browser: "Chrome 120", device_type: "Desktop", os: "macOS", country: "CN", state: "北京", city: "朝阳区", page_count: 10, error_count: 0, has_struggle: false, perf: { lcp: 1200, inp: 95, cls: 0.02, fcp: 650, ttfb: 180, long_tasks: 0 } },
    { session_id: "sess_edu008", start_time: "2026-03-15 18:04", duration: 48, struggle_score: 0.75, struggle_rank: "Poor", user_id: "stu_2023***", browser: "Chrome 120", device_type: "Mobile", os: "Android 14", country: "CN", state: "湖北", city: "武汉", page_count: 2, error_count: 4, has_struggle: true, perf: { lcp: 5800, inp: 720, cls: 0.35, fcp: 3200, ttfb: 1350, long_tasks: 10 } },
    { session_id: "sess_edu009", start_time: "2026-03-15 18:05", duration: 150, struggle_score: 0.42, struggle_rank: "Fair", user_id: "stu_2022***", browser: "Safari 17", device_type: "Desktop", os: "macOS", country: "CN", state: "福建", city: "厦门", page_count: 5, error_count: 2, has_struggle: true, perf: { lcp: 2900, inp: 320, cls: 0.14, fcp: 1500, ttfb: 450, long_tasks: 4 } },
    { session_id: "sess_edu010", start_time: "2026-03-15 18:00", duration: 275, struggle_score: 0.15, struggle_rank: "Good", user_id: "stu_2024***", browser: "Chrome 120", device_type: "Desktop", os: "Windows 11", country: "CN", state: "广东", city: "广州", page_count: 9, error_count: 0, has_struggle: false, perf: { lcp: 1600, inp: 130, cls: 0.04, fcp: 820, ttfb: 220, long_tasks: 1 } },
    { session_id: "sess_edu011", start_time: "2026-03-15 18:06", duration: 92, struggle_score: 0.62, struggle_rank: "Poor", user_id: "stu_2023***", browser: "Chrome 120", device_type: "Desktop", os: "Windows 10", country: "CN", state: "山东", city: "济南", page_count: 3, error_count: 2, has_struggle: true, perf: { lcp: 3800, inp: 420, cls: 0.19, fcp: 1900, ttfb: 680, long_tasks: 5 } },
    { session_id: "sess_edu012", start_time: "2026-03-15 18:02", duration: 165, struggle_score: 0.25, struggle_rank: "Good", user_id: "stu_2023***", browser: "Edge 120", device_type: "Desktop", os: "Windows 11", country: "CN", state: "天津", city: "南开区", page_count: 6, error_count: 1, has_struggle: true, perf: { lcp: 2200, inp: 210, cls: 0.08, fcp: 1100, ttfb: 320, long_tasks: 2 } }
  ]
};

// 选课失败完整剧本 — 120s
const replaySessionDataEdu = {
  session_id: "sess_edu001",
  duration: 120,
  struggle_score: 0.85,
  struggle_rank: "Poor",
  user_id: "stu_2023***",
  browser: "Chrome 120",
  device_type: "Desktop",
  os: "Windows 11",
  country: "CN",
  events: [
    // 阶段 1：进入课程列表页，慢加载（0-12s）
    { event_id: "evt_edu_001", timestamp: 0, event_type: "page_view", label: "Page View", detail: "课程列表 /course-selection/elective", page_url: "/course-selection/elective", is_struggle: false, icon: "📄", category: "behavior" },
    { event_id: "evt_edu_002", timestamp: 8000, event_type: "excessive_scroll", label: "Excessive Scroll", detail: "快速上下滚动 4 次 (等待页面加载中)", page_url: "/course-selection/elective", is_struggle: true, icon: "📜", category: "struggle" },
    { event_id: "evt_edu_003", timestamp: 11000, event_type: "click", label: "Click", detail: '点击课程卡片 "人工智能导论 - CS2041"', page_url: "/course-selection/elective", is_struggle: false, icon: "👆", category: "behavior" },

    // 阶段 2：查看课程详情，点击加入选课（12-20s）
    { event_id: "evt_edu_004", timestamp: 12000, event_type: "page_view", label: "Page Navigation", detail: "课程详情 /course/CS2041", page_url: "/course/CS2041", is_struggle: false, icon: "🔄", category: "behavior" },
    { event_id: "evt_edu_005", timestamp: 15000, event_type: "click", label: "Click", detail: '点击 BUTTON#add-to-cart "加入选课"', page_url: "/course/CS2041", is_struggle: false, icon: "👆", category: "behavior" },

    // 阶段 3：接口无响应，Dead Click + Rage Click 高峰（18-30s）
    { event_id: "evt_edu_006", timestamp: 18500, event_type: "dead_click", label: "Dead Click", detail: '在 BUTTON#add-to-cart 再次点击（上一次点击无响应）', page_url: "/course/CS2041", is_struggle: true, icon: "⚪", category: "struggle" },
    { event_id: "evt_edu_007", timestamp: 20000, event_type: "rage_click", label: "Rage Click", detail: '在 BUTTON#add-to-cart 愤怒点击 (6 次 / 1.5s)', page_url: "/course/CS2041", is_struggle: true, icon: "🔴", category: "struggle" },
    { event_id: "evt_edu_008", timestamp: 24000, event_type: "js_error", label: "JS Error", detail: 'TypeError: Cannot read property "validate" of undefined (courseSelector.js:128)', page_url: "/course/CS2041", is_struggle: false, icon: "🐛", category: "technical" },
    { event_id: "evt_edu_009", timestamp: 28000, event_type: "api_error", label: "API Error", detail: 'POST /api/course/select → 500 Internal Server Error (响应 8.2s)', page_url: "/course/CS2041", is_struggle: false, icon: "🌐", category: "technical" },

    // 阶段 4：出现"系统繁忙"提示，用户困惑（30-45s）
    { event_id: "evt_edu_010", timestamp: 30000, event_type: "page_view", label: "Toast 显示", detail: '弹出"系统繁忙，请稍后重试"错误提示', page_url: "/course/CS2041", is_struggle: false, icon: "⚠️", category: "behavior" },
    { event_id: "evt_edu_011", timestamp: 33000, event_type: "thrash_cursor", label: "Thrash Cursor", detail: '光标在"加入选课"按钮区域来回乱晃 2.3s（困惑）', page_url: "/course/CS2041", is_struggle: true, icon: "🖱️", category: "struggle" },
    { event_id: "evt_edu_012", timestamp: 38000, event_type: "rage_click", label: "Rage Click", detail: '在 BUTTON#add-to-cart 再次愤怒点击 (8 次 / 2s)', page_url: "/course/CS2041", is_struggle: true, icon: "🔴", category: "struggle" },
    { event_id: "evt_edu_013", timestamp: 42000, event_type: "api_error", label: "API Error", detail: 'POST /api/course/select → 500 Internal Server Error (响应 9.1s)', page_url: "/course/CS2041", is_struggle: false, icon: "🌐", category: "technical" },

    // 阶段 5：长时间犹豫，考虑备选课（45-60s）
    { event_id: "evt_edu_014", timestamp: 45000, event_type: "long_hesitation", label: "Long Hesitation", detail: '用户停顿 10.2s（权衡是否切换到备选课）', page_url: "/course/CS2041", is_struggle: true, icon: "⏸️", category: "struggle" },
    { event_id: "evt_edu_015", timestamp: 58000, event_type: "click", label: "Click", detail: '点击"← 返回课程列表"', page_url: "/course/CS2041", is_struggle: false, icon: "👆", category: "behavior" },

    // 阶段 6：回到列表，尝试备选课《机器学习基础》（60-80s）
    { event_id: "evt_edu_016", timestamp: 60000, event_type: "page_view", label: "Page Navigation", detail: "课程列表 /course-selection/elective", page_url: "/course-selection/elective", is_struggle: false, icon: "🔄", category: "behavior" },
    { event_id: "evt_edu_017", timestamp: 63000, event_type: "form_zigzag", label: "Form Zig-Zag", detail: '在"人工智能导论"和"机器学习基础"两张卡片间来回 4 次', page_url: "/course-selection/elective", is_struggle: true, icon: "🔀", category: "struggle" },
    { event_id: "evt_edu_018", timestamp: 68000, event_type: "click", label: "Click", detail: '点击课程卡片 "机器学习基础 - CS3015"', page_url: "/course-selection/elective", is_struggle: false, icon: "👆", category: "behavior" },
    { event_id: "evt_edu_019", timestamp: 70000, event_type: "resource_error", label: "Resource Error", detail: '加载失败: /static/captcha/captcha.woff2 (Network Error)', page_url: "/course/CS3015", is_struggle: false, icon: "🔗", category: "technical" },
    { event_id: "evt_edu_020", timestamp: 73000, event_type: "click", label: "Click", detail: '点击 BUTTON#add-to-cart "加入选课"', page_url: "/course/CS3015", is_struggle: false, icon: "👆", category: "behavior" },

    // 阶段 7：再次失败（80-100s）
    { event_id: "evt_edu_021", timestamp: 78000, event_type: "slow_click", label: "Slow Click", detail: '"加入选课"按钮响应耗时 4.8s（阈值 1s）', page_url: "/course/CS3015", is_struggle: true, icon: "⏳", category: "struggle" },
    { event_id: "evt_edu_022", timestamp: 82000, event_type: "api_error", label: "API Error", detail: 'POST /api/course/select → 500 Internal Server Error (响应 10.5s)', page_url: "/course/CS3015", is_struggle: false, icon: "🌐", category: "technical" },
    { event_id: "evt_edu_023", timestamp: 86000, event_type: "rage_click", label: "Rage Click", detail: '在 BUTTON#add-to-cart 愤怒点击 (10 次 / 2.8s)', page_url: "/course/CS3015", is_struggle: true, icon: "🔴", category: "struggle" },
    { event_id: "evt_edu_024", timestamp: 92000, event_type: "console_error", label: "Console Error", detail: 'Uncaught (in promise) Error: Network timeout after 15000ms', page_url: "/course/CS3015", is_struggle: false, icon: "⚠️", category: "technical" },

    // 阶段 8：用户放弃（100-120s）
    { event_id: "evt_edu_025", timestamp: 100000, event_type: "long_hesitation", label: "Long Hesitation", detail: '用户停顿 12s 后（放弃选课）', page_url: "/course/CS3015", is_struggle: true, icon: "⏸️", category: "struggle" },
    { event_id: "evt_edu_026", timestamp: 115000, event_type: "click", label: "Click", detail: '点击关闭页面 / 导航到 /student/home', page_url: "/course/CS3015", is_struggle: false, icon: "👆", category: "behavior" },
    { event_id: "evt_edu_027", timestamp: 120000, event_type: "page_view", label: "Session End", detail: "会话结束于 /student/home（未完成选课）", page_url: "/student/home", is_struggle: false, icon: "🏁", category: "behavior" }
  ],
  pages: [
    { page_url: "/course-selection/elective", page_name: "课程列表", enter_time: 0, leave_time: 12000, duration: 12000, struggle_count: 1, error_count: 0 },
    { page_url: "/course/CS2041", page_name: "AI导论", enter_time: 12000, leave_time: 60000, duration: 48000, struggle_count: 5, error_count: 2 },
    { page_url: "/course-selection/elective", page_name: "课程列表", enter_time: 60000, leave_time: 68000, duration: 8000, struggle_count: 1, error_count: 0 },
    { page_url: "/course/CS3015", page_name: "ML基础", enter_time: 68000, leave_time: 115000, duration: 47000, struggle_count: 3, error_count: 3 },
    { page_url: "/student/home", page_name: "首页", enter_time: 115000, leave_time: 120000, duration: 5000, struggle_count: 0, error_count: 0 }
  ],
  perf: {
    lcp: 5200, inp: 680, cls: 0.32, fcp: 2800, ttfb: 1200, long_tasks: 9,
    waterfall: [
      { metric: 'TTFB', start: 0, end: 1200, value: '1.2s', status: 'poor', color: 'var(--red)' },
      { metric: 'FCP', start: 1200, end: 2800, value: '2.8s', status: 'fair', color: 'var(--orange)' },
      { metric: 'LCP', start: 1200, end: 5200, value: '5.2s', status: 'poor', color: 'var(--red)' },
      { metric: 'DOM Ready', start: 0, end: 3600, value: '3.6s', status: 'poor', color: 'var(--red)' },
      { metric: 'Page Load', start: 0, end: 6800, value: '6.8s', status: 'poor', color: 'var(--red)' },
    ],
    perf_events: [
      { timestamp: 1200, type: 'ttfb', label: 'TTFB', detail: '首字节到达 1.2s（远超阈值，服务器高峰期）', icon: '🌐' },
      { timestamp: 2800, type: 'fcp', label: 'FCP', detail: 'First Contentful Paint: 2.8s', icon: '🎨' },
      { timestamp: 5200, type: 'lcp', label: 'LCP', detail: 'LCP 5.2s — 最大元素: hero-banner.jpg (1.8MB 未压缩)', icon: '🖼️' },
      { timestamp: 6500, type: 'long_task', label: 'Long Task', detail: 'courseSelector.js 解析阻塞主线程 280ms', icon: '⏱️' },
      { timestamp: 8500, type: 'long_task', label: 'Long Task', detail: '12 张课表图并发加载导致主线程阻塞 220ms', icon: '⏱️' },
      { timestamp: 15000, type: 'inp', label: 'INP', detail: 'INP 680ms（点击"加入选课"响应 680ms）', icon: '👆' },
      { timestamp: 18000, type: 'long_task', label: 'Long Task', detail: 'React 组件重渲染阻塞 180ms', icon: '⏱️' },
      { timestamp: 22000, type: 'layout_shift', label: 'Layout Shift', detail: 'CLS +0.18 — 课程卡片图懒加载导致布局跳动', icon: '📐' },
      { timestamp: 28000, type: 'slow_api', label: 'Slow API', detail: 'POST /api/course/select — 8.2s 响应 (500)', icon: '🐢' },
      { timestamp: 32000, type: 'long_task', label: 'Long Task', detail: '错误处理器阻塞 150ms', icon: '⏱️' },
      { timestamp: 42000, type: 'slow_api', label: 'Slow API', detail: 'POST /api/course/select — 9.1s 响应 (500)', icon: '🐢' },
      { timestamp: 65000, type: 'layout_shift', label: 'Layout Shift', detail: 'CLS +0.14 — 返回列表页重新排版', icon: '📐' },
      { timestamp: 75000, type: 'long_task', label: 'Long Task', detail: 'captcha 验证失败 fallback 逻辑阻塞 240ms', icon: '⏱️' },
      { timestamp: 82000, type: 'slow_api', label: 'Slow API', detail: 'POST /api/course/select — 10.5s 响应 (500)', icon: '🐢' },
      { timestamp: 88000, type: 'long_task', label: 'Long Task', detail: '重试逻辑循环阻塞 320ms', icon: '⏱️' }
    ],
    resources: [
      { name: 'hero-banner.jpg', type: 'Image', size: '1.8 MB', duration: 2100, status: 'slow' },
      { name: 'course-thumb-1.webp', type: 'Image', size: '152 KB', duration: 850, status: 'slow' },
      { name: 'course-thumb-2.webp', type: 'Image', size: '148 KB', duration: 920, status: 'slow' },
      { name: 'course-thumb-3.webp', type: 'Image', size: '165 KB', duration: 980, status: 'slow' },
      { name: 'course-thumb-4.webp', type: 'Image', size: '143 KB', duration: 1050, status: 'slow' },
      { name: 'course-thumb-5.webp', type: 'Image', size: '158 KB', duration: 1120, status: 'slow' },
      { name: 'course-thumb-6.webp', type: 'Image', size: '149 KB', duration: 1180, status: 'slow' },
      { name: 'course-thumb-7.webp', type: 'Image', size: '156 KB', duration: 1220, status: 'slow' },
      { name: 'course-thumb-8.webp', type: 'Image', size: '162 KB', duration: 1260, status: 'slow' },
      { name: 'courseSelector.js', type: 'Script', size: '280 KB', duration: 950, status: 'slow' },
      { name: 'edu-bundle.js', type: 'Script', size: '420 KB', duration: 620, status: 'ok' },
      { name: 'student.css', type: 'Stylesheet', size: '85 KB', duration: 340, status: 'ok' },
      { name: 'captcha.woff2', type: 'Font', size: '45 KB', duration: 0, status: 'failed' }
    ]
  },
  ai_insights: {
    summary: "大三学生 stu_2023*** 在春季选课开放时尝试抢《人工智能导论》（CS2041）热门课，因页面 LCP 5.2s 严重超标、12 张课程缩略图并发加载阻塞主线程、选课 API 3 次返回 500，累计 3 次 Rage Click（共 24 次点击）、2 次 Long Hesitation、1 次 Dead Click、1 次 Thrash Cursor，120 秒后最终放弃选课。挣扎分 0.85（Poor）。根本原因：1) hero-banner 1.8MB 未压缩；2) 课表图未做懒加载；3) 选课 API 在高峰期未做限流和队列。",
    key_takeaways: [
      "【高优】压缩 hero-banner.jpg (1.8MB → 200KB)，改用 WebP + srcset 响应式图片，可降低 LCP 约 2.5s",
      "【高优】课程列表 12 张缩略图改为懒加载 (loading=\"lazy\" + IntersectionObserver)，可减少首屏阻塞 1.5s",
      "【高优】选课 API POST /api/course/select 在选课开放瞬间需引入排队机制和限流，避免 3 次 500 错误",
      "【中】courseSelector.js 体积 280KB 需按路由切分，课程详情页才加载相关模块",
      "【中】captcha.woff2 加载失败需有 fallback（系统字体或自备字体），避免直接 Network Error",
      "【中】课程卡片图加 CSS aspect-ratio 占位，避免 0.18 的 Layout Shift",
      "【低】增加「系统繁忙」提示的重试引导（展示预估队列位置、让用户知道可以等待）"
    ],
    technical_insights: [
      "3 次 POST /api/course/select 接口返回 500 错误，平均响应 9.3s（远超 1s SLA）",
      "1 次 JS TypeError：courseSelector.js 第 128 行 undefined 属性访问（选课返回失败时未做空值判断）",
      "1 次 Resource Error：/static/captcha/captcha.woff2 加载失败（CDN 回源超时）",
      "1 次 Console Error：Network timeout after 15000ms（重试逻辑未封装有效的超时降级）"
    ],
    behavioral_insights: [
      "3 次 Rage Click 集群（6 次 / 8 次 / 10 次），总计 24 次愤怒点击均集中在「加入选课」按钮",
      "1 次 Dead Click：首次点击「加入选课」后 3.5s 无视觉反馈，用户再次点击",
      "1 次 Thrash Cursor：在按钮区域来回乱晃 2.3s（困惑）",
      "1 次 Form Zig-Zag：在两个备选课卡片间来回 4 次（犹豫）",
      "2 次 Long Hesitation：第一次 10.2s（权衡是否换课），第二次 12s（放弃前犹豫）",
      "1 次 Slow Click：「加入选课」响应 4.8s，超过 1s 阈值",
      "1 次 Excessive Scroll：在页面加载等待期间快速滑动 4 次（焦急）",
      "会话以用户放弃选课、跳转到首页结束（完成率 0）"
    ],
    performance_insights: [
      "🔴 LCP 5.2s (Poor) — 最大元素 hero-banner.jpg 体积 1.8MB 且未压缩；建议用 WebP + srcset，可降至 2.7s 以内",
      "🔴 INP 680ms (Poor) — 「加入选课」点击响应 680ms；courseSelector.js 主线程阻塞 280ms 是主因",
      "🔴 CLS 0.32 (Poor) — 12 张课程缩略图逐张加载，每张完成都触发布局跳动；需用 CSS aspect-ratio 占位",
      "🐢 3 次 POST /api/course/select 全部返回 500，平均响应 9.3s — 选课高峰期后端未限流，是选课失败的直接原因",
      "⚡ 9 次 Long Tasks，集中在页面加载和选课失败重试阶段 — 其中 5 次 > 200ms，courseSelector.js 贡献 3 次",
      "📦 首屏共加载 13 个资源，9 个为慢资源（>800ms），累计阻塞时长 11.8s — 课表图应懒加载",
      "🔗 Performance × Behavior 关联：93% 的挣扎事件（Rage Click / Dead Click / Thrash Cursor）发生在 Slow API 或 Long Task 期间",
      "📊 本会话 LCP 比该系统 P75 均值（3.1s）慢 67%，且高峰期流量是平时 12×，是服务器响应慢的直接诱因"
    ]
  }
};

// ============ 双场景访问器 ============
// 默认场景 bank；可通过 setScenario('edu') 切换
window.currentScenario = window.currentScenario || 'bank';

function getCurrentSessionList() {
  return window.currentScenario === 'edu' ? sessionListDataEdu : sessionListDataBank;
}

function getCurrentReplaySession() {
  return window.currentScenario === 'edu' ? replaySessionDataEdu : replaySessionDataBank;
}

function setScenario(name) {
  window.currentScenario = (name === 'edu') ? 'edu' : 'bank';
}

// 向后兼容：保留旧变量名，指向当前场景（不使用 Proxy，用函数包装）
// 注意：所有业务代码应改为调用 getCurrentSessionList() / getCurrentReplaySession()
// 这里的 sessionListData / replaySessionData 只作为初始值 fallback
Object.defineProperty(window, 'sessionListData', {
  get() { return getCurrentSessionList(); },
  configurable: true
});
Object.defineProperty(window, 'replaySessionData', {
  get() { return getCurrentReplaySession(); },
  configurable: true
});
