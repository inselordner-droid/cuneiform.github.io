/* Cuneiform Explorer — gemeinsames Fortschritts-/Gamification-System.
   Läuft komplett lokal (localStorage) auf dem Gerät der Nutzerin/des Nutzers — kein Server,
   kein Konto, keine Übertragung. Wird von index.html, archiv.html und woerterbuch.html
   gleichermaßen eingebunden, damit z. B. im Archiv gesehene Zeichen und in der Tafel-
   Übersetzung erkannte Zeichen zum selben Fortschritt zählen. */
(function(global){
  "use strict";

  const XP_KEY = "cuneiform_xp";
  const SEEN_SIGNS_KEY = "cuneiform_seen_signs";
  const UNLOCKED_KEY = "cuneiform_unlocked_milestones";
  const STATS_KEY = "cuneiform_stats";

  const RANKS = [
    {min:0,    name:"Neuling",                        icon:"🌱"},
    {min:20,   name:"Lehrling der Schreibkunst",       icon:"🖋"},
    {min:60,   name:"Tontafel-Forscher(in)",           icon:"🔍"},
    {min:150,  name:"Zeichenkundige(r)",               icon:"📜"},
    {min:300,  name:"Assyriologie-Adept(in)",          icon:"🏺"},
    {min:600,  name:"Meister(in) der Keilschrift",     icon:"👑"},
    {min:1200, name:"Hüter(in) der Tafeln",            icon:"🧭"}
  ];

  const MILESTONES = [
    {id:"first_translation", icon:"🥇", title:"Erste Entzifferung",   desc:"Erste Tafel übersetzt",                                  check: s => s.translations >= 1},
    {id:"ten_translations",  icon:"📚", title:"Vielleser(in)",         desc:"10 Tafeln übersetzt",                                     check: s => s.translations >= 10},
    {id:"first_supplemented",icon:"🧩", title:"Lückenfüller(in)",      desc:"Erste von der KI ergänzte Textstelle entdeckt",           check: s => !!s.sawSupplemented},
    {id:"signs_25",          icon:"🔤", title:"Zeichenkenner(in)",     desc:"25 verschiedene Zeichen kennengelernt",                   check: s => s.seenSignsCount >= 25},
    {id:"signs_100",         icon:"🗿", title:"Zeichenmeister(in)",    desc:"100 verschiedene Zeichen kennengelernt",                  check: s => s.seenSignsCount >= 100},
    {id:"archive_explorer",  icon:"🏛", title:"Archiv-Forscher(in)",   desc:"10 Zeichen im Zeichen-Archiv im Detail angesehen",        check: s => s.archiveViews >= 10},
    {id:"dictionary_used",   icon:"🔮", title:"Wörterbuch-Nutzer(in)", desc:"Erste Begriffs-Suche im Begriffs-Wörterbuch",             check: s => s.dictLookups >= 1},
    {id:"dictionary_10",     icon:"🗝", title:"Vielsucher(in)",        desc:"10 Begriffs-Suchen im Begriffs-Wörterbuch",               check: s => s.dictLookups >= 10}
  ];

  function readJson(key, fallback){
    try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }catch(e){ return fallback; }
  }
  function writeJson(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){} }

  function getXp(){ try{ return parseInt(localStorage.getItem(XP_KEY)||"0",10) || 0; }catch(e){ return 0; } }
  function setXp(v){ try{ localStorage.setItem(XP_KEY, String(v)); }catch(e){} }
  function getSeenSigns(){ return readJson(SEEN_SIGNS_KEY, []); }
  function getUnlocked(){ return readJson(UNLOCKED_KEY, []); }
  function getStats(){
    return Object.assign({translations:0, archiveViews:0, dictLookups:0, sawSupplemented:false}, readJson(STATS_KEY, {}));
  }
  function setStats(s){ writeJson(STATS_KEY, s); }

  function currentRank(xp){
    let r = RANKS[0];
    for(const cand of RANKS) if(xp >= cand.min) r = cand;
    return r;
  }
  function nextRank(xp){
    return RANKS.find(r => r.min > xp) || null;
  }

  const listeners = [];
  function onChange(fn){ listeners.push(fn); }
  function notify(){ listeners.forEach(fn => { try{ fn(); }catch(e){} }); }

  function escapeHtmlLocal(s){
    return String(s==null?"":s).replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  }

  /* ---------- XP & Ränge ---------- */
  function addXp(amount){
    const before = getXp();
    const beforeRank = currentRank(before);
    const after = Math.max(0, before + (amount||0));
    setXp(after);
    const afterRank = currentRank(after);
    const leveledUp = afterRank.name !== beforeRank.name && after > before;
    checkMilestones();
    if(leveledUp){ showRankToast(afterRank); pulseChip(); }
    notify();
    return { leveledUp, rank: afterRank };
  }

  /* ---------- Zeichen & Statistiken ---------- */
  function markSignSeen(name){
    if(!name) return false;
    const key = String(name).toUpperCase().trim();
    if(!key) return false;
    const seen = getSeenSigns();
    if(seen.includes(key)) return false;
    seen.push(key);
    writeJson(SEEN_SIGNS_KEY, seen);
    addXp(1);
    return true;
  }

  function markSupplementedSeen(){
    const stats = getStats();
    if(stats.sawSupplemented) return;
    stats.sawSupplemented = true;
    setStats(stats);
    checkMilestones();
    notify();
  }

  function incStat(name, by){
    const stats = getStats();
    stats[name] = (stats[name]||0) + (by==null?1:by);
    setStats(stats);
    checkMilestones();
    notify();
    return stats[name];
  }

  function checkMilestones(){
    const stats = getStats();
    stats.seenSignsCount = getSeenSigns().length;
    const unlocked = getUnlocked();
    const newlyUnlocked = [];
    MILESTONES.forEach(m => {
      if(!unlocked.includes(m.id) && m.check(stats)){
        unlocked.push(m.id);
        newlyUnlocked.push(m);
      }
    });
    if(newlyUnlocked.length){
      writeJson(UNLOCKED_KEY, unlocked);
      newlyUnlocked.forEach(m => showMilestoneToast(m));
    }
    return newlyUnlocked;
  }

  /* ---------- UI: Toasts ---------- */
  function ensureToastHost(){
    let host = document.querySelector(".toast-host");
    if(!host){
      host = document.createElement("div");
      host.className = "toast-host";
      document.body.appendChild(host);
    }
    return host;
  }
  function fireToast(iconHtml, boldText, subText){
    const host = ensureToastHost();
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `<span class="ticon">${iconHtml}</span><span><b>${boldText}</b><br>${subText}</span>`;
    host.appendChild(el);
    requestAnimationFrame(()=> el.classList.add("show"));
    setTimeout(()=>{
      el.classList.remove("show");
      setTimeout(()=> el.remove(), 400);
    }, 4400);
  }
  function showMilestoneToast(m){
    fireToast(m.icon, "Errungenschaft freigeschaltet", escapeHtmlLocal(m.title) + " — " + escapeHtmlLocal(m.desc));
  }
  function showRankToast(rank){
    fireToast(rank.icon, "Neuer Rang erreicht", escapeHtmlLocal(rank.name));
  }

  function pulseChip(elId){
    const el = document.getElementById(elId || "progChip");
    if(!el) return;
    el.classList.remove("levelup");
    void el.offsetWidth; /* reflow erzwingen, damit die Animation erneut abspielt */
    el.classList.add("levelup");
  }

  /* ---------- UI: Kopfzeilen-Chip ---------- */
  function renderProgressChip(elId){
    const el = document.getElementById(elId || "progChip");
    if(!el) return;
    const xp = getXp();
    const rank = currentRank(xp);
    el.innerHTML = `<span>${rank.icon}</span><span>${escapeHtmlLocal(rank.name)}</span><span style="opacity:.72">· ${xp} XP</span>`;
  }

  /* ---------- UI: Fortschritts-Panel (nutzt vorhandenes #overlay/#panel) ---------- */
  function renderProgressPanelHtml(){
    const xp = getXp();
    const rank = currentRank(xp);
    const next = nextRank(xp);
    const unlocked = getUnlocked();
    const pct = next ? Math.max(4, Math.min(100, Math.round(((xp - rank.min) / (next.min - rank.min)) * 100))) : 100;
    const milestonesHtml = MILESTONES.map(m => {
      const done = unlocked.includes(m.id);
      return `<div class="milestone${done?' done':''}">
        <span class="micon">${done?m.icon:'🔒'}</span>
        <div><div>${escapeHtmlLocal(m.title)}</div><div class="small">${escapeHtmlLocal(m.desc)}</div></div>
      </div>`;
    }).join("");
    return `
      <button class="close">✕</button>
      <div class="pg">${rank.icon}</div>
      <h3>${escapeHtmlLocal(rank.name)}</h3>
      <div class="pid">${xp} XP gesammelt${next ? ` · noch ${next.min - xp} XP bis „${escapeHtmlLocal(next.name)}“` : " · höchster Rang erreicht"}</div>
      <div class="progressbar"><div style="width:${pct}%"></div></div>
      <div class="plist" style="margin-top:18px"><b>Errungenschaften</b></div>
      <div class="proglist">${milestonesHtml}</div>
      <p style="font-size:.78rem;color:var(--muted);margin-top:16px;font-style:italic">
        Der Fortschritt wird ausschließlich lokal in diesem Browser gespeichert (kein Server, kein Konto,
        keine Übertragung) — beim Löschen der Browserdaten geht er verloren.
      </p>`;
  }
  function openProgressPanel(){
    const overlay = document.getElementById("overlay");
    const panel = document.getElementById("panel");
    if(!overlay || !panel) return;
    panel.innerHTML = renderProgressPanelHtml();
    panel.querySelector(".close").onclick = () => overlay.classList.remove("open");
    overlay.classList.add("open");
  }

  global.CuneiformProgress = {
    RANKS, MILESTONES,
    getXp, getSeenSigns, getUnlocked, getStats,
    currentRank, nextRank,
    addXp, markSignSeen, markSupplementedSeen, incStat,
    showMilestoneToast, showRankToast,
    renderProgressChip, openProgressPanel,
    onChange
  };
})(window);
