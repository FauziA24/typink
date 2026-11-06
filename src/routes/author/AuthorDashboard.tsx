import axios from "axios";
import { useCallback, useEffect, useState } from "react";

import ProfileLayout from "@/components/layouts/ProfileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiURL } from "@/util/constants";

const money = (value = 0) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

type DashboardSummary = Record<string, number>;
type DonorTransaction = {
  transactionId: number;
  value: number;
  netAmount?: number;
  donor: { username: string };
};
type DashboardData = { summary: DashboardSummary; donors: DonorTransaction[] };
type PayoutData = {
  balance: { availableAmount: number };
  payouts: Array<{ payoutRequestId: number; amount: number; status: string }>;
};

export default function AuthorDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [payout, setPayout] = useState<PayoutData | null>(null);
  const [loadError, setLoadError] = useState("");
  const [amount, setAmount] = useState("");
  const [destinationType, setDestinationType] = useState("bank");
  const [destinationAccount, setDestinationAccount] = useState("");

  const load = useCallback(async () => {
    try {
      setLoadError("");
      const headers = { };
      const [dashboardResponse, payoutResponse] = await Promise.all([
        axios.get<DashboardData>(`${getApiURL()}/author/dashboard`, { headers }),
        axios.get<PayoutData>(`${getApiURL()}/author/payouts`, { headers }),
      ]);
      setDashboard(dashboardResponse.data); setPayout(payoutResponse.data);
    } catch {
      setLoadError("Silakan masuk untuk membuka dashboard author.");
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const requestPayout = async () => {
    const headers = { };
    await axios.put(`${getApiURL()}/author/payout-settings`, { destinationType, destinationAccount }, { headers });
    await axios.post(`${getApiURL()}/author/payouts`, { amount: Number(amount), destinationType, destinationAccount }, { headers });
    setAmount(""); await load();
  };

  if (loadError) return <ProfileLayout><p role="alert">{loadError}</p></ProfileLayout>;
  if (!dashboard || !payout) return <ProfileLayout><p>Loading dashboard...</p></ProfileLayout>;
  return <ProfileLayout><h1 className="mb-6 text-3xl font-bold">Author dashboard</h1>
    <p className="mb-5 rounded border border-amber-300 bg-amber-50 p-3 text-sm"><strong>Demo payment, no real money processed.</strong> Balance dan payout di bawah ini hanya simulasi.</p>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-6">{Object.entries(dashboard.summary).map(([key, value]) => <div className="rounded border p-3" key={key}><p className="text-xs uppercase text-gray-500">{key}</p><strong>{key === "donations" ? money(Number(value)) : String(value)}</strong></div>)}</div>
    <h2 className="mb-3 mt-8 text-xl font-semibold">Balance & payout</h2><p className="mb-3">Available: <strong>{money(payout.balance.availableAmount)}</strong></p>
    <div className="grid gap-2 md:grid-cols-4"><select className="rounded border px-3" value={destinationType} onChange={(e) => setDestinationType(e.target.value)}><option value="bank">Bank</option><option value="ewallet">E-wallet</option></select><Input placeholder="Destination account" value={destinationAccount} onChange={(e) => setDestinationAccount(e.target.value)} /><Input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} /><Button onClick={requestPayout}>Request payout</Button></div>
    <h2 className="mb-3 mt-8 text-xl font-semibold">Recent donors</h2>{dashboard.donors.length === 0 ? <p>No donations yet.</p> : dashboard.donors.map((item) => <div className="mb-2 flex justify-between rounded border p-3" key={item.transactionId}><span>{item.donor.username}</span><strong>{money(item.netAmount || item.value)}</strong></div>)}
  </ProfileLayout>;
}
