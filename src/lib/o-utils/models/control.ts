import { z } from "zod";

export const controlSchema = z.object({
  code: z.string(),
  lat: z.number(),
  lon: z.number(),
});

export default interface Control {
  code: string;
  lat: number;
  lon: number;
}
