"use client";

import { getDownloadURL, ref } from "firebase/storage";
import { useEffect, useState } from "react";
import { getStorage } from "firebase/storage";
import Image, { ImageProps } from "next/image";

type Props = {
  path: string;
  className?: string;
  fit?: "cover" | "contain";
} & Omit<ImageProps, "src">;

export default function StorageImage(props: Props) {
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (props.path.startsWith("https://")) {
      console.log("https://", props.path);
      setImage(props.path);
    } else {
      const storage = getStorage();
      const storageRef = ref(storage, props.path);
      getDownloadURL(storageRef).then((url) => {
        setImage(url);
      });
    }
  }, [props.path]);

  return (
    <>
      {image && (
        <Image
          src={image}
          alt={props.alt}
          width={props.width}
          height={props.height}
          className={props.className}
        />
      )}
    </>
  );
}
