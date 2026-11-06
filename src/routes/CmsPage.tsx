import axios from "axios";
import { useEffect, useState } from "react";
import Layout from "@/components/ui/layout";
import { getApiURL } from "@/util/constants";

export default function CmsPage({ page }: { page: "terms" | "privacy" | "credits" }) {
  const [content, setContent] = useState("");
  useEffect(() => { axios.get(`${getApiURL()}/cms/settings/homepage`).then((response) => setContent(String(response.data.value?.[page] || "Content has not been published."))); }, [page]);
  return <Layout leftBar={false} rightBar={false}><article className="mx-auto max-w-3xl whitespace-pre-wrap py-10"><h1 className="mb-6 text-4xl font-bold capitalize">{page}</h1>{content}</article></Layout>;
}
