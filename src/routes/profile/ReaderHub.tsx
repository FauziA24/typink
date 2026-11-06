import axios from "axios";
import { Bell, FolderPlus, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ProfileLayout from "@/components/layouts/ProfileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiURL } from "@/util/constants";

type Folder = { folderId: number; name: string };
type Notification = { notificationId: number; title: string; body: string; targetUrl?: string; readAt?: string; created_at: string };
type Collection = { collectionId: number; folderId?: number; bookmarkPosition?: number; literature: { literatureId: number; title: string; imageUrl: string } };

export default function ReaderHub() {
  const navigate = useNavigate();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(true);
  const token = sessionStorage.getItem("typink_web_session");
  const userId = sessionStorage.getItem("typink_user_id");

  const load = useCallback(async () => {
    if (!token || !userId) return navigate("/auth");
    const headers = { };
    setLoading(true);
    try {
      const [folderResponse, notificationResponse, profileResponse] = await Promise.all([
        axios.get(`${getApiURL()}/library/folders`, { headers }),
        axios.get(`${getApiURL()}/notifications`, { headers }),
        axios.get(`${getApiURL()}/user/id/${userId}`),
      ]);
      setFolders(folderResponse.data);
      setNotifications(notificationResponse.data);
      setCollections(profileResponse.data.collections || []);
    } finally {
      setLoading(false);
    }
  }, [navigate, token, userId]);

  useEffect(() => { void load(); }, [load]);

  const createFolder = async () => {
    if (!folderName.trim()) return;
    const headers = { };
    await axios.post(`${getApiURL()}/library/folders`, { name: folderName }, { headers });
    setFolderName("");
    await load();
  };

  const moveToFolder = async (literatureId: number, folderId: string) => {
    const headers = { };
    await axios.patch(`${getApiURL()}/collection/${literatureId}`, { folderId: folderId || null }, { headers });
    await load();
  };

  const openNotification = async (item: Notification) => {
    const headers = { };
    if (!item.readAt) await axios.patch(`${getApiURL()}/notifications/${item.notificationId}/read`, {}, { headers });
    if (item.targetUrl) navigate(item.targetUrl);
    else await load();
  };

  return (
    <ProfileLayout>
      <h1 className="mb-6 text-3xl font-bold">Library & notifications</h1>
      {loading ? <div className="flex items-center gap-2"><Loader2 className="animate-spin" /> Loading...</div> : (
        <div className="space-y-10">
          <section>
            <h2 className="mb-3 text-xl font-semibold">Collection folders</h2>
            <div className="mb-4 flex gap-2"><Input value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="New folder name" /><Button onClick={createFolder}><FolderPlus className="mr-2" />Create</Button></div>
            {collections.length === 0 ? <p className="rounded border border-dashed p-6 text-center text-gray-500">Your library is empty.</p> : collections.map((item) => (
              <div key={item.collectionId} className="mb-2 flex items-center gap-4 rounded border p-3">
                <img src={item.literature.imageUrl} className="h-16 w-12 rounded object-cover" alt="" />
                <button className="flex-1 text-left font-medium" onClick={() => navigate(`/read/${item.literature.literatureId}`)}>{item.literature.title}</button>
                <select className="rounded border p-2" value={item.folderId || ""} onChange={(e) => moveToFolder(item.literature.literatureId, e.target.value)}>
                  <option value="">No folder</option>{folders.map((folder) => <option key={folder.folderId} value={folder.folderId}>{folder.name}</option>)}
                </select>
              </div>
            ))}
          </section>
          <section>
            <h2 className="mb-3 flex items-center text-xl font-semibold"><Bell className="mr-2" />Notifications</h2>
            {notifications.length === 0 ? <p className="rounded border border-dashed p-6 text-center text-gray-500">No notifications.</p> : notifications.map((item) => (
              <button key={item.notificationId} onClick={() => openNotification(item)} className={`mb-2 block w-full rounded border p-3 text-left ${item.readAt ? "bg-white" : "bg-emerald-50"}`}>
                <strong>{item.title}</strong><p className="text-sm text-gray-600">{item.body}</p>
              </button>
            ))}
          </section>
        </div>
      )}
    </ProfileLayout>
  );
}
