import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import Layout from "@/components/ui/layout";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getApiURL } from "@/util/constants";
import { useEffect } from "react";
import MediaUpload from "@/components/MediaUpload/MediaUpload";

type FormData = {
  title: string;
  synopsis: string;
  imageUrl: string;
  genreId: string;
  language: string;
  copyright: boolean;
};

interface createResponse {
  literatureId: number;
  title: string;
  synopsis: string;
  imageUrl: string;
  genreId: number;
  language: string;
  copyright: number;
  authorId: string;
}

export default function LiteratureCreate() {
  const navigate = useNavigate();
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>();
  const imageUrl = watch("imageUrl");

  useEffect(() => {
    if (!sessionStorage.getItem("typink_web_session")) {
      toast({
        title: "Login required",
        description: "Please log in from the profile menu to create a story.",
      });
      navigate("/auth");
    }
  }, [navigate]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const token = sessionStorage.getItem("typink_web_session");

    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in to create literature.",
      });
      return;
    }

    try {
      const response = await axios.post<createResponse>(
        `${getApiURL()}/literature/create`,
        {
          title: data.title,
          synopsis: data.synopsis,
          imageUrl: data.imageUrl,
          genreId: Number(data.genreId),
          language: data.language,
          copyright: data.copyright ? 1 : 0,
        },
        {
          headers: {
            
          },
        }
      );

      toast({
        title: "Literature Created",
        description: "Your literature has been successfully created.",
      });
      reset();

      setTimeout(() => {
        navigate(`/read/${response.data.literatureId}`);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description:
          "There was an error creating the literature. Please try again.",
      });
      console.error("Error creating literature:", error);
    }
  };

  return (
    <Layout leftBar={false} rightBar={false}>
      <div className="flex flex-col justify-center gap-8 items-center">
        <h1 className="text-3xl font-semibold text-center">
          Create Literature
        </h1>
        <form className="w-full " onSubmit={handleSubmit(onSubmit)}>
          <Input
            {...register("title", { required: true })}
            placeholder="Title"
            className="h-14 text-xl mb-4"
          />
          <input type="hidden" {...register("imageUrl", { required: true })} />
          <MediaUpload
            purpose="cover"
            label="Upload cover"
            value={imageUrl}
            required
            onChange={(url) => setValue("imageUrl", url, { shouldValidate: true })}
          />
          <Textarea
            {...register("synopsis", { required: true })}
            className="min-h-24 mb-4"
            placeholder="Synopsis"
          />
          <Select onValueChange={(value) => setValue("genreId", value)}>
            <SelectTrigger className="w-[180px] self-start mb-4">
              <SelectValue placeholder="Select a genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Genre</SelectLabel>
                <SelectItem value="1">Cyberpunk</SelectItem>
                <SelectItem value="2">Horror</SelectItem>
                <SelectItem value="3">Young Adult</SelectItem>
                <SelectItem value="4">Adventure</SelectItem>
                <SelectItem value="5">Bildungrosman</SelectItem>
                <SelectItem value="6">Children's</SelectItem>
                <SelectItem value="7">Romance</SelectItem>
                <SelectItem value="8">Fantasy</SelectItem>
                <SelectItem value="9">Historical Fiction</SelectItem>
                <SelectItem value="10">Dark</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => setValue("language", value)}>
            <SelectTrigger className="w-[180px] self-start mb-4">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Language</SelectLabel>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="German">German</SelectItem>
                <SelectItem value="Chinese">Chinese</SelectItem>
                <SelectItem value="Indonesian">Indonesian</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2 self-start mb-4">
            <Checkbox id="terms" {...register("copyright")} />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Copyright For Creative Commons (CC) Attribution
            </label>
          </div>
          <div className="flex flex-row w-full justify-between h-20">
            <Button type="submit" className="h-10">
              Publish
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
