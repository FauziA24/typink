import { Button } from "@/components/ui/button";
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
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { getApiURL } from "@/util/constants";
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getStoredSession } from "@/api/client";

const donationSchema = z.object({
  amount: z.coerce.number().min(1, "Nominal must be at least 1"),
  message: z.string().optional(),
  paymentMethod: z.string().default("Demo QRIS"),
});

type authorData = {
  userId: string;
  username: string;
};

type DonationFormValues = z.infer<typeof donationSchema>;

type DemoPaymentResponse = {
  transaction: {
    transactionId: number;
    status: "pending" | "paid" | string;
    value: number;
    providerOrderId: string;
  };
  demoLabel: string;
  mockQris: {
    active: false;
    payload: string;
  };
};

type DemoPaymentState = DemoPaymentResponse & {
  status: "pending" | "paid";
};

export default function DonatePage() {
  const { authorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [authorData, setAuthorData] = useState<authorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [demoPayment, setDemoPayment] = useState<DemoPaymentState | null>(null);

  const mockQrCells = useMemo(
    () =>
      Array.from({ length: 49 }, (_, index) => {
        const row = Math.floor(index / 7);
        const col = index % 7;
        const isCorner =
          (row < 2 && col < 2) ||
          (row < 2 && col > 4) ||
          (row > 4 && col < 2);
        return isCorner || (row * 3 + col * 5 + index) % 4 === 0;
      }),
    []
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      amount: 0,
      message: "",
      paymentMethod: "Demo QRIS",
    },
  });

  const handleAuthExpired = () => {
    sessionStorage.removeItem("typink_web_session");
    sessionStorage.removeItem("typink_user_id");
    sessionStorage.removeItem("typink_username");
    sessionStorage.removeItem("typink_user_image");
    sessionStorage.removeItem("typink_web_csrf");
    toast({
      title: "Session expired",
      description: "Please log in again before running the demo payment.",
    });
    navigate(`/auth?redirectTo=${encodeURIComponent(`${location.pathname}${location.search}`)}`);
  };

  const goToLogin = () => {
    navigate(`/auth?redirectTo=${encodeURIComponent(`${location.pathname}${location.search}`)}`);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get<authorData>(
          `${getApiURL()}/user/id/${authorId}`
        );
        setAuthorData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [authorId]);

  const onSubmit = async (data: DonationFormValues) => {
    try {
      setSubmitting(true);
      setDemoPayment(null);
      if (!getStoredSession()) {
        toast({
          title: "Authentication Error",
          description: "You need to be logged in to make a donation.",
        });
        setSubmitting(false);
        goToLogin();
        return;
      }

      const response = await axios.post<DemoPaymentResponse>(
        `${getApiURL()}/payments/demo/donation`,
        {
          receiverId: authorId,
          amount: data.amount,
          message: data.message,
        }
      );

      setDemoPayment({ ...response.data, status: "pending" });
      toast({
        title: "Demo payment created",
        description: "Mock QRIS is displayed for live demo only.",
      });

      window.setTimeout(async () => {
        try {
          const paid = await axios.patch(
            `${getApiURL()}/payments/demo/transactions/${response.data.transaction.transactionId}/pay`,
            {}
          );
          setDemoPayment((current) =>
            current
              ? {
                  ...current,
                  status: "paid",
                  transaction: paid.data,
                }
              : current
          );
          toast({
            title: "Payment success",
            description: "Demo transaction marked as paid.",
          });
          reset({ amount: 0, message: "", paymentMethod: "Demo QRIS" });
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            handleAuthExpired();
            return;
          }
          toast({
            title: "Demo Payment Error",
            description: "Failed to complete the demo payment simulation.",
          });
        }
      }, 3500);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        handleAuthExpired();
        return;
      }
      toast({
        title: "Demo Payment Error",
        description: "Failed to create the demo payment. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout rightBar={false} leftBar={false}>
      <div className="mx-auto w-full max-w-[560px] rounded-lg border-2 p-6 sm:p-10 space-y-7">
        <h1 className="text-3xl font-semibold text-center">
          Support {loading ? "..." : authorData?.username}
        </h1>

        <div className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            <strong>Demo payment, no real money processed.</strong> QRIS di
            bawah adalah dummy/nonaktif untuk kebutuhan live demo saja.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="donation-amount">
              Nominal donation
            </label>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <Input
                  id="donation-amount"
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value === 0 ? "" : field.value}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value === "" ? 0 : Number(event.target.value)
                    )
                  }
                  placeholder="Masukkan nominal"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  className="h-14"
                />
              )}
            />
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="donation-message">
              Message
            </label>
            <Controller
              name="message"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="donation-message"
                  placeholder="Message"
                  className="h-14"
                />
              )}
            />
            {errors.message && (
              <p className="text-sm text-red-600">{errors.message.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Payment method</label>
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Payment Methods</SelectLabel>
                      <SelectItem value="Demo QRIS">Demo QRIS</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.paymentMethod && (
              <p className="text-sm text-red-600">{errors.paymentMethod.message}</p>
            )}
          </div>

          <Button type="submit" disabled={submitting} className="h-11 w-full">
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating demo payment
              </>
            ) : (
              "Donate"
            )}
          </Button>
        </form>

        {demoPayment && (
          <div className="space-y-4 rounded-lg border p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-amber-700">
                  {demoPayment.demoLabel}
                </p>
                <p className="text-sm text-gray-500">
                  Order {demoPayment.transaction.providerOrderId}
                </p>
              </div>
              <span className="rounded-full border px-3 py-1 text-sm capitalize">
                {demoPayment.status}
              </span>
            </div>

            <div className="mx-auto grid h-44 w-44 grid-cols-7 gap-1 rounded-md border bg-white p-4 opacity-80">
              {mockQrCells.map((filled, index) => (
                <span
                  key={index}
                  className={filled ? "rounded-sm bg-gray-950" : "rounded-sm bg-gray-100"}
                />
              ))}
            </div>

            <p className="break-all text-center text-xs text-gray-500">
              {demoPayment.mockQris.payload}
            </p>

            {demoPayment.status === "pending" ? (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Simulating pending payment...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                Payment success
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
