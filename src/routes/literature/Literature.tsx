import LiteratureCard from "@/components/LiteratureCard/LiteratureCard";
import Layout from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiURL } from "@/util/constants";
import { Literature as LiteratureItem } from "@/util/interfaces";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Literature() {
  const [items, setItems] = useState<LiteratureItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get<LiteratureItem[]>(
          `${getApiURL()}/literature/latest-updates?limit=24`,
        );
        setItems(response.data);
      } catch (error) {
        console.error("Error fetching literature:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <Layout>
      <div className="mt-6">
        <h1 className="font-bold text-4xl">Literature</h1>
        <p className="mb-3 text-gray-500">Browse the latest stories from Typink creators.</p>
        <hr />
        {loading ? (
          <div className="grid grid-cols-3 grid-flow-row gap-4 mt-6">
            {Array(6)
              .fill(0)
              .map((_, idx) => (
                <Skeleton key={idx} className="h-[350px] w-full rounded-sm" />
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 grid-flow-row gap-4 mt-6">
            {items.map((item) => (
              <LiteratureCard key={item.literatureId} item={item} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
