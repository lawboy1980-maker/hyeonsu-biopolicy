async function loadDashboard() {
  const status = document.getElementById('data-status');
  try {
    const response = await fetch('data/dashboard.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    document.getElementById('updated-at').textContent = `업데이트 일자: ${data.updatedAt || '-'}`;
    status.textContent = data.mode === 'live' ? '실시간 연계 데이터' : '대시보드 기본 구조 정상 작동';

    const kpiGrid = document.getElementById('kpi-grid');
    kpiGrid.innerHTML = data.kpis.map(item => `
      <article class="kpi-card">
        <div class="kpi-label">${item.label}</div>
        <div class="kpi-value">${Number(item.value).toLocaleString('ko-KR')} <small>${item.unit || ''}</small></div>
        <div class="kpi-meta">${item.meta || ''}</div>
      </article>
    `).join('');

    const sourceList = document.getElementById('source-list');
    sourceList.innerHTML = data.sources.map(item => `
      <div class="source-item">
        <span class="source-name">${item.name}</span>
        <span class="source-state">${item.state}</span>
      </div>
    `).join('');

    const ctx = document.getElementById('trend-chart');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.trend.map(row => row.year),
        datasets: [
          { label: '업체 수', data: data.trend.map(row => row.companies), tension: .3 },
          { label: '인력 수', data: data.trend.map(row => row.workers), tension: .3 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { beginAtZero: true } }
      }
    });
  } catch (error) {
    status.textContent = '데이터 파일을 불러오지 못했습니다.';
    console.error(error);
  }
}
document.addEventListener('DOMContentLoaded', loadDashboard);
