import { describe, expect, it } from 'vitest';
import { POST } from '@/app/api/analyze/route';

describe('POST /api/analyze', () => {
  it('returns a local result when Firestore is unavailable', async () => {
    const response = await POST(
      new Request('http://localhost/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate: '1990-01-01',
          birthTime: '',
          gender: 'male',
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.id).toMatch(/^local_/);
    expect(body.persisted).toBe(false);
    expect(body.analysis.pillars).toEqual({
      year: '己巳',
      month: '丙子',
      day: '丙寅',
      hour: '미상',
    });
  });

  it('rejects invalid birth data', async () => {
    const response = await POST(
      new Request('http://localhost/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate: '1990-02-31',
          birthTime: '',
          gender: 'male',
        }),
      }),
    );

    expect(response.status).toBe(400);
  });
});
