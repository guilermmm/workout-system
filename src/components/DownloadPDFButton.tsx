import dynamic from "next/dynamic";

const DownloadPDFButton = dynamic(
  async () => (await import("@react-pdf/renderer")).PDFDownloadLink,
  {
    ssr: false,
  },
);

export default DownloadPDFButton;
