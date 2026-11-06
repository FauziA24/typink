import ForumCard from "@/components/ForumCard/ForumCard";
import Layout from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiURL } from "@/util/constants";
import { ForumData } from "@/util/interfaces";
import axios from "axios";
import { MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ForumCategory() {
  const { category } = useParams();
  const [forums, setForums] = useState<ForumData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get<ForumData[]>(
          `${getApiURL()}/forum/search?query=${encodeURIComponent(category || "")}`,
        );
        setForums(response.data);
      } catch (error) {
        console.error("Error fetching forum category:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [category]);

  return (
    <Layout>
      <h1 className="text-3xl font-semibold mb-6">Forum: {category}</h1>
      {loading ? (
        <div className="space-y-4">
          {Array(4)
            .fill(0)
            .map((_, idx) => (
              <Skeleton key={idx} className="h-36 w-full rounded-lg" />
            ))}
        </div>
      ) : forums.length > 0 ? (
        forums.map((forum) => <ForumCard key={forum.forumId} forumData={forum} clamp={true} />)
      ) : (
        <div className="rounded-lg border border-dashed p-10 text-center text-gray-500">
          <MessageSquare className="mx-auto mb-3" />
          Belum ada forum yang cocok dengan kategori ini.
        </div>
      )}
    </Layout>
  );
}
