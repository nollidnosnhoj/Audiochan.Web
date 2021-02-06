import React from "react";
import Page from "~/components/Shared/Page";
import AudioUpload from "~/components/Audio/Upload";

export default function UploadPage() {
  return (
    <Page title="Upload Audio" loginRequired>
      <AudioUpload />
    </Page>
  );
}
