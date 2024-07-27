import {
  Carousel,
  CarouselContextProps,
  CarouselIndicator,
  CarouselMainContainer,
  CarouselNext,
  CarouselPrevious,
  CarouselThumbsContainer,
  SliderMainItem,
} from "@/components/extension/carousel";
import { ListingCardImage } from "@/components/ui/listing/listing-card";
import { cn } from "@/lib/utils";
import React from "react";

const ListingCardCarousel = React.forwardRef<
  HTMLDivElement,
  {
    images: string[];
    imageMaxHeigth?: number | string;
    imageMinHeigth?: number | string;
    imageClassName?: string;
  } & CarouselContextProps &
    React.HTMLAttributes<HTMLDivElement>
>(
  (
    {
      images,
      imageMaxHeigth,
      imageMinHeigth,
      imageClassName,
      carouselOptions,
      orientation = "vertical",
      dir,
      plugins,
      children,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <Carousel ref={ref} className={cn("basis-1/3", className)} {...props}>
        {images.length > 1 && (
          <>
            <CarouselNext />
            <CarouselPrevious />
          </>
        )}
        <CarouselMainContainer>
          {images.map((image, index) => (
            <SliderMainItem key={index} className="bg-transparent p-0">
              <ListingCardImage
                src={image}
                alt={`${image}-${index}`}
                className={cn(
                  `min-h-${imageMinHeigth} max-h-${imageMaxHeigth}`,
                  imageClassName
                )}
              />
            </SliderMainItem>
          ))}
        </CarouselMainContainer>
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <CarouselThumbsContainer className="gap-x-1 ">
              {images.map((_, index) => (
                <CarouselIndicator key={index} index={index} />
              ))}
            </CarouselThumbsContainer>
          </div>
        )}
      </Carousel>
    );
  }
);

export default ListingCardCarousel;
