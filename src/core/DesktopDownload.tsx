import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { FormattedMessage, useIntl } from "react-intl";

const RELEASES_LATEST_URL = "https://github.com/navio/phonograph/releases/latest";
const MAC_APPLE_SILICON_URL = `${RELEASES_LATEST_URL}/download/Phonograph-macOS-Apple-Silicon.dmg`;
const MAC_INTEL_URL = `${RELEASES_LATEST_URL}/download/Phonograph-macOS-Intel.dmg`;

const DesktopDownload: React.FC = () => {
  const intl = useIntl();

  return (
    <>
      <AppBar sx={{ WebkitAppRegion: "drag" }} position="static">
        <Toolbar variant="dense">
          <Typography variant="h6">
            <FormattedMessage id="download.title" defaultMessage="Download Desktop App" />
          </Typography>
        </Toolbar>
      </AppBar>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <FormattedMessage
              id="download.description"
              defaultMessage="Choose your Mac chip architecture to download the latest Phonograph desktop build."
            />
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              variant="contained"
              color="primary"
              component="a"
              href={MAC_APPLE_SILICON_URL}
              rel="noopener noreferrer"
            >
              <FormattedMessage id="download.appleSilicon" defaultMessage="Download for Apple Silicon" />
            </Button>

            <Button
              variant="contained"
              color="primary"
              component="a"
              href={MAC_INTEL_URL}
              rel="noopener noreferrer"
            >
              <FormattedMessage id="download.intel" defaultMessage="Download for Intel Mac" />
            </Button>

            <Button
              variant="outlined"
              color="primary"
              component="a"
              href={RELEASES_LATEST_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={intl.formatMessage({ id: "a11y.openDesktopDownloads", defaultMessage: "Open desktop downloads" })}
            >
              <FormattedMessage id="download.releaseNotes" defaultMessage="View Release Notes" />
            </Button>
          </Stack>

          <Typography variant="caption" sx={{ mt: 2, display: "block" }}>
            <FormattedMessage
              id="download.warning"
              defaultMessage="If macOS warns that the app is from an unidentified developer, right-click the app and choose Open once to trust it."
            />
          </Typography>
        </CardContent>
      </Card>
    </>
  );
};

export default DesktopDownload;
