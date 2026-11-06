import { useState, useEffect } from "react";
import axios from "axios";
import LiteratureCard from "../LiteratureCard/LiteratureCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiURL } from "@/util/constants";
import { Literature } from "@/util/interfaces";

export default function Latest() {
  const [latestData, setLatestData] = useState<Literature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get<Literature[]>(`${getApiURL()}/literature/latest-updates?limit=9`);
        setLatestData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-3 grid-flow-row gap-4 mt-6">
        {Array(6)
          .fill(0)
          .map((_, idx) => (
            <Skeleton key={idx} className="h-[350px] w-full rounded-sm" />
          ))}
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div>
        <h1 className="font-bold text-4xl">Latest Updates</h1>
        <h6 className="mb-3 text-gray-500">Freshly released fiction from Typink creators</h6>
        <hr />
      </div>
      <div className="grid grid-cols-3 grid-flow-row gap-4 mt-6">
        {latestData.slice(0, 9).map((item) => (
          <LiteratureCard key={item.literatureId} item={item} />
        ))}
      </div>
    </div>
  );
}
