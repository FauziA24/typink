import { useState, useEffect } from "react";
import axios from "axios";
import ForumCard from "@/components/ForumCard/ForumCard";
import Layout from "@/components/ui/layout";
import { getApiURL } from "@/util/constants";
import { ForumData } from "@/util/interfaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Megaphone, PlusIcon, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Forum() {
  const [forums, setForums] = useState<ForumData[]>([]);
  const [allForums, setAllForums] = useState<ForumData[]>([]);
  const [announc, setAnnounc] = useState<ForumData[]>([]);
  const [activeTab, setActiveTab] = useState<"recent" | "all">("recent");
  const [query, setQuery] = useState("");
  const [genres, setGenres] = useState<{ genreId: number; genreTitle: string }[]>([]);
  const [genreId, setGenreId] = useState("");

  const navigate = useNavigate();
  const token = sessionStorage.getItem("typink_web_session");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchForums() {
      try {
        const [announcementResponse, recentResponse, allResponse, genreResponse] =
          await Promise.all([
            axios.get<ForumData[]>(`${getApiURL()}/forum/announcements`),
            axios.get<ForumData[]>(`${getApiURL()}/forum/recent-activity`),
            axios.get<ForumData[]>(`${getApiURL()}/forum/all`),
            axios.get(`${getApiURL()}/genres`),
          ]);

        setAnnounc(announcementResponse.data);
        setForums(recentResponse.data);
        setAllForums(allResponse.data);
        setGenres(genreResponse.data);
      } catch (error) {
        console.error("Error fetching forums:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchForums();
  }, []);

  const visibleForums = (activeTab === "recent" ? forums : allForums).filter(
    (forum) => {
      const normalized = query.trim().toLowerCase();
      if (genreId && String(forum.genreId) !== genreId) return false;
      if (!normalized) return true;
      return [forum.title, forum.content, forum.forumType, forum.users.username]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    }
  );

  if (loading) {
    return (
      <Layout>
        <div className="space-y-8">
          <Skeleton className="h-12 w-full rounded" />
          {Array(5)
            .fill(0)
            .map((_, idx) => (
              <Skeleton key={idx} className="h-36 w-full rounded-lg" />
            ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full">
        <section className="mb-10">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="font-bold text-3xl">Forum</span>
              <p className="text-sm text-gray-500">
                Ikuti pengumuman, diskusi cerita, dan aktivitas terbaru.
              </p>
            </div>
            <Button
              className="w-full rounded-xl bg-[#04D192] hover:bg-[#00B27C] sm:w-auto"
              onClick={() => navigate(token ? `/forum/create` : "/auth")}
            >
              <PlusIcon className="mr-2 " /> Create Post
            </Button>
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Megaphone className="text-[#04D192]" />
            <span className="font-bold text-2xl">Announcements</span>
          </div>
          {announc.map((forum) => (
            <ForumCard key={forum.forumId} forumData={forum} clamp={true} />
          ))}
        </section>

        <section>
          <div className="sticky top-20 z-10 -mx-1 bg-white/95 px-1 pb-4 backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex w-full rounded-lg border p-1 sm:w-auto">
                <Button
                  className="flex-1 sm:flex-none"
                  variant={activeTab === "recent" ? "default" : "ghost"}
                  onClick={() => setActiveTab("recent")}
                >
                  Recent
                </Button>
                <Button
                  className="flex-1 sm:flex-none"
                  variant={activeTab === "all" ? "default" : "ghost"}
                  onClick={() => setActiveTab("all")}
                >
                  All Posts
                </Button>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="pl-10"
                  placeholder="Filter forum"
                />
              </div>
              <select className="h-10 w-full rounded-md border bg-white px-3 sm:w-auto" value={genreId} onChange={(event) => setGenreId(event.target.value)}><option value="">All categories</option>{genres.map((genre) => <option key={genre.genreId} value={genre.genreId}>{genre.genreTitle}</option>)}</select>
            </div>
          </div>

          {visibleForums.length === 0 && (
            <div className="mt-6 rounded-lg border border-dashed p-10 text-center text-gray-500">
              <MessageSquare className="mx-auto mb-3" />
              Belum ada forum yang cocok dengan filter ini.
            </div>
          )}

          {visibleForums.map((forum) => (
            <ForumCard key={forum.forumId} forumData={forum} clamp={true} />
          ))}
        </section>
      </div>
    </Layout>
  );
}
