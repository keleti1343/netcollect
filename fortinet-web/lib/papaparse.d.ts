declare module "papaparse" {
  export function parse(
    csv: string,
    options?: {
      header?: boolean;
      dynamicTyping?: boolean;
    }
  ): {
    data: any[];
  };
}