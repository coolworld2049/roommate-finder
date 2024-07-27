"use client";

import React, {
  FunctionComponent,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { useInfiniteOffsetPaginationQuery } from "@supabase-cache-helpers/postgrest-swr";
import { Button } from "@/components/ui/button";
import { LayoutGridIcon, MapIcon, SearchIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { DatabaseTableProps } from "../../types/database.table.types";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { Database, Tables } from "@/types/database.types";
import { ListingMapFeature, ListingMapProps } from "./ListingMap";
import { User } from "@supabase/supabase-js";
import { ScrollArea } from "../ui/scroll-area";
import useWindowDimensions from "@/hooks/window-dimension";
import ListingFilters from "./ListingFilters";
import { notFound } from "next/navigation";
import { TypedSupabaseClient } from "@/lib/supabase/types";
import { useDebouncedCallback } from "use-debounce";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { SpinnerCenter } from "../extension/spinner";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { getUniversitiesByProfiles } from "@/queries/supabase/profiles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const ListViewHeader = ({
  children,
  className,
  ...props
}: PropsWithChildren & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex gap-2 items-start", className)} {...props}>
    {children}
  </div>
);

export interface ListingViewProps<
  T extends Extract<keyof Database["public"]["Tables"], string>,
> {
  tableName: T;
  CardComponent: FunctionComponent<
    DatabaseTableProps<T> &
      React.HTMLAttributes<HTMLDivElement> &
      Record<string, any>
  >;
  fetchQuery: (
    client: TypedSupabaseClient,
    options?: Record<string, any>
  ) => PostgrestFilterBuilder<Database["public"], Tables<T>, Tables<T>[]>;
  ListingMapComponent?: FunctionComponent<ListingMapProps>;
}

export function ListingView<T extends "properties" | "roommates">({
  fetchQuery,
  CardComponent,
  ListingMapComponent,
  tableName,
}: ListingViewProps<T>) {
  const { width } = useWindowDimensions();

  const supabase = createClient();
  const [user, setUser] = useState<User>();
  const [fq, setNewFetchQuery] = useState<
    ReturnType<ListingViewProps<T>["fetchQuery"]>
  >(fetchQuery(supabase));

  const defaultPageSize = 6;
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);

  const {
    currentPage,
    nextPage,
    previousPage,
    pages,
    error,
    isLoading,
    mutate,
    setPage,
    pageIndex,
  } = useInfiniteOffsetPaginationQuery(fq, {
    pageSize: pageSize,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const applyFilters = useCallback(
    (newFn: ReturnType<ListingViewProps<T>["fetchQuery"]>) => {
      setNewFetchQuery(newFn);
      mutate();
    },
    []
  );

  const profiles_ids = currentPage?.map((item) => item.profile_id);

  const { data: profile_universisties } = useQuery(
    getUniversitiesByProfiles(supabase, profiles_ids!)
  );

  const applyFiltersDebounce = useDebouncedCallback(applyFilters, 100);

  const currentPageData = currentPage?.filter(
    (v) => v.geo_lat !== null && v.geo_lon !== null
  );

  const features = ListingMapComponent
    ? currentPageData?.map((page, index) => {
        const profile_university = profile_universisties?.find(
          (v) => v.profile_id == page.profile_id
        );
        const pageData = page as Record<string, any>;
        const data = {
          type: "Feature",
          id: index.toString(),
          geometry: {
            type: "Point",
            coordinates: [Number(pageData.geo_lon), Number(pageData.geo_lat)],
          },
          properties: {
            ...page,
            ...profile_university,
          },
          tableName: tableName,
        } as ListingMapFeature;

        return data;
      })
    : null;

  const featuresUniversities = ListingMapComponent
    ? profile_universisties?.map((page, index) => {
        const newIndex = features?.length ?? 0 + index;
        return {
          type: "Feature",
          id: newIndex.toString(),
          geometry: {
            type: "Point",
            coordinates: [
              Number((page as Record<string, any>).geo_lon),
              Number((page as Record<string, any>).geo_lat),
            ],
          },
          properties: {
            ...page,
          },
          tableName: "profile_universities",
        } as ListingMapFeature;
      })
    : null;

  const finalFeatures = [
    ...features!,
    ...(featuresUniversities ? featuresUniversities : []),
  ];

  useEffect(() => {
    const func = async () => {
      const resp = await supabase.auth.getUser();
      if (resp.data.user) {
        setUser(resp.data.user);
      }
    };
    if (!user) func();
  }, [user]);

  useEffect(() => {
    if (error) {
      toast({ title: error.message, variant: "destructive" });
      setNewFetchQuery(fetchQuery(supabase));
    }
    if (!isLoading && !currentPage) {
      notFound();
    }
  }, [error]);

  const [leftPanelSize, setLeftPanelSize] = useState(50);
  const [rightPanelSize, setRightPanelSize] = useState(50);

  useEffect(() => {
    if (width && width > 900) {
      setRightPanelSize(50);
      setLeftPanelSize(50);
    } else {
      setRightPanelSize(0);
      setLeftPanelSize(100);
    }
  }, [width]);

  if (isLoading) return <SpinnerCenter />;

  const height = "h-[calc(100vh_-_theme(spacing.48)_-_2vh)]";

  return (
    <div className="space-y-2 flex flex-col items-start w-full">
      <div className="flex flex-row items-center gap-2 justify-between w-full">
        <div className="flex flex-row items-center justify-start gap-2 w-full">
          <ListingFilters
            tableName={tableName}
            fetchQuery={fetchQuery}
            applyFilters={applyFiltersDebounce}
            children={
              <Select
                value={pageSize.toString()}
                onValueChange={(v) => setPageSize(Number(v))}
              >
                <SelectTrigger className="w-[150px] rounded-full">
                  <SelectValue placeholder="per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={defaultPageSize.toString()}>
                    {defaultPageSize} ads per page
                  </SelectItem>
                  <SelectItem value="12">12 ads per page</SelectItem>
                  <SelectItem value="24">24 ads per page</SelectItem>
                  <SelectItem value="48">48 ads per page</SelectItem>
                </SelectContent>
              </Select>
            }
          />
        </div>
      </div>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel onResize={setLeftPanelSize} defaultSize={leftPanelSize}>
          <ScrollArea className={cn("scroll-smooth", height)}>
            <div
              className={`grid grid-cols-${leftPanelSize > 50 && width && width > 900 ? 2 : 1}`}
            >
              {currentPage?.map((data, index) => (
                <CardComponent
                  key={index}
                  data={data}
                  user={user}
                  carouselProps={{
                    className: leftPanelSize < 50 ? "basis-full" : "",
                  }}
                  className={cn(
                    tableName == "roommates" ? "flex-wrap justify-start" : "",
                    tableName == "roommates" && leftPanelSize < 50
                      ? "justify-center"
                      : ""
                  )}
                />
              ))}
            </div>
          </ScrollArea>
        </ResizablePanel>
        {ListingMapComponent && features ? (
          <>
            <ResizableHandle
              withHandle
              handleChild={
                <MapIcon strokeWidth={1} size={32} className="dark:invert" />
              }
              handleChildClassName="w-14 h-14 rounded-full bg-white/95"
              className="bg-transparent"
            />
            <ResizablePanel
              className={height}
              onResize={setRightPanelSize}
              defaultSize={rightPanelSize}
            >
              {rightPanelSize > 10 && (
                <ListingMapComponent features={finalFeatures} />
              )}
            </ResizablePanel>
          </>
        ) : (
          <></>
        )}
      </ResizablePanelGroup>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={previousPage!} />
          </PaginationItem>
          {pages?.map(
            (_, i) =>
              i < 3 && (
                <PaginationItem>
                  <PaginationLink onClick={() => setPage(i)}>
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              )
          )}
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          {pageIndex > 2 && (
            <PaginationItem>
              <PaginationLink onClick={() => setPage(pageIndex)}>
                {pageIndex + 1}
              </PaginationLink>
            </PaginationItem>
          )}
          <PaginationItem>
            <PaginationNext onClick={nextPage!} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
