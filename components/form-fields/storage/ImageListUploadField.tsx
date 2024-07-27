"use client";

import { FileUploader, FileInput } from "@/components/extension/file-upload";
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { DropzoneOptions } from "react-dropzone";
import { SquarePlusIcon, Trash2, UploadCloudIcon } from "lucide-react";
import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import {
  Carousel,
  CarouselMainContainer,
  CarouselThumbsContainer,
  SliderMainItem,
  SliderThumbItem,
} from "@/components/extension/carousel";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "../../ui/button";
import { ListingCardImage } from "@/components/ui/listing/listing-card";

const FileSvgDraw = () => {
  return (
    <>
      <UploadCloudIcon className="text-gray-500" size={30} />
      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
        <span className="font-semibold">Click to upload</span>
        &nbsp; or drag and drop
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        SVG, PNG, JPG or GIF
      </p>
    </>
  );
};

const SliderMainItemWitButton = ({
  image,
  index,
  ...buttonProps
}: { image: string; index: number } & ButtonProps &
  React.RefAttributes<HTMLButtonElement>) => {
  return (
    <SliderMainItem
      key={index}
      className="relative flex flex-col p-0 w-full items-center justify-center rounded-md overflow-hidden"
    >
      <img
        src={image}
        alt={`${image}-${index}`}
        className="w-full h-60 object-cover rounded-lg basis-1/3"
      />
      <Button
        variant={"link"}
        size={"icon"}
        className="absolute top-0 bottom-0 left-120 right-0"
        {...buttonProps}
      >
        <Trash2 className=" hover:text-red-500" />
      </Button>
    </SliderMainItem>
  );
};

interface ImageUploadFieldProps {
  control: Control<any>;
  name: string;
  label?: string;
  db_model_uid: any;
  storage_dir: string;
  bucket: string;
  images: string[] | null | undefined;
  handleUploadToSupabase: (uidInTable: any, images: string[]) => Promise<void>;
  onUploaded: () => void;
  dropzoneOptions?: DropzoneOptions;
}

const ImageListUploadField: React.FC<ImageUploadFieldProps> = ({
  control,
  name,
  label,
  db_model_uid,
  storage_dir,
  bucket,
  images,
  handleUploadToSupabase,
  onUploaded,
  dropzoneOptions,
}) => {
  const supabase = createClient();
  const [files, setFiles] = useState<File[] | null>([]);
  const [disabled, setDisabled] = useState<boolean>(false);

  const dropzone = {
    accept: {
      "image/*": [".jpg", ".jpeg", ".png"],
    },
    multiple: true,
    maxFiles: 12,
    maxSize: 5 * 1024 * 1024,
    ...dropzoneOptions,
  } satisfies DropzoneOptions;

  const uploadImageToStorage = async (value: File[]) => {
    setDisabled(true);
    const urls = await Promise.all(
      value?.map(async (file) => {
        const pathInStorage = `${storage_dir}/${file.name}`;

        const { error } = await supabase.storage
          .from(bucket)
          .upload(pathInStorage, file, {
            cacheControl: "0",
            upsert: true,
          });

        if (error) {
          console.error(error);
          toast({
            title: "Error uploading image",
            description: error.message,
            variant: "destructive",
          });
        }

        const { data: url } = supabase.storage
          .from(bucket)
          .getPublicUrl(pathInStorage);

        return url.publicUrl;
      })
    );
    await handleUploadToSupabase(db_model_uid, urls);
    onUploaded();
    setDisabled(false);
  };

  const removeImageFromStorage = async (image: string) => {
    setDisabled(true);
    const fileName = image.split("/").pop()!;
    const pathInStorage = `${storage_dir}/${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .remove([pathInStorage]);

    if (error) {
      toast({
        title: "Error removing image",
        description: error.message,
        variant: "destructive",
      });
    }
    const newFiles = files?.filter((v) => v.name != fileName && v);
    newFiles && setFiles(newFiles);
    if (images) {
      const newImageUrls = images.filter((v) => v != image && v);
      await handleUploadToSupabase(db_model_uid, newImageUrls);
    }
    onUploaded();
    setDisabled(false);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { onChange, ...rest } }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FileUploader
            value={files}
            onValueChange={(value: File[] | null) => {
              if (value) {
                const uniqueFiles = value.filter((newFile) => {
                  return !files?.some(
                    (existingFile) =>
                      existingFile.name === newFile.name &&
                      existingFile.size === newFile.size &&
                      existingFile.lastModified === newFile.lastModified
                  );
                });
                const updatedFiles = [...files!, ...uniqueFiles];

                setFiles(updatedFiles);
                uploadImageToStorage(updatedFiles);
              }
            }}
            dropzoneOptions={dropzone}
          >
            <FormControl>
              {rest.value &&
              rest.value instanceof Array &&
              rest.value.length > 0 ? (
                <Carousel
                  orientation="vertical"
                  className="flex items-center gap-1 w-full h-fit"
                >
                  <div className="relative basis-3/4">
                    <CarouselMainContainer className="h-60 w-full">
                      {rest.value?.map((image: any, i: number) => (
                        <SliderMainItemWitButton
                          image={image}
                          index={i}
                          onClick={() => removeImageFromStorage(image)}
                          disabled={disabled}
                        />
                      ))}
                    </CarouselMainContainer>
                  </div>
                  <CarouselThumbsContainer className="max-h-60 basis-1/4">
                    <FileInput>
                      <SliderThumbItem
                        key={0}
                        index={0}
                        className="rounded-md bg-transparent"
                      >
                        <span className="border border-dashed flex items-center justify-center h-full w-full rounded-md cursor-pointer bg-background">
                          <SquarePlusIcon />
                        </span>
                      </SliderThumbItem>
                    </FileInput>

                    {rest.value &&
                      rest.value.map((image: any, i: number) => (
                        <SliderThumbItem
                          key={i}
                          index={i}
                          className="rounded-md bg-transparent"
                        >
                          <span className="border border-muted flex items-center justify-center h-full w-full rounded-md cursor-pointer bg-background">
                            <img
                              src={image}
                              alt={`${image}-${i}`}
                              className="p-0 w-full h-full object-cover rounded-md"
                            />
                          </span>
                        </SliderThumbItem>
                      ))}
                  </CarouselThumbsContainer>
                </Carousel>
              ) : (
                <FileInput className="border border-dashed ">
                  <div className="flex items-center justify-center flex-col pt-3 pb-4 w-full">
                    <FileSvgDraw />
                  </div>
                </FileInput>
              )}
            </FormControl>
          </FileUploader>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ImageListUploadField;
