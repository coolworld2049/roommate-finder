"use server";

import { DaDataMetroStation } from "@/lib/dadata/types";

export const dadataSuggestMetro = async (
  query: string,
  filters?: Record<string, string>[]
) => {
  const url =
    "http://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/metro";

  const options = {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Token " + process.env.NEXT_PUBLIC_DADATA_KEY,
    },
    body: JSON.stringify({
      query: query,
      ...filters,
    }),
  } satisfies RequestInit;
  try {
    const resp = await fetch(url, {
      ...options,
    });
    const result: { suggestions: DaDataMetroStation[] } = await resp.json();
    return result;
  } catch (error) {
    return { suggestions: [] };
  }
};
