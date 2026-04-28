'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { getClientAuth, signInWithGoogle, subscribeToAuthChanges } from '@/lib/auth';

type AdminStats = {
  totalUsers: number;
  premiumUsers: number;
  todayUsers: number;
  todayRevenue: number;
  totalRevenue: number;
  failedPaymentCount: number;
};

type AdminDoc = Record<string, unknown> & { id: string };

async function authedFetch(path: string, init?: RequestInit) {
  const user = getClientAuth().currentUser;
  if (!user) throw new Error('LOGIN_REQUIRED');
  const token = await user.getIdToken();

  return fetch(path, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminDoc[]>([]);
  const [payments, setPayments] = useState<AdminDoc[]>([]);
  const [logs, setLogs] = useState<AdminDoc[]>([]);
  const [query, setQuery] = useState('');
  const [targetUid, setTargetUid] = useState('');
  const [credits, setCredits] = useState(1);
  const [message, setMessage] = useState('');

  const loadDashboard = useCallback(async () => {
    setMessage('');
    try {
      const [statsRes, usersRes, paymentsRes, logsRes] = await Promise.all([
        authedFetch('/api/admin/stats'),
        authedFetch(`/api/admin/users${query ? `?q=${encodeURIComponent(query)}` : ''}`),
        authedFetch('/api/admin/payments'),
        authedFetch('/api/admin/usage-logs'),
      ]);

      const [statsJson, usersJson, paymentsJson, logsJson] = await Promise.all([
        statsRes.json(),
        usersRes.json(),
        paymentsRes.json(),
        logsRes.json(),
      ]);

      if (!statsJson.success) throw new Error(statsJson.message || 'STATS_FAILED');

      setStats(statsJson.stats);
      setUsers(usersJson.users ?? []);
      setPayments(paymentsJson.payments ?? []);
      setLogs(logsJson.logs ?? []);
    } catch (error) {
      console.error(error);
      setMessage('관리자 권한이 필요합니다. admin Custom Claim을 확인하세요.');
    }
  }, [query]);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      if (user) void loadDashboard();
    });
    return () => unsubscribe();
  }, [loadDashboard]);

  const login = async () => {
    const user = await signInWithGoogle();
    const token = await user.getIdToken();
    await fetch('/api/auth/sync-user', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    await loadDashboard();
  };

  const grantCredits = async () => {
    const res = await authedFetch('/api/admin/grant-credits', {
      method: 'POST',
      body: JSON.stringify({ targetUid, credits, reason: 'ADMIN_MANUAL_GRANT' }),
    });
    const data = await res.json();
    setMessage(data.success ? '크레딧을 지급했습니다.' : data.message || '지급 실패');
    await loadDashboard();
  };

  const markRefunded = async (merchantUid: string) => {
    const res = await authedFetch('/api/admin/mark-refunded', {
      method: 'POST',
      body: JSON.stringify({ merchantUid, reason: 'ADMIN_MANUAL_REFUND' }),
    });
    const data = await res.json();
    setMessage(data.success ? '환불 상태로 표시했습니다.' : data.message || '환불 처리 실패');
    await loadDashboard();
  };

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold text-white/42">SAJU ENGINE ADMIN</p>
            <h1 className="mt-2 text-3xl font-black">관리자 대시보드</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={login} className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-black">
              Google 로그인
            </button>
            <button onClick={loadDashboard} className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-black">
              새로고침
            </button>
          </div>
        </header>

        {message && (
          <div className="rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm font-bold text-amber-100">
            {message}
          </div>
        )}

        <section className="grid gap-3 md:grid-cols-6">
          <Stat label="총 회원" value={stats?.totalUsers ?? 0} />
          <Stat label="유료/크레딧 보유" value={stats?.premiumUsers ?? 0} />
          <Stat label="오늘 가입" value={stats?.todayUsers ?? 0} />
          <Stat label="오늘 매출" value={`${(stats?.todayRevenue ?? 0).toLocaleString()}원`} />
          <Stat label="누적 매출" value={`${(stats?.totalRevenue ?? 0).toLocaleString()}원`} />
          <Stat label="실패 결제" value={stats?.failedPaymentCount ?? 0} />
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[2rem] border border-white/10 bg-[#080b12] p-5">
            <div className="flex gap-2">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="이메일, 이름, UID 검색"
                className="flex-1 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm outline-none"
              />
              <button onClick={loadDashboard} className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-black">
                검색
              </button>
            </div>
            <DataList title="회원" items={users} fields={['email', 'displayName', 'role', 'paidDecisionCredits', 'totalDecisionCount']} />
          </div>

          <div className="space-y-4 rounded-[2rem] border border-white/10 bg-[#080b12] p-5">
            <h2 className="font-black">프리미엄 수동 지급</h2>
            <input
              value={targetUid}
              onChange={(event) => setTargetUid(event.target.value)}
              placeholder="targetUid"
              className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm outline-none"
            />
            <input
              type="number"
              min={1}
              max={100}
              value={credits}
              onChange={(event) => setCredits(Number(event.target.value))}
              className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm outline-none"
            />
            <button onClick={grantCredits} className="w-full rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-black text-black">
              크레딧 지급
            </button>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-[#080b12] p-5">
            <DataList
              title="최근 결제"
              items={payments}
              fields={['merchantUid', 'uid', 'productName', 'amount', 'status']}
              action={(item) =>
                item.status === 'PAID' && typeof item.merchantUid === 'string' ? (
                  <button onClick={() => markRefunded(item.merchantUid as string)} className="rounded-xl bg-red-400/15 px-3 py-2 text-xs font-bold text-red-100">
                    환불 표시
                  </button>
                ) : null
              }
            />
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-[#080b12] p-5">
            <DataList title="최근 사용 로그" items={logs} fields={['uid', 'mode', 'isPremiumAtUse', 'question']} />
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-xs font-bold text-white/42">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function DataList({
  title,
  items,
  fields,
  action,
}: {
  title: string;
  items: AdminDoc[];
  fields: string[];
  action?: (item: AdminDoc) => ReactNode;
}) {
  return (
    <div className="mt-5 space-y-3">
      <h2 className="font-black">{title}</h2>
      <div className="space-y-2">
        {items.slice(0, 20).map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/10 bg-black/25 p-4 text-xs text-white/58">
            <p className="mb-2 font-mono text-white/32">{item.id}</p>
            <div className="grid gap-1">
              {fields.map((field) => (
                <p key={field}>
                  <span className="font-bold text-white/72">{field}: </span>
                  {String(item[field] ?? '-')}
                </p>
              ))}
            </div>
            {action && <div className="mt-3">{action(item)}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
