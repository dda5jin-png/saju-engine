import PortOnePaymentButton from "@/components/payments/PortOnePaymentButton";

export default function PremiumPage() {
  return (
    <main className="min-h-screen bg-black px-5 py-12 text-white">
      <div className="mx-auto max-w-md space-y-8">
        <header className="space-y-3 text-center">
          <span className="inline-flex rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-[11px] font-bold text-amber-100">
            PREMIUM
          </span>
          <h1 className="text-3xl font-black">프리미엄 분석 열기</h1>
          <p className="text-sm leading-6 text-white/58">
            자동갱신 없이 필요한 만큼만 결제하고, 연애·돈·커리어 선택지를 더 깊게 비교하세요.
          </p>
        </header>

        <section className="space-y-4 rounded-[2rem] border border-white/10 bg-[#080b12] p-6">
          <PortOnePaymentButton productId="decision_single" />
          <PortOnePaymentButton productId="decision_pack_3" variant="compact" />
          <PortOnePaymentButton productId="decision_pack_5" variant="compact" />
        </section>
      </div>
    </main>
  );
}
