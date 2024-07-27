import React from "react";
import { CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";

export interface ArrayFieldProps {
  title: string;
  className?: string;
}

export const ArrayField = ({
  title,
  className,
  children,
  ...props
}: ArrayFieldProps & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div>
      <CardHeader className="font-semibold tracking-tight text-xl pl-0">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <div className={cn("grid grid-cols-2 gap-1.5", className)} {...props}>
        {children}
      </div>
    </div>
  );
};

export default ArrayField;
