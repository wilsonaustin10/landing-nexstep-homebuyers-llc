interface Window {
  gtag: (
    command: string,
    ...args: any[]
  ) => void;
  dataLayer: any[];
  google?: any;
  gtag_report_conversion?: (url?: string) => boolean;
}