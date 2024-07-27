"use client";
import React, { useEffect } from "react";

import { useToast } from "@/components/ui/use-toast";

export interface ToastProps {
  searchParams?: {
    message?: string;
    description?: string;
    variant?: "default" | "destructive";
  };
}

export default function Toast(props: ToastProps) {
  const { toast } = useToast();
  useEffect(() => {
    if (props.searchParams && props.searchParams.message) {
      toast({
        variant: props.searchParams.variant ?? "default",
        title: props.searchParams.message,
        description: props.searchParams.description,
      });
    }
  }, [props]);
  return <></>;
}
