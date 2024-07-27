"use client";

import { YMapComponentsProvider } from "ymap3-components";

export default function YMapProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <YMapComponentsProvider
      apiKey={process.env.NEXT_PUBLIC_YANDEX_MAP_KEY!}
      lang="ru_RU"
    >
      {children}
    </YMapComponentsProvider>
  );
}
