import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TypinkLogo from "@/assets/TypinkLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getApiURL } from "@/util/constants";
import { loadSession, storeSession } from "@/api/client";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 6 characters"),
  username: z.string().min(4, "Username must be at least 2 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

function saveAuthSession({
  userId,
  username,
  imageUrl,
  role,
  csrfToken,
}: {
  userId: string;
  username: string;
  imageUrl?: string;
  role: string;
  csrfToken: string;
}) {
  storeSession({ userId, username, imageUrl, role, csrfToken });
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isGoogleCallback = searchParams.has("code") || searchParams.has("error");
  const redirectToParam = searchParams.get("redirectTo");
  const redirectTo =
    redirectToParam && redirectToParam.startsWith("/") && !redirectToParam.startsWith("//")
      ? redirectToParam
      : "/";

  const form = useForm<LoginFormValues | SignupFormValues>({
    resolver: zodResolver(isLogin ? loginSchema : signupSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
    },
  });

  const onSubmit: SubmitHandler<LoginFormValues | SignupFormValues> = async (
    data
  ) => {
    setLoading(true);
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const response = await axios.post(`${getApiURL()}${endpoint}`, {
        ...data,
        email: data.email.trim().toLowerCase(),
      });
      const { userId, username, imageUrl, role, csrfToken } = response.data;
      saveAuthSession({ userId, username, imageUrl, role, csrfToken });

      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error || "Gagal terhubung ke server."
        : "Gagal melakukan autentikasi.";
      toast({
        title: "Authentication Error",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isGoogleCallback) loadSession().then(() => navigate(redirectTo, { replace: true })).catch(() => undefined);
  }, [isGoogleCallback, navigate, redirectTo]);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      toast({
        title: "Google authentication failed",
        description: "Google login was cancelled or rejected. Please try again.",
      });
      navigate("/auth", { replace: true });
      return;
    }

    if (!code || !state) return;

    setLoading(true);
    axios
      .post(`${getApiURL()}/auth/google/callback`, { code, state })
      .then((response) => {
        const { userId, username, imageUrl, role, csrfToken, redirectTo } = response.data;
        saveAuthSession({ userId, username, imageUrl, role, csrfToken });
        navigate(redirectTo || "/", { replace: true });
      })
      .catch(() => {
        toast({
          title: "Google authentication failed",
          description: "Unable to complete Google login. Please try again.",
        });
        navigate("/auth", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [navigate, searchParams]);

  useEffect(() => {
    setIsLogin(searchParams.get("mode") !== "signup");
  }, [searchParams]);

  return (
    <div className="min-h-screen py-8 m-auto w-[300px] flex flex-col items-center justify-around">
      <TypinkLogo />
      <div className="flex flex-col items-center w-full gap-5">
        <h1 className="font-bold text-5xl">
          {isLogin ? "Sign In" : "Sign Up"}
        </h1>
        {isLogin && (
          <div className="w-full rounded-lg border border-pink-200 bg-pink-50 p-3 text-sm text-pink-900">
            <p className="font-semibold">Portfolio demo</p>
            <p className="mt-1">Gunakan kredensial demo yang diberikan oleh pemilik portfolio.</p>
          </div>
        )}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isLogin && (
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button
              type="submit"
              className="w-full h-[40px] bg-[#04A775] hover:bg-[#016B4B]"
              disabled={loading}
            >
              {loading ? (
                <div className="spinner-border animate-spin inline-block w-4 h-4 border-4 rounded-full border-t-transparent border-white"></div>
              ) : isLogin ? (
                "Continue"
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        </Form>
        <div className="flex-row flex items-center">
          <p className="font-semibold">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>
          <Button
            variant={"link"}
            className="text-[#004DBB]"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </Button>
        </div>
        <Button
          variant={"ghost"}
          className="w-full"
          onClick={() => navigate("/")}
        >
          Continue browsing without account
        </Button>
        <hr className="border-t w-full" />
        <p className="text-center text-xs text-slate-500">Google OAuth is intentionally disabled for this portfolio demo.</p>
      </div>
      <div>
        <Button variant={"link"} className="text-black font-bold">
          Privacy
        </Button>
        <Button variant={"link"} className="text-black font-bold">
          Terms
        </Button>
        <Button variant={"link"} className="text-black font-bold">
          Credit
        </Button>
      </div>
    </div>
  );
}
