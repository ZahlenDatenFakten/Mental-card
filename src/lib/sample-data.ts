import { MindNode } from '../types/mindmap';

export const INITIAL_MIND_MAP: MindNode = {
  id: 'root-node',
  title: 'Архитектура веб-сервиса',
  notes: 'Комплексный обзор архитектурных компонентов современного высоконагруженного веб-приложения.',
  color: '#10b981',
  priority: 'high',
  tags: ['архитектура', 'v2.0'],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  children: [
    {
      id: 'node-frontend',
      title: 'Frontend (Клиент)',
      notes: 'SPA / SSR на React с максимальным фокусом на UX и производительность.',
      color: '#38bdf8',
      priority: 'high',
      tags: ['ui', 'react'],
      children: [
        {
          id: 'node-ui-stack',
          title: 'Стек интерфейса',
          children: [
            { id: 'node-react', title: 'React 19 + TypeScript', url: 'https://react.dev' },
            { id: 'node-tailwind', title: 'Tailwind CSS (Zinc/Slate)', url: 'https://tailwindcss.com' },
            { id: 'node-lucide', title: 'Lucide Icons (Вектор)' },
          ],
        },
        {
          id: 'node-state-mgmt',
          title: 'Управление состоянием',
          children: [
            { id: 'node-zustand', title: 'Zustand + Temporal History', notes: 'Легковесный стор с поддержкой Undo/Redo' },
            { id: 'node-tanstack', title: 'TanStack Query (Кэширование API)' },
          ],
        },
        {
          id: 'node-performance',
          title: 'Оптимизация Core Web Vitals',
          children: [
            { id: 'node-virtualization', title: 'Virtual Scrolling & Canvas' },
            { id: 'node-lazy', title: 'Code Splitting & Lazy Loading' },
          ],
        },
      ],
    },
    {
      id: 'node-backend',
      title: 'Backend & Data',
      notes: 'Микросервисная архитектура с распределенным кэшированием.',
      color: '#a78bfa',
      priority: 'high',
      tags: ['backend', 'db'],
      children: [
        {
          id: 'node-api-layer',
          title: 'API Gateway',
          children: [
            { id: 'node-rest', title: 'RESTful API (OpenAPI 3.1)' },
            { id: 'node-ws', title: 'WebSocket (Real-time синхронизация)' },
            { id: 'node-auth', title: 'JWT + OAuth2 (Access/Refresh)' },
          ],
        },
        {
          id: 'node-storage',
          title: 'Базы данных и кэш',
          children: [
            { id: 'node-pg', title: 'PostgreSQL (Основное хранилище)' },
            { id: 'node-redis', title: 'Redis (Кэш сессий и Rate Limiter)' },
            { id: 'node-s3', title: 'S3-compatible Object Storage' },
          ],
        },
      ],
    },
    {
      id: 'node-devops',
      title: 'DevOps & Инфраструктура',
      color: '#fb923c',
      priority: 'medium',
      tags: ['ci-cd', 'cloud'],
      children: [
        {
          id: 'node-ci',
          title: 'CI/CD Пайплайн',
          children: [
            { id: 'node-gh-actions', title: 'GitHub Actions (Linter, Tests, Build)' },
            { id: 'node-docker', title: 'Docker Multi-stage Builds' },
          ],
        },
        {
          id: 'node-monitoring',
          title: 'Мониторинг и логи',
          children: [
            { id: 'node-prom', title: 'Prometheus + Grafana' },
            { id: 'node-sentry', title: 'Sentry (Отслеживание исключений)' },
          ],
        },
      ],
    },
    {
      id: 'node-security',
      title: 'Безопасность',
      color: '#f472b6',
      priority: 'high',
      tags: ['security', 'compliance'],
      children: [
        { id: 'node-cors', title: 'Strict CORS & CSP Headers' },
        { id: 'node-rate-limit', title: 'DDoS & Rate Limiting (Token Bucket)' },
        { id: 'node-rbac', title: 'RBAC (Role-Based Access Control)' },
      ],
    },
  ],
};
