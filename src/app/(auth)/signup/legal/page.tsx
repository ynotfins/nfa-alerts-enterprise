"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { legalInfoSchema, type LegalInfoInput } from "@/schemas/auth";
import { updateCurrentProfile } from "@/services/profiles";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { DatePicker } from "@/components/ui/date-picker";
import { Loader2, AlertCircle } from "lucide-react";

export default function LegalInfoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LegalInfoInput>({
    resolver: zodResolver(legalInfoSchema),
  });

  const onSubmit = async (data: LegalInfoInput) => {
    setIsLoading(true);
    setError(null);

    try {
      await updateCurrentProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        dob: data.dob.toISOString(),
        completedSteps: 2,
      });

      toast.success("Legal information saved!");
      router.push("/signup/signature");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save information"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="space-y-2">
            <CardTitle>
              Legal Information
            </CardTitle>
            <CardDescription>
              Step 3 of 4: Enter your personal details
            </CardDescription>
          </div>
          <Progress value={(3 / 4) * 100} className="h-2" />
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    className="h-11"
                    {...register("firstName")}
                    disabled={isLoading}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    className="h-11"
                    {...register("lastName")}
                    disabled={isLoading}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob" className="text-sm font-medium">
                  Date of Birth
                </Label>
                <DatePicker
                  date={selectedDate}
                  onDateChange={(date) => {
                    setSelectedDate(date);
                    if (date) {
                      setValue("dob", date);
                    }
                  }}
                  placeholder="Select date of birth"
                  disabled={isLoading}
                />
                {errors.dob && (
                  <p className="text-sm text-destructive">
                    {errors.dob.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 pt-8">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11"
              onClick={() => router.push("/signup/profile")}
              disabled={isLoading}
            >
              Back
            </Button>
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
