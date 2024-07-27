import * as React from "react";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../card";
import { Large, Muted, Small } from "../typography";

const ListingCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(
      "flex flex-col md:flex-row items-start w-full hover:bg-muted/40",
      className
    )}
    {...props}
  />
));
ListingCard.displayName = "ListingCard";

const ListingCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardHeader ref={ref} className={cn("", className)} {...props} />
));
ListingCardHeader.displayName = "ListingCardHeader";

const ListingCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <CardTitle ref={ref} className={cn("", className)} {...props} />
));
ListingCardTitle.displayName = "ListingCardTitle";

const ListingCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <CardDescription ref={ref} className={cn("", className)} {...props} />
));
ListingCardDescription.displayName = "ListingCardDescription";

const ListingCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardContent
    ref={ref}
    className={cn("p-3 space-y-1 ", className)}
    {...props}
  />
));
ListingCardContent.displayName = "ListingCardContent";

const ListingCardWithIcon = React.forwardRef<
  HTMLDivElement,
  { icon: React.ReactNode } & React.PropsWithChildren &
    React.HTMLAttributes<HTMLDivElement>
>(({ icon, children, className, ...props }, ref) => (
  <Small
    ref={ref}
    className={cn("flex flew-row gap-x-1 items-center justify-start", className)}
    {...props}
  >
    {icon}
    {children}
  </Small>
));
ListingCardWithIcon.displayName = "ListingCardWithIcon";

const ListingCardImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, ...props }, ref) => (
  <img
    ref={ref}
    className={cn("w-full h-full object-cover rounded-lg", className)}
    {...props}
  />
));
ListingCardImage.displayName = "ListingCardImage";

const ListingCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardFooter
    ref={ref}
    className={cn("flex-col items-start p-3", className)}
    {...props}
  />
));
ListingCardFooter.displayName = "ListingCardFooter";

export {
  ListingCard,
  ListingCardHeader,
  ListingCardFooter,
  ListingCardTitle,
  ListingCardDescription,
  ListingCardContent,
  ListingCardImage,
  ListingCardWithIcon,
};
