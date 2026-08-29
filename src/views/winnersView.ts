// src/views/winnersView.ts
import type { WinnerWithCar } from '../api/winnersApi';

export function renderWinnersView(
  winners: WinnerWithCar[],
  total: number,
  currentPage: number,
  sortField: 'wins' | 'time' | null,
  sortOrder: 'ASC' | 'DESC'
): string {
  const totalPages = Math.ceil(total / 10);

  return `
    <div class="winners-container">
      <header class="winners-header">
        <h2>🏆 Winners</h2>
        <span class="winners-count">Total: ${total}</span>
      </header>

      <div class="winners-table-wrapper">
        <table class="winners-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Car</th>
              <th>Name</th>
              <th 
                class="sortable ${sortField === 'wins' ? 'active' : ''}"
                data-sort="wins"
              >
                Wins ${sortField === 'wins' ? (sortOrder === 'ASC' ? '▲' : '▼') : ''}
              </th>
              <th 
                class="sortable ${sortField === 'time' ? 'active' : ''}"
                data-sort="time"
              >
                Best time (s) ${sortField === 'time' ? (sortOrder === 'ASC' ? '▲' : '▼') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            ${winners.length === 0 ? `
              <tr>
                <td colspan="5" class="empty">No winners yet. Start a race!</td>
              </tr>
            ` : winners.map((winner, index) => `
              <tr>
                <td>${(currentPage - 1) * 10 + index + 1}</td>
                <td>
                  <span class="winner-color" style="background-color: ${winner.color}"></span>
                </td>
                <td>${winner.name}</td>
                <td>${winner.wins}</td>
                <td>${winner.time.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="pagination winners-pagination">
        <button 
          class="btn-pagination" 
          id="winners-prev" 
          ${currentPage <= 1 ? 'disabled' : ''}
        >
          ◀ Previous
        </button>
        <span class="page-info">Page ${currentPage} of ${totalPages || 1}</span>
        <button 
          class="btn-pagination" 
          id="winners-next" 
          ${currentPage >= totalPages ? 'disabled' : ''}
        >
          Next ▶
        </button>
      </div>
    </div>
  `;
}

export function setupWinnersListeners(
  onPageChange: (page: number) => void,
  onSort: (field: 'wins' | 'time', order: 'ASC' | 'DESC') => void,
  currentSortField: 'wins' | 'time' | null,
  currentSortOrder: 'ASC' | 'DESC'
): void {
  // Пагинация
  const prevBtn = document.getElementById('winners-prev');
  const nextBtn = document.getElementById('winners-next');

  prevBtn?.addEventListener('click', () => {
    const pageInfo = document.getElementById('winners-page-info');
    if (pageInfo) {
      const currentPage = parseInt(pageInfo.textContent?.match(/\d+/)?.[0] || '1');
      if (currentPage > 1) {
        onPageChange(currentPage - 1);
      }
    }
  });

  nextBtn?.addEventListener('click', () => {
    const pageInfo = document.getElementById('winners-page-info');
    if (pageInfo) {
      const currentPage = parseInt(pageInfo.textContent?.match(/\d+/)?.[0] || '1');
      onPageChange(currentPage + 1);
    }
  });

  // Сортировка
  document.querySelectorAll('.sortable').forEach((header) => {
    header.addEventListener('click', () => {
      const field = header.getAttribute('data-sort') as 'wins' | 'time';
      if (!field) return;

      // Определяем новый порядок
      let newOrder: 'ASC' | 'DESC' = 'ASC';
      if (currentSortField === field && currentSortOrder === 'ASC') {
        newOrder = 'DESC';
      }

      onSort(field, newOrder);
    });
  });
}