import axios from "axios";
import { Flag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { getApiURL } from "@/util/constants";

export default function ReportButton({ targetType, targetId }: { targetType: "literature" | "chapter" | "forum"; targetId: number }) {
  const navigate = useNavigate();
  const report = async () => {
    const token = sessionStorage.getItem("typink_web_session");
    if (!token) return navigate("/auth");
    const reason = window.prompt("Explain why this content should be reviewed");
    if (!reason) return;
    await axios.post(`${getApiURL()}/reports`, { targetType, targetId: String(targetId), reason }, { headers: { } });
    toast({ title: "Report submitted", description: "The moderation team will review it." });
  };
  return <Button type="button" variant="ghost" size="sm" onClick={report}><Flag className="mr-2 h-4 w-4" />Report</Button>;
}
