(() => {
  "use strict";
  const NEWS_PATH = "../../data/news.json";
  const REPORTS_PATH = "../../data/synbio-reports.json";
  const KEYWORDS = ["합성생물", "synthetic biology", "바이오파운드리", "biofoundry", "바이오제조", "biomanufactur", "engineering biology"];

  const text = (value, fallback = "") => typeof value === "string" && value.trim() ? value.trim() : fallback;
  const safeUrl = (value) => { try { const u = new URL(value, location.href); return ["http:", "https:"].includes(u.protocol) ? u.href : "#"; } catch { return "#"; } };
  const formatDate = (value) => { const d = new Date(value); return Number.isNaN(d.getTime()) ? text(value) : new Intl.DateTimeFormat("ko-KR", {year:"numeric",month:"2-digit",day:"2-digit"}).format(d); };
  const relevant = (item) => KEYWORDS.some(k => `${item?.title || ""} ${item?.source || ""}`.toLowerCase().includes(k));

  function render(container, items, emptyMessage) {
    container.replaceChildren();
    if (!items.length) { const p=document.createElement("p"); p.className="empty"; p.textContent=emptyMessage; container.appendChild(p); return; }
    items.forEach(item => {
      const row=document.createElement("article"); row.className="data-item";
      const a=document.createElement("a"); a.href=safeUrl(item.url); a.target="_blank"; a.rel="noopener noreferrer";
      const h=document.createElement("h3"); h.className="data-title"; h.textContent=text(item.title,"제목 없음");
      const meta=document.createElement("div"); meta.className="data-meta";
      if (text(item.type)) { const b=document.createElement("span"); b.className="badge"; b.textContent=item.type; meta.appendChild(b); }
      const s=document.createElement("span"); s.textContent=text(item.source,"HsLab"); meta.appendChild(s);
      if (text(item.date)) { const d=document.createElement("span"); d.textContent=formatDate(item.date); meta.appendChild(d); }
      a.append(h,meta); row.appendChild(a); container.appendChild(row);
    });
  }

  async function loadNews() {
    const el=document.querySelector("#synbio-news");
    try {
      const response=await fetch(NEWS_PATH,{cache:"no-store"}); if(!response.ok) throw new Error(response.status);
      const data=await response.json();
      const pool=[...(data.news||[]),...(data.trend||[]),...(data.knowledge||[]),...(data.publication||[])];
      let items=pool.filter(relevant);
      if(!items.length) items=pool;
      items.sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));
      render(el,items.slice(0,6),"표시할 최신 동향이 없습니다.");
    } catch(error) { console.error("합성생물학 뉴스 로딩 실패",error); render(el,[],"최신 동향을 불러오지 못했습니다."); }
  }

  async function loadReports() {
    const el=document.querySelector("#synbio-reports");
    try {
      const response=await fetch(REPORTS_PATH,{cache:"no-store"}); if(!response.ok) throw new Error(response.status);
      const data=await response.json(); const items=Array.isArray(data)?data:(data.reports||[]);
      items.sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));
      render(el,items.slice(0,5),"등록된 보고서가 없습니다.");
    } catch(error) { console.error("보고서 로딩 실패",error); render(el,[],"보고서 목록을 불러오지 못했습니다."); }
  }

  document.addEventListener("DOMContentLoaded",()=>Promise.allSettled([loadNews(),loadReports()]));
})();
