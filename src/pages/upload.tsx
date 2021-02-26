import React from "react";
import Page from "~/components/Page";
import AudioUpload from "~/features/audio/components/Upload";

export default function UploadPage() {
  return (
    <Page title="Upload Audio" loginRequired>
      <AudioUpload />
    </Page>
  );
}
