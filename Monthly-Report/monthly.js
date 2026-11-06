/* =============================================================================
   体重管理 · 减重月报（Monthly-Report）
   -----------------------------------------------------------------------------
   流程：进入月报先做「状态快问快答」（8 题，可跳过）→ 答完再看月报
   月报内容只讲两件事：
     01 减重数据分析 —— 图表下面拆成 3 段的文字
     02 饮食与运动 —— 各 3 条可执行动作，标题用具体月份
   结构：REPORTS 一份一期，STEPS 是快问快答题；接真实数据时只换 REPORTS。
   入口：portal 体重管理卡「进行中」→ 减重月报
        ?m=1..6     指定期数（默认最新一期）
        ?report=1   跳过快问快答，直接看月报（回看 / 演示用）
        ?data=none  portal 无数据态，显示空状态
   ============================================================================= */
(function () {
  'use strict';

  var AGENT = '../weight-management/Weight-loss-assistant/index.html';

  /* 配图：按每期起始月份取图（img/1.png = 1月 … 12.png = 12月），换版本只改这里 */
  var PIC = 'img/';

  /* ------------------------------------------------------------ 月报数据 ---- */
  /* Demo 口径（与评估报告 / portal 一致）：李蔓 · 女 · 32 岁 · 162cm · 上海
     用药前 71.6kg / BMI 27.3 / 腰围 88cm；6 个月目标 63.0kg */
  var REPORTS = [
    {
      no: 1, month: 6, tag: '用药启动期',
      title: '第一个月：把节奏建立起来',
      range: '2026年6月15日 – 7月12日', span: '第 1–4 周 · 28 天',
      weeks: [71.6, 70.6, 69.9, 69.3, 68.4], weekLabels: ['开始', 'W1', 'W2', 'W3', 'W4'],
      end: 68.4, delta: -3.2, total: -3.2, bmi: 26.1, waist: 85,
      analysis: '6月减了 3.2kg，占起始体重 4.5%，平均每周 0.8kg。体重从 71.6kg 到 68.4kg，前两周变化快，第 3–4 周放缓到每周 0.6kg，腰围从 88cm 到 85cm。\n6月刚开始用药，有 2 次上午头晕，身体还在适应进餐节奏。刚用药又要重新安排三餐，还要留意头晕，兼顾两头并不容易。\n7月按现在的节奏把三餐和日常活动固定下来，身体还在适应药物，先不新增训练量，腰围和身体反应也一起看。',
      diet: [
        '6月有 2 次上午头晕，7月三餐固定在相近的时间吃、不跳餐，主食每餐留半碗，杂粮饭、燕麦或红薯都可以',
        '6月刚开始用药，7月餐盘按一半蔬菜、四分之一鱼蛋豆、四分之一主食摆，先吃菜和蛋白再吃主食，用药当天和次日吃得清淡少量',
        '6月进餐节奏还在调整，7月把每天喝水 1.5–2 L 分几次喝完，蔬菜每餐留一捧，上午头晕出现的时间也记下来'
      ],
      sport: [
        '6月身体还在适应药物，7月先维持日常活动，晚饭后在住处附近慢走一圈，走到身上微微发热就回来',
        '7月先不新增训练，久坐时每小时起身动一动，能走路就少坐车，把活动接进原本的日程',
        '7月活动时以微微出汗、能正常说话为准，恶心、乏力或胃胀的日子不新增活动量；练多少，复查时医生会按 6月的记录来定'
      ]
    },
    {
      no: 2, month: 7, tag: '稳步推进',
      title: '第二个月：速度稳住了',
      range: '2026年7月13日 – 8月9日', span: '第 5–8 周 · 28 天',
      weeks: [68.4, 67.9, 67.4, 66.8, 66.4], weekLabels: ['W4', 'W5', 'W6', 'W7', 'W8'],
      end: 66.4, delta: -2.0, total: -5.2, bmi: 25.3, waist: 83,
      analysis: '7月减了 2.0kg，平均每周 0.5kg。体重从 68.4kg 到 66.4kg，五个描点每周都在往下走，腰围从 85cm 到 83cm。\n7月有 2 次高热外食，运动只做了 3 次。外食排得密，运动和三餐都要往后挪，安排起来并不宽松。\n8月把外食和活动的安排分开记录，在外吃的那几餐和有活动的日子各记一行，复查时把这份记录和体重曲线一起看。',
      diet: [
        '7月有 2 次高热外食，8月外食时先喝一碗清汤或白水，把蔬菜和鱼蛋豆先吃完，主食留一半，避开油炸和勾芡的汤汁',
        '8月三餐固定在相近的时间吃、不跳餐，下午饿得厉害时加一次小餐，无糖酸奶或鸡蛋都可以',
        '8月把鱼蛋豆这类蛋白质均分到三餐里，正餐照常吃，不用拿代餐顶掉一顿，主食里掺一半杂粮'
      ],
      sport: [
        '7月运动只做了 3 次，8月把弹力带划船、臀桥这类力量动作从轻的做起，每次做完记下发力的部位和身体感受',
        '8月快走时以微微出汗、能正常说话为准，先多练几次再慢慢加量',
        '8月把活动拆进通勤和饭后，能走路就少坐车、久坐每小时起身动一动；练多少，复查时医生会按 7月的运动记录来定'
      ]
    },
    {
      no: 3, month: 8, tag: '速度放缓',
      title: '第三个月：慢下来，但不是停下来',
      range: '2026年8月10日 – 9月6日', span: '第 9–12 周 · 28 天',
      weeks: [66.4, 66.2, 65.8, 65.4, 65.1], weekLabels: ['W8', 'W9', 'W10', 'W11', 'W12'],
      end: 65.1, delta: -1.3, total: -6.5, bmi: 24.8, waist: 81.5,
      analysis: '8月减了 1.3kg，比上一期慢了 0.7kg。体重从 66.4kg 到 65.1kg，五个描点缓慢下行，腰围从 83cm 到 81.5cm。\n8月17–21日出差 5 天，运动停了 8 天，三餐跟着行程走。出差在外，吃饭和活动都不由自己排，能顾上的部分本来就有限。\n9月先把三餐和活动的安排接回此前的节奏，出差期间的日子单独标注，按周看体重趋势。',
      diet: [
        '8月出差 5 天，9月遇到外食或酒店早餐时，先要一碗清汤或白水，把鸡蛋、酸奶和蔬菜先吃完，主食留一半',
        '9月三餐固定在相近的时间吃、不跳餐，主食里掺一半杂粮，含糖饮料换成白水',
        '9月把哪几顿在外头吃、每顿的点餐内容记在同一张表上，复查时带给医生一起看'
      ],
      sport: [
        '8月运动停了 8 天，9月先恢复日常活动，晚饭后在住处附近慢走一圈，走到身上微微发热就回来',
        '9月把弹力带划船、臀桥这类力量动作从轻的做起，活动时以微微出汗、能正常说话为准',
        '9月久坐时每小时起身动一动，能走路就少坐车；练多少，复查时医生会按 8月的记录来定'
      ]
    },
    {
      no: 4, month: 9, tag: '遇到平台',
      title: '第四个月：体重没动，但没白费',
      range: '2026年9月7日 – 10月4日', span: '第 13–16 周 · 28 天',
      weeks: [65.1, 64.9, 64.6, 64.6, 64.5], weekLabels: ['W12', 'W13', 'W14', 'W15', 'W16'],
      end: 64.5, delta: -0.6, total: -7.1, bmi: 24.6, waist: 81,
      analysis: '9月减了 0.6kg，第 13–16 周连续 3 周在 64.5–64.7kg 之间，体重从 65.1kg 到 64.5kg，腰围从 81.5cm 到 81cm。\n9月抗阻减半、睡眠掉到 6 小时，加班后第二天明显更饿。连着几周秤上几乎没动，还要把睡眠和外食都盯住，这段时间确实磨人。\n10月外食时先看菜里的酱汁和勾芡，含糖饮料换成白水；从 10月起把每天的饮食、活动和睡眠记进同一张表，复查时一起看。',
      diet: [
        '9月连续 3 周体重变化不大，10月饭量暂时不动，在家做饭时把油、酱汁和糖单独放，菜出锅前再放，少用勾芡',
        '10月饭量不变的前提下，每餐多留一点给鱼、蛋、豆腐，白米白面少一些，蔬菜和全谷杂豆每天都留一点',
        '10月把含糖饮料和甜食先减下来，每天喝水 1.5–2 L、分几次喝完'
      ],
      sport: [
        '9月抗阻减半，10月把弹力带划船、臀桥、靠墙俯卧撑轮着安排，换换方式，先不把运动量加上去',
        '9月睡眠掉到 6 小时，10月把就寝时间固定在同一个点、尽量睡到 7 小时，睡不够的那天活动量也不往上加',
        '10月活动时以微微出汗、能正常说话为准，把每次活动和身体感受记在同一张表上；复查时医生会按 9月的记录来定后面的活动量'
      ]
    },
    { no: 5, month: 10, status: 'pending', tag: '进行中', range: '2026年10月5日 – 11月1日', span: '第 17–20 周 · 进行中', eta: '11月2日生成' },
    { no: 6, month: 11, status: 'pending', tag: '未开始', range: '2026年11月2日 – 11月29日', span: '第 21–24 周 · 未开始', eta: '11月30日生成' }
  ];

  /* -------------------------------------------------- 快问快答（8 题） ---- */
  /* type: num 数字输入 / pick 单选（点选即下一题）/ multi 多选 */
  var STEPS = [
    { id: 'weight', g: '身体数据', t: '现在体重多少？', type: 'num', unit: 'kg', ph: '64.5' },
    { id: 'waist', g: '身体数据', t: '腰围多少？', type: 'num', unit: 'cm', ph: '81' },
    { id: 'react', g: '身体数据', t: '这一期的身体反应？', type: 'pick', opts: ['没有明显反应', '轻微恶心或饱胀', '食欲明显下降', '其他不适'] },
    { id: 'exercise', g: '生活习惯', t: '平均每周运动几次？', type: 'pick', opts: ['几乎不动', '1–2 次', '3–4 次', '5 次以上'] },
    { id: 'sleep', g: '生活习惯', t: '平均每天睡多久？', type: 'pick', opts: ['不足 6 小时', '6–7 小时', '7–8 小时', '8 小时以上'] },
    { id: 'drink', g: '生活习惯', t: '这一期喝过酒吗？', type: 'pick', opts: ['没喝', '1–2 次', '3 次以上'] },
    { id: 'mood', g: '心理状态', t: '这一期的状态？', type: 'pick', opts: ['状态很好', '还算顺利', '有点吃力', '快坚持不住'] },
    { id: 'block', g: '心理状态', t: '最影响坚持的是？', type: 'multi', opts: ['时间不够', '应酬聚餐', '食欲难控制', '看不到变化', '药物反应', '情绪压力'] }
  ];

  /* ---------------------------------------------------------- 渲染工具 ---- */
  var esc = (window.ZZ && window.ZZ.esc) || function (s) { return String(s == null ? '' : s); };
  var toast = (window.ZZ && window.ZZ.toast) || function () {};

  /* 变化量统一用真减号 −（U+2212），不用连字符 */
  function fmt(v) { return (v < 0 ? '−' : '+') + Math.abs(v).toFixed(1); }

  /* 体重曲线（SVG，5 个描点，首尾标数字） */
  function chart(r) {
    var W = 320, H = 132, pl = 30, pr = 16, pt = 20, pb = 30;
    var v = r.weeks, n = v.length;
    var min = Math.min.apply(null, v), max = Math.max.apply(null, v);
    var span = Math.max(max - min, 0.8);
    min -= span * 0.18; max += span * 0.18;
    var iw = W - pl - pr, ih = H - pt - pb;
    var X = function (i) { return pl + iw * (i / (n - 1)); };
    var Y = function (a) { return pt + ih * (1 - (a - min) / (max - min)); };

    var pts = [], i, line = '', dots = '', ax = '';
    for (i = 0; i < n; i++) pts.push([X(i), Y(v[i])]);
    for (i = 0; i < n; i++) line += (i ? ' L' : 'M') + pts[i][0].toFixed(1) + ' ' + pts[i][1].toFixed(1);
    var area = line + ' L' + pts[n - 1][0].toFixed(1) + ' ' + (H - pb) + ' L' + pts[0][0].toFixed(1) + ' ' + (H - pb) + ' Z';
    for (i = 0; i < n; i++) {
      var big = (i === 0 || i === n - 1);
      dots += '<circle class="dt' + (big ? ' dt-lg' : '') + '" cx="' + pts[i][0].toFixed(1) +
        '" cy="' + pts[i][1].toFixed(1) + '" r="' + (big ? 4 : 3) + '"/>';
      ax += '<text class="ax" x="' + pts[i][0].toFixed(1) + '" y="' + (H - 11) + '" text-anchor="middle">' + esc(r.weekLabels[i]) + '</text>';
    }
    var labs = '<text class="vl" x="' + (pts[0][0] - 2) + '" y="' + (pts[0][1] - 11) + '" text-anchor="start">' + v[0].toFixed(1) + '</text>' +
      '<text class="vl" x="' + (pts[n - 1][0] + 2) + '" y="' + (pts[n - 1][1] - 11) + '" text-anchor="end">' + v[n - 1].toFixed(1) + '</text>';

    return '<div class="chart"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="本期体重变化折线图">' +
      '<defs><linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#009BBF" stop-opacity=".12"/>' +
      '<stop offset="100%" stop-color="#009BBF" stop-opacity="0"/></linearGradient></defs>' +
      '<path class="ar" d="' + area + '"/><path class="ln" d="' + line + '"/>' + dots + labs + ax + '</svg></div>';
  }

  function kpi(r) {
    return '<div class="kpi">' +
      '<div><span class="n">' + fmt(r.delta) + '<em>kg</em></span><span class="l">' + r.month + '月变化</span></div>' +
      '<div><span class="n">' + fmt(r.total) + '<em>kg</em></span><span class="l">累计变化</span></div>' +
      '<div><span class="n">' + r.bmi.toFixed(1) + '</span><span class="l">BMI</span></div>' +
      '<div><span class="n">' + r.waist + '<em>cm</em></span><span class="l">腰围</span></div>' +
      '</div>';
  }

  /* 本期配图：通栏横幅，透顶展示；r.month = 该期起始月份 */
  function hero(r) {
    return '<figure class="hero"><img src="' + PIC + (r.month || r.no) + '.png" alt="' + r.month + '月配图" width="2048" height="896"></figure>';
  }

  /* 节：编号 + 标题 + 条目组（label 为空时不显示小标题） */
  function section(no, title, groups) {
    var h = '<section class="sec"><span class="sec__no">' + no + '</span>' +
      '<h2 class="sec__t">' + title + '</h2>';
    groups.forEach(function (g) {
      if (g.label) h += '<div class="blk__lbl">' + g.label + '</div>';
      h += '<ul class="ul' + (g.num ? ' num' : '') + '">';
      g.items.forEach(function (t) { h += '<li>' + t + '</li>'; });
      h += '</ul>';
    });
    return h + '</section>';
  }

  /* ------------------------------------------------------------ 月报页 ---- */
  var emptyEl = document.getElementById('empty');
  var listEl = document.getElementById('listView');
  var listCta = document.getElementById('listCta');
  var reportEl = document.getElementById('report');
  var gateEl = document.getElementById('gate');
  var topTitle = document.getElementById('topTitle');
  var topbarEl = document.getElementById('topbar');
  var phoneEl = document.getElementById('phone');
  var BACK_URL = '../online-service.html?stage=3';
  var STORE = 'zz:monthlySurvey:';

  function agentHref(no) {
    var r = byNo(no);
    var week = r && r.status !== 'pending' ? String(r.no * 4) : '4';
    return AGENT + '?entry=4&planStage=' + encodeURIComponent('进行中') +
      '&week=' + week + '&totalWeeks=24' +
      '&planName=' + encodeURIComponent('GLP-1 标准方案') +
      '&from=monthly&month=' + no;
  }

  function byNo(no) {
    for (var i = 0; i < REPORTS.length; i++) if (REPORTS[i].no === no) return REPORTS[i];
    return null;
  }

  function answered(no) {
    try { return !!localStorage.getItem(STORE + no); } catch (e) { return false; }
  }

  function reportHTML(r) {
    var h = '<div class="rp">' + hero(r);

    h += '<div class="rp__hd">' +
      '<div class="rp__eyebrow">体重管理 · 第 ' + r.no + ' 期月报</div>' +
      '<h1 class="rp__t">' + esc(r.title) + '</h1>' +
      '<div class="rp__meta">' + esc(r.range) + '<i>|</i>' + esc(r.span) + '</div></div>';

    /* 概览（历史月报入口在图表下方，默认收起） */
    h += '<section class="card ov">' +
      '<div class="ov__hd"><span class="ov__lbl">本期概览</span><span class="ov__sub">' + esc(r.span) + '</span></div>' +
      chart(r) + kpi(r) +
      '<button type="button" class="ov__hist" id="histBtn">查看历史月报</button></section>';

    /* 期数切换（展开用） */
    h += '<div class="chips" id="chips" hidden>';
    REPORTS.forEach(function (it) {
      h += '<button type="button" class="chip' + (it.no === r.no ? ' on' : '') +
        (it.status === 'pending' ? ' wait' : '') + '" data-no="' + it.no + '">第 ' + it.no + ' 期</button>';
    });
    h += '</div>';

    /* ① 数据分析：按 \n 拆成独立段落 */
    var nextMonth = (r.month % 12) + 1;
    h += '<section class="sec"><span class="sec__no">01</span>' +
      '<h2 class="sec__t">减重数据分析</h2>' +
      String(r.analysis).split('\n').filter(Boolean).map(function (t) {
        return '<p class="p">' + esc(t) + '</p>';
      }).join('') + '</section>';

    /* ② 饮食与运动建议 */
    h += section('02', nextMonth + '月的饮食与运动', [
      { label: '饮食', items: r.diet, num: true },
      { label: '运动', items: r.sport, num: true }
    ]);

    h += '<div class="fine"><p>体重为晨起空腹测量，腰围为肚脐水平呼气末测量，体成分来自 InBody。本页为健康管理服务记录，不构成诊疗建议。</p>' +
      '<p><a href="javascript:void(0)" id="refill">补填' + quizMonthName() + '状态</a></p></div></div>';
    return h;
  }

  function pendingHTML(r) {
    var h = '<div class="rp">' + hero(r) + '<div class="rp__hd">' +
      '<div class="rp__eyebrow">体重管理 · 第 ' + r.no + ' 期月报</div>' +
      '<h1 class="rp__t">这一期还没到总结的时候</h1>' +
      '<div class="rp__meta">' + esc(r.range) + '<i>|</i>' + esc(r.span) + '</div></div>' +
      '<section class="card ov"><div class="ov__hd">' +
      '<span class="ov__lbl">预计生成时间</span><span class="ov__sub">' + esc(r.eta) + '</span></div>' +
      '<p class="p">月报在每期结束后次日生成，包含这一期的减重数据分析，以及下一期的饮食与运动建议。</p>' +
      '<button type="button" class="ov__hist" id="histBtn">查看历史月报</button></section>' +
      '<div class="chips" id="chips" hidden>';
    REPORTS.forEach(function (it) {
      h += '<button type="button" class="chip' + (it.no === r.no ? ' on' : '') +
        (it.status === 'pending' ? ' wait' : '') + '" data-no="' + it.no + '">第 ' + it.no + ' 期</button>';
    });
    h += '</div></div>';
    return h;
  }

  /* ---------------- 月报列表页（默认落地页，只显示已生成的月报） ---------------- */
  function listHTML() {
    var h = '<div class="mlist">';
    for (var i = REPORTS.length - 1; i >= 0; i--) {
      var r = REPORTS[i];
      if (r.status === 'pending') continue;
      h += '<button type="button" class="mlist__i" data-no="' + r.no + '">' +
        '<span class="mlist__no">第 ' + r.no + ' 期 · ' + esc(r.range) + '</span>' +
        '<span class="mlist__m">' + esc(r.title) + '</span>' +
        '</button>';
    }
    h += '</div>';
    return h;
  }

  function showList() {
    gateEl.hidden = true;
    emptyEl.hidden = true;
    reportEl.hidden = true;
    listEl.hidden = false;
    if (listCta) listCta.hidden = false;
    exitHero();
    if (topTitle) topTitle.textContent = '减重月报';
    listEl.innerHTML = listHTML();
    listEl.scrollTop = 0;
    [].slice.call(listEl.querySelectorAll('.mlist__i')).forEach(function (b) {
      b.addEventListener('click', function () {
        if (listCta) listCta.hidden = true;
        show(parseInt(b.getAttribute('data-no'), 10));
      });
    });
  }

  function show(no) {
    var r = byNo(no);
    if (!r) return;
    if (listEl) listEl.hidden = true;
    if (listCta) listCta.hidden = true;
    gateEl.hidden = true;
    emptyEl.hidden = true;
    reportEl.hidden = false;
    reportEl.innerHTML = (r.status === 'pending') ? pendingHTML(r) : reportHTML(r);
    /* 月报内容已读：清除「生成月报 / 新月报」待办（与 portal 卡、More 聚合页红点联动） */
    try { sessionStorage.removeItem('zz:monthlyBadge'); } catch (e) {}
    reportEl.scrollTop = 0;
    if (topTitle) topTitle.textContent = '减重月报';

    /* 透顶模式：顶栏浮在配图上，滚动过图后变实底 */
    reportEl.classList.add('page--hero');
    if (phoneEl) phoneEl.classList.add('has-hero');
    if (topbarEl) topbarEl.classList.remove('solid');

    [].slice.call(reportEl.querySelectorAll('.chip')).forEach(function (c) {
      c.addEventListener('click', function () { show(parseInt(c.getAttribute('data-no'), 10)); });
    });
    var hist = document.getElementById('histBtn');
    if (hist) hist.addEventListener('click', function () {
      var chips = document.getElementById('chips');
      var open = chips.hidden;
      chips.hidden = !open;
      hist.textContent = open ? '收起' : '查看历史月报';
      if (open) reportEl.scrollTop = 0;
    });
    var refill = document.getElementById('refill');
    if (refill) refill.addEventListener('click', function () { openGate(r.no); });
  }

  /* -------------------------------------------------------- 快问快答 ---- */
  var gateBody = document.getElementById('gateBody');
  var gateNext = document.getElementById('gateNext');
  var gNo = 1;

  /* 填写口径：按填写时间定所属月份 —— 当月 15 日（含）前填 = 上期，15 日后 = 当期。
     例：11 月 14 日填 → 「10月状态」；11 月 16 日填 → 「11月状态」 */
  function quizMonthName() {
    var now = new Date();
    var m = now.getMonth() + 1;
    if (now.getDate() < 15) {
      m = m === 1 ? 12 : m - 1;
    }
    return m + '月';
  }

  function openGate(no) {
    gNo = no;
    gateEl.hidden = false;
    reportEl.hidden = true;
    emptyEl.hidden = true;
    if (listEl) listEl.hidden = true;
    if (listCta) listCta.hidden = true;
    var mn = quizMonthName();
    if (topTitle) topTitle.textContent = mn + '状态';
    var ttl = document.getElementById('gateTtl');
    if (ttl) ttl.textContent = mn + '状态快问快答';
    exitHero();
    renderForm();
  }

  /* 退出透顶模式（快问快答 / 空状态用常规顶栏） */
  function exitHero() {
    reportEl.classList.remove('page--hero');
    if (phoneEl) phoneEl.classList.remove('has-hero');
    if (topbarEl) topbarEl.classList.remove('solid');
  }

  /* 单页速填：8 题一次列完，点选即可，不填也能直接看月报 */
  function renderForm() {
    var h = '', lastG = '';
    STEPS.forEach(function (s) {
      if (s.g !== lastG) {
        h += '<div class="qg">' + esc(s.g) + '</div>';
        lastG = s.g;
      }
      h += '<div class="q"><div class="q__t">' + esc(s.t) + '</div>';
      if (s.type === 'num') {
        h += '<label class="inp"><input type="number" inputmode="decimal" step="0.1" data-id="' + s.id +
          '" placeholder="' + esc(s.ph) + '" /><i>' + esc(s.unit) + '</i></label>';
      } else {
        h += '<div class="pills" data-id="' + s.id + '" data-type="' + s.type + '">';
        s.opts.forEach(function (o) { h += '<button type="button" class="pill">' + esc(o) + '</button>'; });
        h += '</div>';
      }
      h += '</div>';
    });
    gateBody.innerHTML = h;

    /* 单选互斥，多选可叠加 */
    [].slice.call(gateBody.querySelectorAll('.pills')).forEach(function (box) {
      var multi = box.getAttribute('data-type') === 'multi';
      box.addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('.pill') : null;
        if (!b || !box.contains(b)) return;
        if (multi) {
          b.classList.toggle('on');
        } else {
          [].slice.call(box.querySelectorAll('.pill')).forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
        }
      });
    });
  }

  function submit() {
    var data = {};
    [].slice.call(gateBody.querySelectorAll('.pills')).forEach(function (box) {
      var on = [].slice.call(box.querySelectorAll('.pill.on')).map(function (x) { return x.textContent; });
      if (on.length) data[box.getAttribute('data-id')] = on;
    });
    [].slice.call(gateBody.querySelectorAll('input[type=number]')).forEach(function (i) {
      if (i.value !== '') data[i.getAttribute('data-id')] = [i.value];
    });
    try { localStorage.setItem(STORE + gNo, JSON.stringify({ at: Date.now(), data: data })); } catch (e) {}
    toast('已记录');
    show(gNo);
  }

  /* 不填也可以直接生成，空记录同样标记为本期已填 */
  gateNext.addEventListener('click', submit);

  function showEmpty() {
    emptyEl.hidden = false;
    reportEl.hidden = true;
    gateEl.hidden = true;
    if (listEl) listEl.hidden = true;
    /* 「生成最新月报」吸底按钮在空状态下常驻，随时可开始第一次填写 */
    if (listCta) listCta.hidden = false;
    exitHero();
  }

  function init() {
    var q = {};
    try {
      var p = new URLSearchParams(location.search);
      q.m = p.get('m');
      q.data = p.get('data');
      q.report = p.get('report');
    } catch (e) {}

    var back = document.getElementById('backBtn');
    if (back) {
      back.addEventListener('click', function () {
        /* 快问快答页返回也是回 portal（不放出月报），与月报页返回同一条路径 */
        if (history.length > 1) history.back();
        else location.href = BACK_URL;
      });
    }
    var more = document.getElementById('moreBtn');
    if (more) more.addEventListener('click', function () { toast('月报暂不支持导出'); });

    /* 滚动过配图后，顶栏从透明转为实底 */
    reportEl.addEventListener('scroll', function () {
      if (!topbarEl || !phoneEl || !phoneEl.classList.contains('has-hero')) return;
      topbarEl.classList.toggle('solid', reportEl.scrollTop > 140);
    });

    /* 入口规则：默认进月报列表页；点列表下方「生成最新月报」才进快问快答。
       ?m=N 直接看指定期；?report=1 直接看最新一期（回看/演示用）；
       ?data=none 显示空状态 */
    var gen = document.getElementById('genBtn');
    if (gen) gen.addEventListener('click', function () { openGate(4); });

    if (q.data === 'none' && !q.m) { showEmpty(); return; }
    var no = parseInt(q.m, 10);
    if (no && byNo(no)) { show(no); return; }
    if (q.report === '1') { show(4); return; }
    showList();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
