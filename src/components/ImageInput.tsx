import Image from "next/image";
import PlusIcon from "./icons/PlusIcon";

type Props = {
  className?: string;
  imageUrl: string | null;
  onChange: (imageUrl: string | null) => void;
};

export const ImageInput = ({ className, imageUrl, onChange }: Props) => {
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files === null) return;
    const file = files[0];
    if (file === undefined) return;
    void readFile(file).then(onChange);
  };

  return (
    <div className={className}>
      <label className="relative h-full w-full cursor-pointer">
        <div className="h-full w-full flex-col items-center">
          {imageUrl ? (
            <Image
              className="h-full w-full rounded-md object-cover"
              src={imageUrl}
              alt="Image"
              fill
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-evenly p-2">
              <div className="h-5" />
              <PlusIcon className="h-8 w-8 text-inherit" />
              <div className="text-sm text-inherit">Adicionar Imagem</div>
            </div>
          )}
          <input type="file" className="hidden" accept="image/*" onChange={handleImage} />
        </div>
      </label>
    </div>
  );
};

const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.readAsDataURL(file);
  });
};
