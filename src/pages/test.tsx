import dynamic from "next/dynamic";
import BasicDocument, { profilePDF, workoutsPDF } from "../utils/pdf";

export const DownloadButton = dynamic(
  async () => (await import("@react-pdf/renderer")).PDFDownloadLink,
  {
    ssr: false,
  },
);

const Test = () => {
  return (
    <DownloadButton
      className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
      document={<BasicDocument profile={profilePDF} workouts={workoutsPDF} />}
      fileName="somename.pdf"
    >
      asdasd
    </DownloadButton>
  );
};

export default Test;
