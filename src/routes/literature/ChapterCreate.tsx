import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/ui/layout";
import { Textarea } from "@/components/ui/textarea";
import { useParams, useNavigate } from "react-router-dom";
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
import { useEffect, useState } from "react";
import MediaUpload from "@/components/MediaUpload/MediaUpload";

const chapterSchema = z.object({
  title: z.string().min(1, "Title is required"),
  number: z.coerce.number().min(1, "Chapter number is required"),
  thumbnailUrl: z.union([z.string().url(), z.string().min(0)]).optional(),
  content: z.string().min(1, "Content is required"),
  status: z.enum(["draft", "published"]).default("published"),
  scheduledAt: z.string().optional(),
});

type ChapterFormValues = z.infer<typeof chapterSchema>;

export default function ChapterCreate() {
  const { literatureId } = useParams<{ literatureId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem("typink_web_session")) {
      toast({
        title: "Login required",
        description: "Please log in from the profile menu to create a chapter.",
      });
      navigate("/auth");
    }
  }, [navigate]);

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

  const { handleSubmit, control, watch, setValue } = formMethods;
  const content = watch("content") || "";
  const autosaveKey = `typink:chapter-draft:${literatureId || "new"}`;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  useEffect(() => {
    const saved = localStorage.getItem(autosaveKey);
    if (saved) {
      try {
        formMethods.reset(JSON.parse(saved));
      } catch {
        localStorage.removeItem(autosaveKey);
      }
    }
  }, [autosaveKey, formMethods]);

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
      const res = await axios.post<{ chapterId: number }>(
        `${getApiURL()}/chapter/create`,
        {
          literatureId,
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
        description: data.status === "draft" || data.scheduledAt ? "Chapter saved as draft." : "Chapter published successfully.",
      });
      localStorage.removeItem(autosaveKey);

      setTimeout(() => {
        navigate(`/read/${literatureId}/${res.data.chapterId}`);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create chapter.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout leftBar={false} rightBar={false}>
      <div className="flex flex-col justify-center gap-8 items-center">
        <h1 className="text-3xl font-semibold text-center">Create Chapter</h1>
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
                        <option value="published">Publish now</option>
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
              className="self-start h-10 w-28"
              disabled={loading}
            >
              {loading ? (
                <div className="spinner-border animate-spin inline-block border-4 rounded-full border-t-transparent border-white"></div>
              ) : (
                "Save"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </Layout>
  );
}
