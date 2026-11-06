import Layout from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiURL } from "@/util/constants";
import { Transaction } from "@/util/interfaces";
import axios from "axios";
import { Receipt } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

export default function Transactions() {
  const [myTransactions, setMyTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = sessionStorage.getItem("typink_user_id");
  const token = sessionStorage.getItem("typink_web_session");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !userId) {
      toast({
        title: "Login required",
        description: "Please log in from the profile menu to view transactions.",
      });
      navigate("/auth");
      return;
    }

    async function fetchData() {
      try {
        const response = await axios.get<Transaction[]>(
          `${getApiURL()}/donations/transactions/${userId}`,
          {
            headers: { },
          }
        );
        setMyTransactions(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [navigate, token, userId]);

  return (
    <Layout>
      <h1 className="text-5xl font-semibold">My Transactions</h1>
      <p className="mt-3 rounded border border-amber-300 bg-amber-50 p-3 text-sm"><strong>Demo payment, no real money processed.</strong> Semua transaksi di halaman ini adalah simulasi.</p>
      {loading && (
        <div className="grid grid-cols-3 grid-flow-row gap-4 mt-6">
          {Array(6)
            .fill(0)
            .map((_, idx) => (
              <Skeleton key={idx} className="h-[350px] w-full rounded" />
            ))}
        </div>
      )}
      <div className="space-y-4 pt-10">
        {!loading && myTransactions.length === 0 && (
          <div className="rounded-lg border border-dashed p-10 text-center text-gray-500">
            <Receipt className="mx-auto mb-3" />
            Belum ada transaksi di akun ini.
          </div>
        )}
        {myTransactions.map((item) => (
          <div key={item.transactionId} className="border-black w-full border-2 rounded-lg p-4 space-y-4 flex flex-row justify-between items-center">
            <div className="space-y-4">
              <h1 className="text-3xl">{item.transactionType}</h1>
              <h2 className="text-lg">Rp. {item.value.toLocaleString()}</h2>
              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                {item.paymentMethod && <span>{item.paymentMethod}</span>}
                {item.provider && <span className="capitalize">{item.provider}</span>}
                {item.status && (
                  <span className="rounded-full border px-2 py-0.5 capitalize">
                    {item.status}
                  </span>
                )}
              </div>
            </div>
            <span>{new Date(item.created_at).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </Layout>
  );
}
