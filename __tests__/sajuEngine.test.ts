import { describe, expect, it } from 'vitest';
import { analyzeSaju } from '@/lib/sajuEngine';

describe('analyzeSaju', () => {
  it('calculates four pillars using lunar-javascript reference cases', () => {
    expect(
      analyzeSaju({
        birthDate: '2005-12-23',
        birthTime: '08:37',
        gender: 'male',
      }).pillars
    ).toEqual({
      year: '乙酉',
      month: '戊子',
      day: '辛巳',
      hour: '壬辰',
    });

    expect(
      analyzeSaju({
        birthDate: '1988-02-15',
        birthTime: '23:30',
        gender: 'female',
      }).pillars
    ).toEqual({
      year: '戊辰',
      month: '甲寅',
      day: '庚子',
      hour: '戊子',
    });
  });

  it('does not infer an hour pillar when birth time is omitted', () => {
    const analysis = analyzeSaju({
      birthDate: '1990-01-01',
      gender: 'male',
    });

    expect(analysis.time_known).toBe(false);
    expect(analysis.confidence_note).toContain('6글자 기준');
    expect(analysis.pillars).toEqual({
      year: '己巳',
      month: '丙子',
      day: '丙寅',
      hour: '미상',
    });
    expect(
      Object.values(analysis.element_distribution).reduce((sum, count) => sum + count, 0)
    ).toBe(6);
    expect(analysis.element_profile.total_count).toBe(6);
    expect(analysis.element_profile.summary).toContain('시간 미상');
  });

  it('includes the hour pillar in element distribution when birth time is provided', () => {
    const analysis = analyzeSaju({
      birthDate: '1990-01-01',
      birthTime: '12:00',
      gender: 'male',
    });

    expect(analysis.time_known).toBe(true);
    expect(analysis.confidence_note).toContain('8글자 기준');
    expect(analysis.pillars.hour).toBe('甲午');
    expect(
      Object.values(analysis.element_distribution).reduce((sum, count) => sum + count, 0)
    ).toBe(8);
    expect(analysis.element_profile.total_count).toBe(8);
    expect(analysis.element_profile.balance_score).toBeGreaterThanOrEqual(0);
    expect(analysis.element_profile.balance_score).toBeLessThanOrEqual(100);
    expect(analysis.day_master_profile.core).toContain('발산형');
  });
});
