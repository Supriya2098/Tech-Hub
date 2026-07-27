process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/techhub_test';
process.env.JWT_ACCESS_SECRET ??= 'test-access-secret-please-ignore-1234';
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret-please-ignore-5678';
process.env.CORS_ORIGIN ??= 'http://localhost:5173';
