import React from "react";
import AudioUpload from "~/components/Audio/Upload";
import Page from "~/components/Shared/Page";

export default function UploadPage() {
  return (
    <Page title="Upload Audio" loginRequired>
      <AudioUpload />
    </Page>
  );
}
