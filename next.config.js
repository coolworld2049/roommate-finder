const dotenv = require("dotenv");

dotenv.config({ path: [".env"] });

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_API_EXTERNAL_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_YANDEX_MAP_KEY: process.env.NEXT_PUBLIC_YANDEX_MAP_KEY,
    NEXT_PUBLIC_DADATA_KEY: process.env.NEXT_PUBLIC_DADATA_KEY,
  },
};

module.exports = nextConfig;
