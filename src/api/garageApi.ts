// src/api/garageApi.ts
import { API_BASE_URL } from '../config';
import type { Car } from '../types';

export async function getCars(page: number = 1, limit: number = 7): Promise<{ cars: Car[]; total: number }> {
  const url = new URL(`${API_BASE_URL}/garage`);
  url.searchParams.append('_page', String(page));
  url.searchParams.append('_limit', String(limit));

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const cars: Car[] = await response.json();
  const total = Number(response.headers.get('X-Total-Count')) || 0;

  return { cars, total };
}