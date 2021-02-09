import React from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { EditAudioRequest, UploadAudioRequest } from "~/lib/types/audio";
import { uploadAudioSchema } from "~/lib/validationSchemas";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Flex, Box, Spacer, Button, Text } from "@chakra-ui/react";
import { DevTool } from "@hookform/devtools";
import InputCheckbox from "~/components/Form/Checkbox";
import GenreSelect from "~/components/Form/GenreSelect";
import TagInput from "~/components/Form/TagInput";
import TextInput from "~/components/Form/TextInput";

interface AudioUploadFormProps {
  file?: File;
  onSubmit: (values: EditAudioRequest) => void;
}

export default function AudioUploadForm(props: AudioUploadFormProps) {
  const onSubmit = (values: UploadAudioRequest) => {
    props.onSubmit(values);
  };

  const methods = useForm<UploadAudioRequest>({
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

  return (
    <Flex justify="center">
      <Box width="100%">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box>
              <TextInput
                name="title"
                type="text"
                label="Title"
                placeholder={props.file?.name}
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
              <Flex marginY={4} alignItems="center">
                <Text>By uploading, you agree to our terms and service.</Text>
                <Spacer />
                <Button type="submit" disabled={!props.file}>
                  Submit
                </Button>
              </Flex>
            </Box>
          </form>
        </FormProvider>
        <DevTool control={control} />
      </Box>
    </Flex>
  );
}
