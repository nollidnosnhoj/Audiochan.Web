import axios from "axios";
import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import request from "~/lib/request";
import { useCreateAudio, useEditAudio } from "~/lib/services/audio";
import { objectToFormData } from "~/utils";
import { apiErrorToast } from "~/utils/toast";
import { Box, Button, Progress, VStack } from "@chakra-ui/react";
import AudioUploadForm from "./Form";
import { Audio as AudioEntity, EditAudioRequest } from "~/lib/types/audio";

interface AudioUploadingProps {
  file: File;
}

type GetPresignedUrl = {
  id: string;
  url: string;
};

export default function AudioUploading(props: AudioUploadingProps) {
  const { file } = props;

  const [url, setUrl] = useState("");
  const [id, setId] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [formSubmission, setFormSubmission] = useState<
    EditAudioRequest | undefined
  >(undefined);
  const { mutateAsync: uploadAudio } = useCreateAudio();

  /** Get the S3 Presigned URL when the file is accepted */
  useEffect(() => {
    if (file) {
      request<GetPresignedUrl>("upload", {
        method: "post",
        data: { fileName: file.name },
      })
        .then(({ data }) => {
          setId(data.id);
          setUrl(data.url);
        })
        .catch((err) => apiErrorToast(err));
    }
  }, [file]);

  useEffect(() => {
    if (formSubmission && uploaded) {
      request<AudioEntity>(`audios/${id}`, {
        method: "patch",
        data: formSubmission,
      })
        .then(() => {})
        .catch((err) => {
          apiErrorToast(err);
        });
    }
  }, [formSubmission, uploaded]);

  /**
   * Upload file to S3 Presigned URL.
   * After upload, then create
   */
  useEffect(() => {
    if (url && id) {
      axios
        .put(url, file, {
          headers: { "Content-Type": file.type },
          onUploadProgress: (evt) => {
            const currentProgress = (evt.loaded / evt.total) * 100;
            setProgress(currentProgress);
          },
        })
        .then(() => {
          setUploaded(true);
          var audio = new Audio();
          audio.src = window.URL.createObjectURL(file);
          audio.onloadedmetadata = () => {
            const body = {
              id: id,
              title: file.name,
              fileName: file.name,
              duration: audio.duration,
            };

            if (formSubmission) {
              Object.assign(body, formSubmission);
            }

            var formData = objectToFormData(body);

            uploadAudio(formData)
              .then(() => {
                setUploaded(true);
              })
              .catch((err) => {
                apiErrorToast(err);
              });
          };
        });
    }
  }, [url, id]);

  return (
    <VStack spacing={4}>
      <Box>
        {!uploaded ? (
          <Progress
            hasStripe
            value={progress}
            isAnimated
            isIndeterminate={progress >= 100 && !uploaded}
          />
        ) : (
          <NextLink href={`audios/${id}`} passHref>
            <Button>Go to audio</Button>
          </NextLink>
        )}
      </Box>
      {!formSubmission && (
        <AudioUploadForm
          file={file}
          onSubmit={(values) => setFormSubmission(values)}
        />
      )}
    </VStack>
  );
}
