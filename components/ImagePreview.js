import { useState, useRef } from "react";
import Image from "next/image";
import styles from "./ImagePreview.module.css";

const ImagePreview = ({
  attachments,
  onAttachmentsChange,
  multiple,
  type,
  defaultImage,
}) => {
  const [previewUrls, setPreviewUrls] = useState([]);
  const [singlePreviewUrl, setSinglePreviewUrl] = useState(
    defaultImage || null
  );
  const inputRef = useRef(null);

  const UploadIcon = (
    <svg
      className={styles.uploadIcon}
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      width="80"
      height="80"
      fill="#ffffff"
      viewBox="0 0 3072 3072"
    >
      <path d="M1290.1 329.6c-134.8 145-245 264-244.9 264.4.2.4 20.1 19.1 44.2 41.5l43.9 40.9 5.1-5.6c2.8-3.1 79.8-86 171.1-184.2l166-178.5.5 935.7c.4 781.2.7 936.4 1.8 939.7 6.7 19.8 23.6 36 42.8 40.9 8 2.1 22.8 2.1 30.8 0 19.2-4.9 36.1-21.1 42.8-40.9 1.1-3.3 1.4-158.5 1.8-939.7l.5-935.8 170.9 183.8c94 101 171.2 183.7 171.6 183.7.8 0 87.3-80.3 87.8-81.5.3-.8-489.7-528-490.8-528-.4 0-111 118.6-245.9 263.6z" />
      <path d="M454 937.5c-93.7 8.7-181.5 45.3-253.5 105.6-16.7 13.9-46.5 43.9-59.7 59.9-59.3 72.1-94.9 159-103.3 252.5-2.2 24.1-2.2 1236.9 0 1261 8.5 95 44.8 182.4 105.6 255 13.9 16.7 43.9 46.5 59.9 59.7 72.1 59.3 159 94.9 252.5 103.3 24.1 2.2 2136.9 2.2 2161 0 83.6-7.5 160.3-36 228.5-84.9 37.6-26.9 77.7-67 104.6-104.6 48.9-68.2 77.4-144.9 84.9-228.5 2.2-24.1 2.2-1236.9 0-1261-8.5-95-44.8-182.4-105.6-255-13.9-16.7-43.9-46.5-59.9-59.7-72.1-59.3-159-94.9-252.5-103.3-24.2-2.2-258.1-2.2-267.4 0-20.5 4.9-38.7 23.1-43.6 43.6-.8 3.5-1.5 10.2-1.5 14.9 0 17.1 5.6 30.7 17.5 42.5 6.9 7 16.1 12.7 25 15.6 3.1 1 30.8 1.4 127.5 2 104.8.5 125.5.9 137 2.2 44.6 5.4 77.7 15.1 115.7 33.8 35.6 17.7 62.8 37.5 91.4 66.6 27.3 27.8 44.9 52.5 61.8 86.6 19.4 39.3 29.7 75.6 34.3 121.2 1.9 19.3 1.9 1219.7 0 1239-4.6 45.6-14.9 81.9-34.3 121.2-16.9 34.1-34.5 58.8-61.8 86.6-28.6 29.1-55.8 48.9-91.4 66.6-39.3 19.4-75.6 29.7-121.2 34.3-19.3 1.9-2119.7 1.9-2139 0-45.6-4.6-81.9-14.9-121.2-34.3-35.6-17.7-62.8-37.5-91.4-66.6-27.3-27.8-44.9-52.5-61.8-86.6-19.4-39.3-29.7-75.6-34.3-121.2-1.9-19.3-1.9-1219.7 0-1239 4.6-45.6 14.9-81.9 34.3-121.2 17.7-35.6 37.5-62.8 66.6-91.4 27.8-27.3 52.5-44.9 86.6-61.8 38-18.7 71.1-28.4 115.7-33.8 11.5-1.3 32.2-1.7 137-2.2 96.7-.6 124.4-1 127.5-2 19.8-6.4 36.4-23.9 41-43.2 1.9-8.2 1.9-21.6 0-29.8-4.9-20.5-23.1-38.7-43.6-43.6-5.5-1.3-23.2-1.5-130.9-1.4-91 .1-128.1.5-138 1.4z" />
    </svg>
  );

  const handleAttachmentChange = (event) => {
    event.preventDefault();
    const files = Array.from(event.target.files);
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

    const filteredFiles = files
      .filter((file) => allowedTypes.includes(file.type))
      .slice(0, 10);

    if (multiple) {
      onAttachmentsChange([...attachments, ...filteredFiles]);
      setPreviewUrls([
        ...previewUrls,
        ...filteredFiles.map((file) => URL.createObjectURL(file)),
      ]);
    } else {
      onAttachmentsChange(filteredFiles[0]);
      setPreviewUrls([URL.createObjectURL(filteredFiles[0])]);
      setSinglePreviewUrl(URL.createObjectURL(filteredFiles[0])); // Mettez à jour singlePreviewUrl
    }

    // Réinitialise la valeur de l'élément d'entrée
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDelete = (index) => {
    if (Array.isArray(attachments)) {
      const newAttachments = attachments.filter((_, i) => i !== index);
      onAttachmentsChange(newAttachments);
    } else {
      onAttachmentsChange(null);
    }

    // Réinitialise la valeur de l'élément d'entrée
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const previewImages = Array.isArray(attachments)
    ? attachments.map((attachment, index) => (
        <div className={styles.imageWrapper} key={index}>
          <Image
            key={index}
            className={styles.previewImage}
            height={128}
            width={128}
            src={URL.createObjectURL(attachment)}
            alt={`Prévisualisation ${index + 1}`}
          />
          <div
            className={styles.deleteButton}
            onClick={() => handleDelete(index)}
          >
            &times;
          </div>
        </div>
      ))
    : attachments
    ? [
        <div className={styles.imageWrapper} key={0}>
          <Image
            className={styles.previewImage}
            height={128}
            width={128}
            src={URL.createObjectURL(attachments)}
            alt={`Prévisualisation`}
          />
          <div className={styles.deleteButton} onClick={() => handleDelete(0)}>
            &times;
          </div>
        </div>,
      ]
    : [];

  return (
    <>
      <input
        ref={inputRef}
        className={styles.attachmentInput}
        type="file"
        id="post-image"
        name="attachment"
        accept="image/*"
        multiple={multiple}
        onChange={handleAttachmentChange}
        style={{ display: "none" }}
      />
      <button
        className={styles.uploadButton}
        onClick={handleClick}
        type="button"
        style={{
          ...(type === "profile-picture" && { borderRadius: "9999px" }),
          ...(!multiple && singlePreviewUrl
            ? {
                backgroundImage: `url(${singlePreviewUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "128px",
                width: "128px",
              }
            : {}),
        }} // Condition ternaire pour déterminer le style du bouton d'upload
      >
        {!multiple && (
          <div className={styles.deleteButton} onClick={() => handleDelete(0)}>
            &times;
          </div>
        )}
        {!multiple && singlePreviewUrl ? null : (
          <p className={styles.uploadButtonContent}>
            {UploadIcon}

            <span>Upload image</span>
            <span>15Mo max.</span>
          </p>
        )}
      </button>
      {multiple && (
        <div className={styles.previewContainer}>{previewImages}</div>
      )}
    </>
  );
};

ImagePreview.defaultProps = {
  multiple: false,
};

export default ImagePreview;
