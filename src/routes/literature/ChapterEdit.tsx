import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/ui/layout";
import { Textarea } from "@/components/ui/textarea";
import { useParams, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { getApiURL } from "@/util/constants";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Chapter } from "@/util/interfaces";
import MediaUpload from "@/components/MediaUpload/MediaUpload";

const chapterSchema = z.object({
  title: z.string().min(1, "Title is required"),
  number: z.coerce.number().min(1, "Chapter number is required"),
  thumbnailUrl: z.union([z.string().url(), z.string().max(0)]).optional(),
  content: z.string().min(1, "Content is required"),
  status: z.enum(["draft", "published"]).default("published"),
  scheduledAt: z.string().optional(),
});

type ChapterFormValues = z.infer<typeof chapterSchema>;

interface ChapterRevision {
  revisionId: number;
  chapterTitle: string;
  created_at: string;
  editor?: { username?: string };
}

export default function ChapterEdit() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [lId, setLid] = useState(0);
  const [preview, setPreview] = useState(false);
  const [revisions, setRevisions] = useState<ChapterRevision[]>([]);


  const formMethods = useForm<ChapterFormValues>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      title: "",
      number: undefined,
      thumbnailUrl: "",
      content: "",
      status: "published",
      scheduledAt: "",
    },
  });

  const { reset, handleSubmit, control, watch, setValue } = formMethods;
  const content = watch("content") || "";
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const autosaveKey = `typink:chapter-edit:${chapterId || "new"}`;

  const fetchChapterData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<Chapter>(
        `${getApiURL()}/chapter/id/${chapterId}`
      );
      reset({
        title: response.data.chapterTitle,
        number: response.data.chapterNumber,
        thumbnailUrl: response.data.imageUrl,
        content: response.data.content,
        status: response.data.status === "draft" ? "draft" : "published",
        scheduledAt: response.data.scheduledAt ? String(response.data.scheduledAt).slice(0, 16) : "",
      });
      setLid(response.data.literatureId)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load chapter data.",
      });
    } finally {
      setLoading(false);
    }
  }, [chapterId, reset]);

  useEffect(() => {
    if (chapterId) {
      fetchChapterData();
      axios.get<ChapterRevision[]>(`${getApiURL()}/chapter/${chapterId}/revisions`, { headers: { } }).then((response) => setRevisions(response.data)).catch(() => setRevisions([]));
    }
  }, [chapterId, fetchChapterData]);

  const restoreRevision = async (revisionId: number) => {
    await axios.post(`${getApiURL()}/chapter/${chapterId}/revisions/${revisionId}/restore`, {}, { headers: { } });
    await fetchChapterData();
    toast({ title: "Revision restored", description: "The previous version is active and the replaced version was preserved." });
  };

  useEffect(() => {
    const subscription = formMethods.watch((value) => {
      localStorage.setItem(autosaveKey, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [autosaveKey, formMethods]);

  const insertImage = () => {
    const url = window.prompt("Image URL");
    if (!url) return;
    setValue("content", `${content}\n\n![image](${url})\n`);
  };

  const onSubmit: SubmitHandler<ChapterFormValues> = async (data) => {
    try {
      setLoading(true);
      await axios.put(
        `${getApiURL()}/chapter/edit`,
        {
          chapterId,
          chapterTitle: data.title,
          chapterNumber: data.number,
          imageUrl: data.thumbnailUrl,
          content: data.content,
          status: data.status,
          scheduledAt: data.scheduledAt || undefined,
        },
        {
          headers: {
            
          },
        }
      );
      toast({
        title: "Success",
        description: "Chapter updated successfully.",
      });
      localStorage.removeItem(autosaveKey);

      setTimeout(() => {
        navigate(`/read/${lId}/${chapterId}`);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update chapter.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout leftBar={false} rightBar={false}>
      <div className="flex flex-col justify-center gap-8 items-center">
        <h1 className="text-3xl font-semibold text-center">
          {chapterId ? "Edit Chapter" : "Create Chapter"}
        </h1>
        <div className="flex w-full flex-wrap items-center justify-between gap-2 rounded border bg-white p-3 text-sm">
          <span>{wordCount} words</span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={insertImage}>Insert Image</Button>
            <Button type="button" variant="outline" onClick={() => setPreview(!preview)}>
              {preview ? "Edit" : "Preview"}
            </Button>
          </div>
        </div>
        <Form {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chapter Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Chapter Title"
                      {...field}
                      className="h-14 text-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chapter Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Chapter Number"
                      type="number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="thumbnailUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chapter image (optional)</FormLabel>
                  <FormControl>
                    <MediaUpload purpose="chapter" value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    {preview ? (
                      <div className="min-h-48 whitespace-pre-wrap rounded-md border bg-white p-4 leading-7">
                        {field.value}
                      </div>
                    ) : (
                      <Textarea
                        placeholder="Content"
                        {...field}
                        className="min-h-48"
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <select className="h-10 w-full rounded-md border bg-white px-3" {...field}>
                        <option value="published">Publish</option>
                        <option value="draft">Save draft</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="scheduledAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheduled Publish</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="submit"
              className=" self-start  h-10 w-28"
              disabled={loading}
            >
              {loading ? (
                <div className="spinner-border animate-spin inline-block  border-4 rounded-full border-t-transparent border-white"></div>
              ) : (
                "Save"
              )}
            </Button>
          </form>
        </Form>
        <section className="w-full rounded border p-4">
          <h2 className="mb-3 text-xl font-semibold">Revision history</h2>
          {revisions.length === 0 ? <p className="text-sm text-gray-500">No previous revisions.</p> : revisions.map((revision) => (
            <div key={revision.revisionId} className="mb-2 flex items-center justify-between rounded border p-3"><div><strong>{revision.chapterTitle}</strong><p className="text-xs text-gray-500">{new Date(revision.created_at).toLocaleString()} · {revision.editor?.username}</p></div><Button type="button" variant="outline" onClick={() => restoreRevision(revision.revisionId)}>Restore</Button></div>
          ))}
        </section>
      </div>
    </Layout>
  );
}
