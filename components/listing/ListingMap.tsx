"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  YMapDefaultSchemeLayer,
  YMapDefaultFeaturesLayer,
  YMapControls,
  YMapGeolocationControl,
  YMap,
  YMapMarker,
  YMapCustomClusterer,
  YMapDefaultMarker,
  YMapControlButton,
  YMapListener,
} from "ymap3-components";
import { useTheme } from "next-themes";
import {
  LngLat,
  MapEventResizeHandler,
  MapEventUpdateHandler,
  YMapLocationRequest,
  YMapProps,
  YMapTheme,
} from "@yandex/ymaps3-types";
import { Feature } from "@yandex/ymaps3-types/packages/clusterer";
import { YMap as YMapsYMap } from "@yandex/ymaps3-types";
import { Large, Muted, Small } from "../ui/typography";
import { getBounds } from "geolib";
import { cn } from "@/lib/utils";
import { Circle, FullscreenIcon } from "lucide-react";
import { DaDataAddress } from "react-dadata";
import { Database } from "@/types/database.types";
import UniversityIcon from "../icons/UniversityIcon";
import { YMapLocation } from "@yandex/ymaps3-types/imperative/YMap";
import { Badge } from "../ui/badge";

export interface ListingMapFeature extends Feature {
  properties?: Record<string, unknown>;
  tableName: Extract<keyof Database["public"]["Tables"], string>;
}

export interface ListingMapProps extends Omit<YMapProps, "location"> {
  features: ListingMapFeature[];
}

const ListingMap = ({ features, ...props }: ListingMapProps) => {
  const ymap3Ref = useRef<YMapsYMap>(null);

  const theme = useTheme();
  const currentTheme = theme.resolvedTheme as YMapTheme;
  const center = [37.64, 55.76];
  const bounds =
    features && features.length > 0
      ? getBounds(features.map((v) => v.geometry.coordinates))
      : {
          minLng: center[0],
          maxLng: center[1],
          minLat: center[0],
          maxLat: center[1],
        };

  const [location, setLocation] = useState({
    center: [37.64, 55.76],
    zoom: 9,
    bounds: [
      [bounds.minLng, bounds.minLat],
      [bounds.maxLng, bounds.maxLat],
    ],
  } satisfies YMapLocationRequest);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const onClickHandler = useCallback(() => {
    if (isFullscreen) {
      document.exitFullscreen();
    } else {
      ymap3Ref.current?.container.requestFullscreen();
    }
  }, [isFullscreen]);

  const [markerSizePixels, setMarkerSizePixels] = useState(150);
  const [mapZoom, setMapZoom] = useState(location.zoom);

  const updateHandler = ({
    location: locationUpdate,
  }: {
    location: YMapLocation;
    mapInAction: boolean;
  }) => {
    let size = locationUpdate.zoom ** 2;
    if (locationUpdate.zoom > 12) {
      size += 100;
    }
    if (locationUpdate.zoom >= 14) {
      size *= 2.5;
    }
    setMapZoom(locationUpdate.zoom);
    setMarkerSizePixels(size);
  };

  const cluster = useCallback((coordinates: LngLat, features: Feature[]) => {
    return (
      <YMapMarker coordinates={coordinates}>
        <span
          style={{
            borderRadius: "50%",
            background: "#8774e1",
            color: "white",
            width: 50,
            height: 50,
            outline: `solid 3px #8774e1`,
            outlineOffset: "3px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Large>{features.length}</Large>
        </span>
      </YMapMarker>
    );
  }, []);

  const marker = useCallback(
    (feature: Feature) => {
      const price = `${(feature.properties?.rent_price_month as string) ?? (feature.properties?.budget_month as string)}`;
      const address = feature.properties?.address_data as Record<
        string,
        any
      > as DaDataAddress;
      return (
        <YMapMarker coordinates={feature.geometry.coordinates}>
          <Circle
            size={markerSizePixels}
            strokeWidth={0.25}
            className="stroke-purple-400 fill-purple-500/30 cursor-pointer translate-x-[-50%] translate-y-[-50%]"
          />
          <div
            className={`flex flex-col gap-1 w-[300px] absolute -top-32 bg-white/70 dark:text-black rounded-xl p-1.5`}
          >
            <Small className={cn("line-clamp-1")}>
              {feature.properties?.title as string}
            </Small>
            <div className="flex flex-row gap-x-1 items-center">
              <Badge
                className={cn(
                  "line-clamp-1 w-fit rounded-full dark:text-black"
                )}
                variant={"outline"}
              >
                {feature.properties?.university_name as string}
              </Badge>
              <Muted className="dark:text-black text-xs">
                {address?.city_with_type} {address?.city_district_with_type}{" "}
                {address?.street_with_type}
              </Muted>
            </div>
            <Small>{Number(price).toLocaleString()} RUB/month</Small>
          </div>
        </YMapMarker>
      );
    },
    [markerSizePixels]
  );

  const university_marker = useCallback((feature: Feature) => {
    return (
      <YMapMarker coordinates={feature.geometry.coordinates}>
        <div className="flex flex-row items-center ml-20 gap-1 cursor-pointer translate-x-[-50%] translate-y-[-50%]">
          <UniversityIcon width="50" height="50" />
          <div className="flex flex-col items-start w-[180px] bg-white/70 rounded-xl p-1.5 max-w-xl">
            <Small className="dark:text-black">
              {feature.properties?.university_name as string}
            </Small>
            <Muted className="text-xs dark:text-black">
              {feature.properties?.university_address as string}
            </Muted>
          </div>
        </div>
      </YMapMarker>
    );
  }, []);

  return (
    <YMap
      key="map"
      ref={ymap3Ref}
      location={location}
      mode="vector"
      theme={currentTheme}
      className="rounded-lg"
      zoomStrategy="zoomToPointer"
      zoomRange={{ min: 0, max: 15 }}
      zoomRounding="smooth"
      {...props}
    >
      <YMapDefaultSchemeLayer />
      <YMapDefaultFeaturesLayer />
      <YMapCustomClusterer
        marker={marker}
        cluster={cluster}
        gridSize={128}
        features={features.filter(
          (v) => v.tableName == "roommates" || v.tableName == "properties"
        )}
      />
      {features.map(
        (v) => v.tableName == "profile_universities" && university_marker(v)
      )}
      <YMapControls position="bottom left">
        <YMapGeolocationControl />
      </YMapControls>
      <YMapControls position="top right">
        <YMapControlButton onClick={onClickHandler}>
          <FullscreenIcon />
        </YMapControlButton>
      </YMapControls>
      <YMapListener onUpdate={updateHandler} />
    </YMap>
  );
};

export default ListingMap;
