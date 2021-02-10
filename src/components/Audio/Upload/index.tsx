import {
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react";
import { DevTool } from "@hookform/devtools";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { FaCloudUploadAlt } from "react-icons/fa";
import AudioUploadDropzone from "./Dropzone";
import AudioUploading from "./Uploading";
import InputCheckbox from "~/components/Form/Checkbox";
import GenreSelect from "~/components/Form/GenreSelect";
import TagInput from "~/components/Form/TagInput";
import TextInput from "~/components/Form/TextInput";
import SETTINGS from "~/constants/settings";
import { AudioRequest } from "~/lib/types/audio";
import { uploadAudioSchema } from "~/lib/validationSchemas";
import { formatFileSize } from "~/utils/format";
import { errorToast } from "~/utils/toast";
import Picture from "~/components/Shared/Picture";
import PictureDropzone from "~/components/Shared/Picture/PictureDropzone";

interface AudioUploadProps {
  maxFileSize?: number;
  validContentTypes?: string[];
}

export default function AudioUpload(props: AudioUploadProps) {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [picture, setPicture] = useState("");
  const [value, setValue] = useState<AudioRequest | undefined>(undefined);
  const [submit, setSubmit] = useState(false);
  const methods = useForm<AudioRequest>({
    defaultValues: {
      title: "",
      description: "",
      tags: [],
      isPublic: true,
      genre: "",
    },
    resolver: yupResolver(uploadAudioSchema),
  });

  const {
    handleSubmit,
    errors,
    control,
    formState: { isSubmitting },
  } = methods;

  if (file && submit) {
    return <AudioUploading file={file} form={value} picture={picture} />;
  }

  return (
    <Box>
      <AudioUploadDropzone
        files={file ? [file] : []}
        onDropAccepted={(files) => {
          setFile(files[0]);
        }}
      />
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit((data) => {
            setValue(data);
            setSubmit(true);
          })}
        >
          <Flex>
            <Flex flex="1" justifyContent="center">
              <Box padding={4} textAlign="center">
                <Picture src={picture} size={200} disableNextImage />
                <PictureDropzone
                  name="image"
                  image={picture}
                  onChange={async (file) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => {
                      setPicture(reader.result as string);
                    };
                  }}
                />
              </Box>
            </Flex>
            <Box flex="3">
              <TextInput
                name="title"
                type="text"
                label="Title"
                placeholder={file?.name}
                disabled={isSubmitting}
              />
              <TextInput
                name="description"
                label="Description"
                textArea
                disabled={isSubmitting}
              />
              <GenreSelect
                name="genre"
                placeholder="Select Genre"
                disabled={isSubmitting}
              />
              <Controller
                name="tags"
                control={control}
                render={({ name, value, onChange }) => (
                  <TagInput
                    name={name}
                    value={value}
                    onChange={onChange}
                    error={errors.tags && errors.tags[0]}
                    disabled={isSubmitting}
                  />
                )}
              />
              <InputCheckbox
                name="isPublic"
                label="Public?"
                disabled={isSubmitting}
                required
                toggleSwitch
              />
            </Box>
          </Flex>
          <Flex marginY={4} alignItems="center">
            <Text>By uploading, you agree to our terms and service.</Text>
            <Spacer />
            <Button type="submit" disabled={!file}>
              Upload
            </Button>
          </Flex>
        </form>
      </FormProvider>
    </Box>
  );
}
