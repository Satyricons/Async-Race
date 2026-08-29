// src/api/winnersApi.ts
import { API_BASE_URL } from '../config';

export interface Winner {
  id: number;       // id машины
  wins: number;     // количество побед
  time: number;     // лучшее время (в секундах)
}

export interface WinnerWithCar extends Winner {
  name: string;
  color: string;
}

export interface WinnersResponse {
  winners: WinnerWithCar[];
  total: number;
}

// Получить список победителей с пагинацией и сортировкой
export async function getWinners(
  page: number = 1,
  limit: number = 10,
  sort?: 'wins' | 'time',
  order?: 'ASC' | 'DESC'
): Promise<WinnersResponse> {
  const url = new URL(`${API_BASE_URL}/winners`);
  url.searchParams.append('_page', String(page));
  url.searchParams.append('_limit', String(limit));
  
  if (sort) {
    url.searchParams.append('_sort', sort);
    url.searchParams.append('_order', order || 'ASC');
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Failed to get winners: ${response.status}`);
  }

  const winners: Winner[] = await response.json();
  const total = Number(response.headers.get('X-Total-Count')) || 0;

  // Получаем данные о машинах для каждого победителя
  const winnersWithCars = await Promise.all(
    winners.map(async (winner) => {
      try {
        const carResponse = await fetch(`${API_BASE_URL}/garage/${winner.id}`);
        if (!carResponse.ok) {
          return {
            ...winner,
            name: `Car #${winner.id}`,
            color: '#000000',
          };
        }
        const car = await carResponse.json();
        return {
          ...winner,
          name: car.name,
          color: car.color,
        };
      } catch {
        return {
          ...winner,
          name: `Car #${winner.id}`,
          color: '#000000',
        };
      }
    })
  );

  return {
    winners: winnersWithCars,
    total,
  };
}

// Создать нового победителя
export async function createWinner(id: number, wins: number, time: number): Promise<Winner> {
  const response = await fetch(`${API_BASE_URL}/winners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, wins, time }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create winner: ${response.status}`);
  }

  return response.json();
}

// Обновить победителя
export async function updateWinner(id: number, wins: number, time: number): Promise<Winner> {
  const response = await fetch(`${API_BASE_URL}/winners/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wins, time }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update winner: ${response.status}`);
  }

  return response.json();
}

// Получить победителя по id
export async function getWinner(id: number): Promise<Winner | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/winners/${id}`);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Failed to get winner: ${response.status}`);
    }
    return response.json();
  } catch {
    return null;
  }
}

// Удалить победителя
export async function deleteWinner(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/winners/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete winner: ${response.status}`);
  }
}