import { usePDF } from "@react-pdf/renderer";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import WorkoutDocument from "../utils/pdf";

const DownloadPDF: typeof WorkoutDocument = ({ profile, workouts }) => {
  const [pdf] = usePDF({ document: <WorkoutDocument profile={profile} workouts={workouts} /> });

  const [anchor, setAnchor] = useState<HTMLAnchorElement | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (anchor) {
      anchor.click();
      router.back();
    }
  }, [anchor, router]);

  return (
    <div className="hidden">
      {pdf.url && pdf.blob && (
        <a
          href={pdf.url}
          download={`Treino - ${profile.user?.name ?? profile.email}.pdf`}
          ref={setAnchor}
        >
          Baixar PDF
        </a>
      )}
    </div>
  );
};

export default DownloadPDF;
