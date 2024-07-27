export interface DaDataMetroStation {
  value: string;
  unrestricted_value: string;
  data: {
    city_kladr_id: string;
    city_fias_id: string;
    city: string;
    name: string;
    line_id: string;
    line_name: string;
    geo_lat: number;
    geo_lon: number;
    color: string;
    is_closed: boolean | null;
  };
}
