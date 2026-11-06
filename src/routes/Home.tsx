import Latest from "@/components/LatestSection/Latest";
import Featured from "@/components/FeaturedSection/Featured";
import Layout from "@/components/ui/layout";
import Catalog from "@/components/LiteratureCatalog/LiteratureCatalog";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApiURL } from "@/util/constants";
import DiscoverySection from "@/components/DiscoverySection/DiscoverySection";

type HomepageCms = { featuredIds?: number[]; topPickIds?: number[]; announcement?: string; terms?: string; privacy?: string; credits?: string };

export default function Home() {
  const [cms, setCms] = useState<HomepageCms>({});
  useEffect(() => { axios.get(`${getApiURL()}/cms/settings/homepage`).then((response) => setCms(response.data.value || {})).catch(() => undefined); }, []);
  return (
    <Layout sticky>
      {cms.announcement && <div className="mb-5 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-center">{cms.announcement}</div>}
      <Featured literatureIds={cms.featuredIds?.length ? cms.featuredIds : cms.topPickIds} />  
      <Latest />
      <DiscoverySection />
      <Catalog genreId={1}/>
      <Catalog genreId={2}/>
      <Catalog genreId={3}/>
      <Catalog genreId={4}/>
      <Catalog genreId={5}/>
      <Catalog genreId={6}/>
      <Catalog genreId={7}/>
      <Catalog genreId={8}/>
      <Catalog genreId={9}/>
      <Catalog genreId={10}/>
      <footer className="my-10 flex justify-center gap-6 border-t pt-6 text-sm"><Link to="/terms">Terms</Link><Link to="/privacy">Privacy</Link><Link to="/credits">Credits</Link></footer>
    </Layout>
  )
}
