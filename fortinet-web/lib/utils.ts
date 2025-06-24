import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { parse } from "papaparse";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function readCSV(path: string): Promise<any[]> {
  const response = await fetch(path);
  const csvText = await response.text();
  const result = parse(csvText, { header: true, dynamicTyping: true });
  return result.data;
}
