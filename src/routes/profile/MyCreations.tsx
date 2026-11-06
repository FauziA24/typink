import LiteratureCard from "@/components/LiteratureCard/LiteratureCard";
import Layout from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiURL } from "@/util/constants";
import { Literature } from "@/util/interfaces";
import axios from "axios";
import { BookOpen, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

export default function MyCreations() {
  const [myCreations, setMyCreations] = useState<Literature[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = sessionStorage.getItem("typink_user_id");
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionStorage.getItem("typink_web_session") || !userId) {
      toast({
        title: "Login required",
        description: "Please log in from the profile menu to view your creations.",
      });
      navigate("/auth");
      return;
    }

    async function fetchData() {
      try {
        const response = await axios.get<Literature[]>(
          `${getApiURL()}/literature/author/${userId}`
        );
        setMyCreations(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [navigate, userId]);

  return (
    <Layout>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold">My Creations</h1>
          <p className="text-gray-500">Kelola cerita yang kamu tulis di Typink.</p>
        </div>
        <Button onClick={() => navigate("/novel/create")}>
          <Plus className="mr-2 h-4 w-4" />
          New Story
        </Button>
      </div>
      {loading && (
        <div className="grid grid-cols-3 grid-flow-row gap-4 mt-6">
          {Array(6)
            .fill(0)
            .map((_, idx) => (
              <Skeleton key={idx} className="h-[350px] w-full rounded" />
            ))}
        </div>
      )}
      {!loading && myCreations.length === 0 && (
        <div className="mt-8 rounded-lg border border-dashed p-12 text-center">
          <BookOpen className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold">Belum ada cerita</h2>
          <p className="mt-2 text-gray-500">
            Mulai tulis cerita pertama agar muncul di profil dan katalog.
          </p>
          <Button className="mt-6" onClick={() => navigate("/novel/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Story
          </Button>
        </div>
      )}
      <div className="grid grid-cols-3 grid-flow-row gap-4 mt-6">
        {myCreations.map((item) => (
          <LiteratureCard key={item.literatureId} item={item} />
        ))}
      </div>
    </Layout>
  );
}
