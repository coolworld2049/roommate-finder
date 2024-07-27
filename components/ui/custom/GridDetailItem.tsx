"use client";
import React from "react";
import { Large } from "@/components/ui/typography";

export const GridDetailItem = ({ label, value }: { label: any; value: any; }) => (
  <>
    <Large className="uppercase text-muted-foreground">{label}</Large>
    <Large className="font-normal">{value}</Large>
  </>
);
