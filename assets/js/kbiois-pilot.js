(() => {
  const DATA_URL = "data/kbiois-pilot.json";
  const charts = [];

  const number = (value) => new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 1 }).format(value ?? 0);
  const formatValue = (item) => {
    const value = item?.latest?.total ?? 0;
    if (item.id === "production") return `${number(value / 1_000_000)}조원`;
    return `${number(value)}${item.unit}`;
  };
  const formatDate = (iso) => iso ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeZone: "Asia/Seoul" }).format(new Date(iso)) : "미갱신";

  function renderEmpty(panel, message) {
    panel.innerHTML = `<div class="kbiois-empty"><strong>KBIOIS 데이터가 아직 생성되지 않았습니다.</strong><p>${message}</p></div>`;
  }

  function renderCards(data) {
    const cards = document.getElementById("kbioisKpiGrid");
    cards.innerHTML = data.indicators.map(item => {
      const rate = item.change_rate;
      const direction = rate == null ? "" : rate >= 0 ? "▲" : "▼";
      return `<article class="kbiois-kpi-card">
        <span>${item.title}</span>
        <strong>${formatValue(item)}</strong>
        <small>${item.latest?.year ?? "-"}년 · ${rate == null ? "증감률 산출 전" : `${direction} ${Math.abs(rate).toFixed(1)}%`}</small>
      </article>`;
    }).join("");
  }

  function renderCharts(data) {
    const host = document.getElementById("kbioisCharts");
    host.innerHTML = data.indicators.map(item => `<article class="kbiois-chart-card">
      <div class="kbiois-chart-head"><div><span>KBIOIS PILOT</span><h3>${item.title}</h3></div><select data-indicator="${item.id}" aria-label="${item.title} 연도 선택"></select></div>
      <div class="kbiois-chart-wrap"><canvas id="kbiois-${item.id}-trend"></canvas></div>
      <div class="kbiois-chart-wrap"><canvas id="kbiois-${item.id}-fields"></canvas></div>
    </article>`).join("");

    data.indicators.forEach(item => {
      const select = host.querySelector(`select[data-indicator="${item.id}"]`);
      item.series.slice().reverse().forEach(point => select.insertAdjacentHTML("beforeend", `<option value="${point.year}">${point.year}년</option>`));
      const trend = new Chart(document.getElementById(`kbiois-${item.id}-trend`), {
        type: "line",
        data: { labels: item.series.map(x => x.year), datasets: [{ label: "전체", data: item.series.map(x => x.total), tension: 0.25 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      });
      charts.push(trend);

      let fieldChart;
      const drawFields = (year) => {
        const point = item.series.find(x => String(x.year) === String(year)) || item.latest;
        const fields = (point?.fields || []).slice(0, 12);
        if (fieldChart) fieldChart.destroy();
        fieldChart = new Chart(document.getElementById(`kbiois-${item.id}-fields`), {
          type: "bar",
          data: { labels: fields.map(x => x.name), datasets: [{ label: `${point?.year ?? ""}년 분야별`, data: fields.map(x => x.value) }] },
          options: { indexAxis: "y", responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
      };
      select.addEventListener("change", () => drawFields(select.value));
      drawFields(select.value || item.latest?.year);
    });
  }

  async function init() {
    const panel = document.getElementById("kbioisPilotPanel");
    if (!panel) return;
    try {
      const response = await fetch(`${DATA_URL}?v=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      document.getElementById("kbioisUpdatedAt").textContent = `업데이트 ${formatDate(data.generated_at)}`;
      if (!Array.isArray(data.indicators) || data.indicators.length === 0) {
        renderEmpty(document.getElementById("kbioisKpiGrid"), "GitHub Actions의 Update KBIOIS Pilot 워크플로를 실행해 주세요.");
        return;
      }
      renderCards(data);
      renderCharts(data);
    } catch (error) {
      renderEmpty(document.getElementById("kbioisKpiGrid"), `데이터 로딩 오류: ${error.message}`);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
