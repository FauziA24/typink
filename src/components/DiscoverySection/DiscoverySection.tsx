import axios from "axios";
import { useEffect, useState } from "react";
import LiteratureCard from "@/components/LiteratureCard/LiteratureCard";
import { getApiURL } from "@/util/constants";
import { Literature } from "@/util/interfaces";

export default function DiscoverySection() {
  const [trending, setTrending] = useState<Literature[]>([]);
  const [recommended, setRecommended] = useState<Literature[]>([]);
  useEffect(() => {
    axios.get(`${getApiURL()}/discovery/trending?window=7d&limit=4`).then((response) => setTrending(response.data.data));
    const token = sessionStorage.getItem("typink_web_session");
    if (token) axios.get(`${getApiURL()}/discovery/recommended?limit=4`, { headers: { } }).then((response) => setRecommended(response.data.data)).catch(() => undefined);
  }, []);
  const shelf = (title: string, items: Literature[]) => items.length ? <section className="my-10"><h2 className="mb-4 text-2xl font-bold">{title}</h2><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{items.map((item) => <LiteratureCard key={item.literatureId} item={item} />)}</div></section> : null;
  return <>{shelf("Trending this week", trending)}{shelf("Recommended from your reading", recommended)}</>;
}
