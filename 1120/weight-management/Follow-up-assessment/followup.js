/* =============================================================================
   体重管理 · 减重疗程随访评估（weight-management/Follow-up-assessment）
   -----------------------------------------------------------------------------
   题目来源：钉钉文档《复诊/续药问卷》的「问题及选项」列。
   文档里的「类型」与「我们用它做什么？」两列不在页面呈现，也不拿来分层、
   画像或生成话术：本页只收集答案，提交后给中性回执与后续入口。
   格式与 UI 与首诊问卷（Medication-eligibility-assessment）一致：一屏一题 +
   一条进度条；单选点中即自动跳下一题，返回修改用底部「上一题」。
   不下诊断、不承诺效果，是否调整方案统一交给医生判断。
   视觉：卓正医疗 VI（2025.01），见 followup.css
   ============================================================================= */
(function () {
  'use strict';

  /* ===================== 1. 入口 ===================== */
  var HOME_URL = '../../online-service.html';
  /* 分层处置落点（与首诊评估报告同逻辑）：
     效果与耐受均在计划内 → 线上续药（支付页承接）；需医生判断 → 预约面诊 */
  var PAY_URL = '../../Payment-Page/index.html';
  var BOOK_URL = '../../Appointment-booking/index.html';

  var TITLE_QUIZ = '减重疗程随访评估';
  var TITLE_RESULT = '评估结果';

  /* ===================== 2. 题目 =====================
     照《复诊/续药问卷》的「问题及选项」列抄录；文档里的填空横线在页面里
     变成可勾选的确认项，题干不写引导语、不写「我们用它做什么」。 */
  var Q = [
    { t: '您当前的用药情况：', k: 'med', type: 'm',
      o: ['药品/剂型', '当前用药剂量', '当前剂量已持续（周）', '上一次注射日期'] },

    { t: '您当前的体重与腰围：', k: 'body', type: 'm',
      o: ['体重（kg）', '腰围（cm）', '测量日期'] },

    { t: '最近一次注射后，食欲明显下降持续了几天？（单选）', k: 'appetite', type: 's',
      o: ['无明显感觉', '1-2天', '3-4天', '5-7天', '不确定'] },

    { t: '您本周期用药后的整体不适程度？（单选）', k: 'discomfort', type: 's',
      o: ['基本没有不适', '偶发轻微不适，已缓解', '轻微但持续/反复', '明显不适，影响进食或日常生活'] },

    /* 文档标注为选填：不选也能直接点「下一题」跳过 */
    { t: '若有不适，具体表现（可多选）：', k: 'symptoms', type: 'm', optional: true,
      o: ['恶心/呕吐', '腹泻', '便秘', '反酸/腹胀', '乏力/头晕', '其他'] },

    { t: '您目前对进度的感受是？（单选）', k: 'pace', type: 's',
      o: ['满意', '有点慢', '太快', '不确定'] },

    { t: '近期是否有以下情况？（可多选）', k: 'recent', type: 'm',
      o: ['新增或调整了其他药物', '新就诊、住院或诊断了新疾病', '备孕、怀孕或哺乳', '以上都没有', '其他（请补充）'] }
  ];

  /* ===================== 3. 状态 ===================== */
  var ans = [];          /* 每题答案：单选存字符串，多选存数组 */
  var cur = 0;           /* 当前题号 */
  var w0 = 0, w1 = 0;    /* 开始用药时体重 / 现在的体重（kg） */
  var mode = 'quiz';     /* quiz | alert | advice */
  var jumpIdx = 0;       /* 结果页「返回修改」要回到的题号 */
  var RES = null;        /* 评估结果（含处置分支 disp：renew | face | alert） */

  var ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_INFO = '<svg viewBox="0 0 24 24" fill="none"><path d="M12 10.6v6.4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="7.4" r="1.5" fill="currentColor"/></svg>';
  var ICON_WARN = '<svg viewBox="0 0 24 24" fill="none"><path d="M12 6.5v7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="17.4" r="1.5" fill="currentColor"/></svg>';
  var ICON_BOX = '<svg class="opt__chk" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var view = null;
  var bar = null;
  var prog = null;

  /* ===================== 4. 工具 ===================== */
  /* 见 shared.js */
  var esc = ZZ.esc;

  function idx(k) { return Quiz.idx(Q, k); }

  function one(k) { return ans[idx(k)] || ''; }
  function many(k) { return ans[idx(k)] || []; }

  /* 多选里第一个「真正选中」的项（排除指定的空选项） */
  function firstReal(list, empty) {
    for (var i = 0; i < list.length; i++) {
      if (list[i] !== empty) return list[i];
    }
    return '';
  }

  function deltaPct() {
    if (!(w0 > 0 && w1 > 0)) return null;
    return (w1 - w0) / w0 * 100;
  }

  function deltaText() {
    var p = deltaPct();
    if (p === null) return '';
    var d = w1 - w0;
    var sign = d > 0 ? '+' : (d < 0 ? '−' : '±');
    return sign + Math.abs(d).toFixed(1) + ' kg · ' + sign + Math.abs(p).toFixed(1) + '%';
  }

  /* 是否勾了「确实有症状」（排除「基本没有 / 不确定」） */
  function hasSymptom() {
    var s = many('symptom');
    for (var i = 0; i < s.length; i++) {
      if (s[i] !== '基本没有' && s[i] !== '不确定') return true;
    }
    return false;
  }

  function recheckCount() {
    var r = many('recheck');
    var n = 0;
    for (var i = 0; i < r.length; i++) {
      if (r[i] !== '都还没查' && r[i] !== '不确定') n++;
    }
    return n;
  }

  /* 饮食情况摘要：把勾选项原样回显，不做评价 */
  function dietText() {
    var d = many('diet');
    if (!d.length) return '';
    var unsure = d.indexOf('不确定') > -1;
    var real = d.filter(function (x) { return x !== '不确定'; });
    if (!real.length) return '不确定';
    return real.join('、') + (unsure ? '、不确定' : '');
  }

  /* 见 shared.js */
  var toast = ZZ.toast;
  var setTitle = ZZ.setTitle;

  /* ===================== 5. 答题区渲染 ===================== */
  /* 进度条只保留一条：与首诊评估问卷一致，用连续填充条表示当前进度 */
  function renderProgress() {
    return '' +
      '<section class="prog card">' +
      '<div class="prog__top">' +
      '<span class="prog__step">第 <b class="tnum">' + (cur + 1) + '</b> / ' + Q.length + ' 题</span>' +
      '<span class="prog__hint">约 2 分钟</span>' +
      '</div>' +
      '<div class="prog__bar"><i style="width:' + ((cur + 1) / Q.length * 100) + '%"></i></div>' +
      '</section>';
  }

  function renderOptions(q) {
    return Quiz.options(q, cur, ans, esc, ICON_BOX);
  }

  function renderWeight() {
    var txt = deltaText();
    return '' +
      '<div class="nums">' +
      '<label class="num"><span class="num__k">开始</span>' +
      '<input id="inW0" type="number" inputmode="decimal" min="0" max="300" placeholder="请输入" value="' + (w0 || '') + '">' +
      '<span class="num__u">kg</span></label>' +
      '<label class="num"><span class="num__k">现在</span>' +
      '<input id="inW1" type="number" inputmode="decimal" min="0" max="300" placeholder="请输入" value="' + (w1 || '') + '">' +
      '<span class="num__u">kg</span></label>' +
      '</div>' +
      '<div class="calc' + (txt ? ' is-on' : '') + '" id="calcBox">' +
      '<span>变化</span><b class="tnum" id="calcVal">' + (txt ? esc(txt) : '') + '</b>' +
      '</div>';
  }

  function renderQuestion() {
    return Quiz.question(Q[cur], cur, ans, esc, ICON_BOX, renderWeight, 'w');
  }

  function renderBar() {
    if (!bar) return;

    if (mode !== 'quiz') {
      /* 结果页：按处置分支给出下一步动作（分层引导，同首诊评估报告）
         renew → 线上续药；face / alert → 预约面诊 */
      bar.hidden = false;
      bar.innerHTML = '';
      var cta = document.createElement('button');
      cta.className = 'btn';
      cta.type = 'button';
      if (RES && RES.disp === 'renew') {
        cta.textContent = '线上续药';
        cta.addEventListener('click', function () { location.href = PAY_URL; });
      } else {
        cta.textContent = '预约面诊';
        cta.addEventListener('click', function () { location.href = BOOK_URL; });
      }
      bar.appendChild(cta);
      return;
    }

    bar.hidden = false;
    /* 第 1 题没有可返回的题，不放「上一题」占位，让「下一题」通栏 */
    /* 选项题未作答时按钮置灰，点它给一句轻提示（不是报错） */
    var locked = !Q[cur].optional && !Quiz.answered(Q[cur], cur, ans);
    bar.innerHTML = (cur > 0 ? '<button class="btn btn--ghost" id="prevBtn" type="button">上一题</button>' : '') +
      '<button class="btn' + (locked ? ' is-locked' : '') + '" id="nextBtn" type="button" aria-disabled="' + (locked ? 'true' : 'false') + '">' +
      (cur === Q.length - 1 ? '提交评估' : '下一题') + '</button>';
    if (cur > 0) bar.querySelector('#prevBtn').addEventListener('click', goPrev);
    bar.querySelector('#nextBtn').addEventListener('click', goNext);
  }

  function renderQuiz() {
    if (prog) { prog.hidden = false; prog.innerHTML = renderProgress(); }
    view.innerHTML = renderQuestion();
    bindQuiz();
    renderBar();
    view.scrollTop = 0;
  }

  function bindQuiz() {
    var q = Q[cur];

    if (q.type === 'w') {
      var in0 = view.querySelector('#inW0');
      var in1 = view.querySelector('#inW1');
      if (in0) in0.addEventListener('input', function () { w0 = parseFloat(this.value) || 0; syncCalc(); });
      if (in1) in1.addEventListener('input', function () { w1 = parseFloat(this.value) || 0; syncCalc(); });
      return;
    }

    var opts = view.querySelectorAll('.opt');
    for (var j = 0; j < opts.length; j++) {
      (function (btn) {
        btn.addEventListener('click', function () { pick(btn.getAttribute('data-v')); });
      })(opts[j]);
    }
  }

  function syncCalc() {
    var box = view.querySelector('#calcBox');
    var val = view.querySelector('#calcVal');
    if (!box || !val) return;
    var txt = deltaText();
    box.classList.toggle('is-on', !!txt);
    val.textContent = txt;
  }

  /* ===================== 6. 答题交互 ===================== */
  function pick(v) {
    var q = Q[cur];

    if (q.type === 'm') {
      if (!ans[cur]) ans[cur] = [];
      var at = ans[cur].indexOf(v);
      if (at > -1) ans[cur].splice(at, 1); else ans[cur].push(v);
      renderQuiz();
      return;
    }

    ans[cur] = v;
    renderQuiz();

    /* ① 单选点中即自动跳下一题 */
    setTimeout(function () {
      if (cur < Q.length - 1) { cur++; renderQuiz(); }
      else finish();
    }, 180);
  }

  function goPrev() {
    if (mode !== 'quiz' || cur === 0) return;
    cur--;
    renderQuiz();
  }

  /* 选项题必须先作答才能进下一题；数字题（体重变化）不设强制 */
  function goNext() {
    if (mode !== 'quiz') return;
    if (!Q[cur].optional && !Quiz.answered(Q[cur], cur, ans)) { toast('先选一项，再继续'); return; }
    if (cur < Q.length - 1) { cur++; renderQuiz(); }
    else finish();
  }

  function backToFix() {
    mode = 'quiz';
    setTitle(TITLE_QUIZ);
    cur = jumpIdx >= 0 ? jumpIdx : 0;
    renderQuiz();
    view.scrollTop = 0;
  }

  /* ===================== 7. 结果 =====================
     问卷只收集「问题及选项」，不按文档里的用途做分层判断，也不生成话术；
     ?disp=renew|face 只用于 demo 预览两种后续落点。 */
  var FORCE = (location.search.match(/[?&]disp=(renew|face)(?:&|$)/) || [])[1];

  function evaluate() {
    if (FORCE === 'face') return faceResult();
    return renewResult();
  }

  /* ===================== 7.5 结论构造 =====================
     只给中性回执：不评价效果、不提示调量、不展示文档里的用途说明。 */
  function renewResult() {
    jumpIdx = 0;
    return {
      page: 'advice', disp: 'renew', tone: 'ok',
      title: '问卷已提交',
      desc: '你填写的情况已记录，医生会在复诊或续药前结合这些信息复核。',
      tips: []
    };
  }

  function faceResult() {
    jumpIdx = 0;
    return {
      page: 'advice', disp: 'face', tone: 'info',
      title: '问卷已提交',
      desc: '你填写的情况已记录，需要医生进一步确认时会有医护联系你。',
      tips: []
    };
  }

  /* 客观回显：只列用户实际选择的答案，不写「未填写」、不做判断 */
  function rows() {
    var labels = ['用药情况', '体重与腰围', '食欲下降', '整体不适程度', '具体不适表现', '进度感受', '近期情况'];
    var out = [];
    for (var i = 0; i < Q.length; i++) {
      var a = ans[i];
      var v = Object.prototype.toString.call(a) === '[object Array]' ? a.join('、') : (a || '');
      if (v) out.push([labels[i], v]);
    }
    return out;
  }

  /* ===================== 8. 结果区渲染 ===================== */
  /* 后续入口说明：只讲流程，不评价填写内容 */
  function nextBlock(r) {
    var tx = r.disp === 'renew'
      ? '药品不足时可直接线上续药，续药申请会由医生复核你填写的情况后确认。'
      : '如需进一步评估，可预约线下面诊，医生会结合你填写的情况判断。';
    return '<div class="next">' +
      '<b>接下来</b>' +
      '<span class="next__tx">' + tx + '</span>' +
      '</div>';
  }

  function alertHtml(r) {
    return '' +
      '<section class="rb card">' +
      '<span class="rb__ico rb__ico--no">' + ICON_WARN + '</span>' +
      '<h1 class="rb__t">' + esc(r.title) + '</h1>' +
      '<p class="rb__d">你填写的「<b>' + esc(r.reason) + '</b>」，' + r.body + '</p>' +
      nextBlock(r) +
      '</section>' +
      '<p class="foot">' + r.foot + '</p>' +
      '<button class="linkbtn" id="fixLink" type="button">返回修改答案</button>';
  }

  function adviceHtml(r) {
    var sum = rows().map(function (x) {
      return '<div class="sum__r"><span>' + esc(x[0]) + '</span><b>' + esc(x[1]) + '</b></div>';
    }).join('');

    return '' +
      '<section class="rb card">' +
      '<span class="rb__ico rb__ico--' + (r.tone === 'ok' ? 'ok' : 'info') + '">' + (r.tone === 'ok' ? ICON_CHECK : ICON_INFO) + '</span>' +
      '<h1 class="rb__t">' + esc(r.title) + '</h1>' +
      '<p class="rb__d">' + r.desc + '</p>' +
      '<div class="sum">' + sum + '</div>' +
      (r.tips.length ? '<span class="tips__h">接下来可以这样做</span><ul class="tips">' +
        r.tips.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '') +
      nextBlock(r) +
      '</section>' +
      '<p class="foot">' + ZZ.CFG.DISC_FORM + '</p>' +
      '<button class="linkbtn" id="fixLink" type="button">返回修改答案</button>';
  }

  function showResult() {
    var r = evaluate();
    RES = r;
    mode = r.page;
    /* 记一次随访完成时间：portal「续费」阶段据此在「线上续药 / 做随访评估」间切换 */
    ZZ.markFollowupDone();
    setTitle(TITLE_RESULT);
    if (prog) { prog.hidden = true; prog.innerHTML = ''; }
    view.innerHTML = (r.page === 'alert') ? alertHtml(r) : adviceHtml(r);
    renderBar();
    view.scrollTop = 0;

    var fix = view.querySelector('#fixLink');
    if (fix) fix.addEventListener('click', backToFix);
  }

  function finish() {
    showResult();
  }

  /* ===================== 9. 顶部导航 ===================== */
  function initNav() {
    var back = document.getElementById('backBtn');
    if (back) {
      back.addEventListener('click', function () {
        if (history.length > 1) history.back();
        else location.href = HOME_URL;
      });
    }
    var more = document.getElementById('moreBtn');
    if (more) {
      /* 顶栏「⋯」：draft 阶段兼作处置分支预览切换入口 */
      more.addEventListener('click', function (e) {
        e.stopPropagation();
        var sw = document.querySelector('.disp-sw');
        if (sw) sw.classList.toggle('is-open');
      });
    }
  }

  /* ===================== 9.5 分支预览切换（draft 工具，同首诊报告页） ===================== */
  function initDispSw() {
    var phone = document.getElementById('phone');
    var more = document.getElementById('moreBtn');
    if (!phone || !more) return;
    var wrap = document.createElement('div');
    wrap.className = 'disp-sw';
    wrap.innerHTML =
      '<div class="disp-sw__menu">' +
      '<span class="disp-sw__cap">预览处置分支</span>' +
      '<button type="button" data-disp="renew"' + (FORCE === 'renew' ? ' class="is-cur"' : '') + '>线上续药（计划内）</button>' +
      '<button type="button" data-disp="face"' + (FORCE === 'face' ? ' class="is-cur"' : '') + '>预约面诊（需医生评估）</button>' +
      '</div>';
    phone.appendChild(wrap);

    wrap.addEventListener('click', function (e) {
      var b = e.target.closest('[data-disp]');
      if (!b) return;
      var u = new URL(location.href);
      u.searchParams.set('disp', b.getAttribute('data-disp'));
      location.href = u.href;
    });
    /* 点外面收起 */
    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) wrap.classList.remove('is-open');
    });
  }

  /* ===================== 10. 启动 ===================== */
  function init() {
    view = document.getElementById('view');
    bar = document.getElementById('paybar');
    prog = document.getElementById('prog');
    if (!view || !bar) return;
    view.classList.add('view-in');
    initNav();
    initDispSw();
    renderQuiz();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
