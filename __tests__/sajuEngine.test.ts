import { describe, expect, it } from 'vitest';
import { buildDecisionCoachResult } from '@/lib/decisionCoach';
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
    expect(analysis.detailed_reading.basis).toContain('시주 미상');
    expect(analysis.detailed_reading.timing).toContain('시주는 해석하지 않았습니다');
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
    expect(analysis.detailed_reading.basis).toContain('시주 甲午');
    expect(analysis.detailed_reading.reliability_note).toContain('일간 중심');
    expect(analysis.viral_character?.share_lines).toHaveLength(3);
    expect(analysis.viral_character?.one_liner.length).toBeGreaterThanOrEqual(15);
  });

  it('creates different decision coaching frames by category and question', () => {
    const analysis = analyzeSaju({
      birthDate: '1990-01-01',
      birthTime: '12:00',
      gender: 'male',
    });

    const career = buildDecisionCoachResult(
      analysis,
      '지금 이직을 해야 할까?',
      'career',
    );
    const money = buildDecisionCoachResult(
      analysis,
      '코인을 지금 매수할까 아니면 기준까지 기다릴까?',
      'money',
    );
    const love = buildDecisionCoachResult(
      analysis,
      '이 관계를 이별로 정리해야 할까?',
      'love',
    );

    expect(career.choices.map((choice) => choice.label)).toEqual(['이동한다', '현재 판에서 조건을 바꾼다']);
    expect(money.choices.map((choice) => choice.label)).toEqual(['코인을 지금 매수할까', '기준까지 기다릴까']);
    expect(love.choices.map((choice) => choice.label)).toEqual(['관계를 정리한다', '거리를 두고 확인한다']);
    expect(career.one_line_guide).not.toBe(money.one_line_guide);
    expect(money.recommended_action).toContain('손실 한도');
    expect(love.recommended_action).toContain('반복해서 보여주는 행동');
    expect(career.choices[0].first_action).toContain('역할');
    expect(career.decision_basis).toContain('강점');
  });
});
