import axios from 'axios';
import { getSecureItem } from './client';

// Dedicated Base URL for Career Advisor Microservice / Endpoints
export const ADVISOR_API_BASE_URL = 'https://smart-skills-india.onrender.com/api/v1';

export const advisorApiClient = axios.create({
  baseURL: ADVISOR_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach registration or auth tokens
advisorApiClient.interceptors.request.use(async (config) => {
  const token = await getSecureItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});