"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { patchUserName } from "@/lib/api/friends";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const FormSchema = z.object({
  username: z.string().min(5, {
    message: "Username must be at least 5 characters.",
  }),
});

export function UsernameForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { username: "" },
  });

  const { mutate } = useMutation({
    mutationFn: patchUserName,
    onSuccess: () => {
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    mutate(data);
  }

  return (
    <form
      id="username-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-3"
    >
      <FieldGroup>
        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="username-input">Username</FieldLabel>
              <Input
                {...field}
                id="username-input"
                placeholder="e.g. john_doe"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              <FieldDescription>
                This will be your public display name.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <Button type="submit" className="w-full">
        Claim Username
      </Button>
    </form>
  );
}
