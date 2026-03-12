import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import React, { useContext, useRef, useState } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import { FormattedMessage, useIntl } from "react-intl";

import { Button } from "@mui/material";
import PodcastEngine from "podcastsuite";
import { AppContext } from "../App";
import { AppContextValue, PodcastEntry } from "../types/app";
import { APP_COMMIT_REF, APP_VERSION } from "../version";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import BrightnessLowIcon from "@mui/icons-material/WbSunny";
import BrightnessHighIcon from "@mui/icons-material/NightsStay";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";

import { initializeLibrary } from "../engine";
import { exportOpmlWithNativeDialog, hasNativeOpmlDialogs, importOpmlFromNativeDialog } from "../platform/opmlDialogs";
import { buildOpml, parseOpml } from "./opml";
import { importFeeds } from "./opmlImporter";

import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";

import { SUPPORTED_LOCALES, LOCALE_LABELS, getBrowserLocale, type SupportedLocale } from "../i18n/locale";

const Settings: React.FC = () => {
  const { state, dispatch, engine } = useContext(AppContext) as AppContextValue;
  const intl = useIntl();

  const [notice, setNotice] = useState<{ open: boolean; message: string; severity: "success" | "info" | "warning" | "error" }>(
    {
      open: false,
      message: "",
      severity: "info",
    }
  );

  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ done: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showExportSuccessNotice = (count: number) => {
    setNotice({
      open: true,
      message: intl.formatMessage(
        { id: "settings.exportSuccess", defaultMessage: "Exported {count} podcasts to OPML." },
        { count }
      ),
      severity: "success",
    });
  };

  const exportOpmlToBrowser = (opml: string, suggestedFileName: string) => {
    const blob = new Blob([opml], { type: "text/x-opml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = suggestedFileName;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  };

  const themeSwitcher = (_ev: React.MouseEvent<HTMLElement>, input: string | null) => {
    if (!input) return;
    dispatch({ type: "setDark", payload: input as AppContextValue["state"]["theme"] });
  };

  const themeNameSwitcher = (_ev: React.MouseEvent<HTMLElement>, input: string | null) => {
    if (!input) return;
    dispatch({ type: "setThemeName", payload: input as any });
  };

  const localeSwitcher = (event: React.ChangeEvent<{ value: unknown }> | any) => {
    const value = event.target.value as SupportedLocale;
    dispatch({ type: "setLocale", payload: value });
  };

  // Current locale: stored in state or detected from browser
  const currentLocale: SupportedLocale = (state.locale as SupportedLocale) || getBrowserLocale();

  const clearState = async () => {
    await dispatch({ type: "resetState" });
    await initializeLibrary(engine as any, dispatch);
  };

  const reloadCasts = async () => {
    await initializeLibrary(engine as any, dispatch);
  };

  const eraseThisPodcast = (podcast: string) => async () => {
    const podcasts = state.podcasts.filter((cast: PodcastEntry) => cast.domain !== podcast);
    dispatch({ type: "updatePodcasts", podcasts: podcasts as PodcastEntry[] });
    await (PodcastEngine as any).db.del(podcast);
  };

  const exportOpml = async () => {
    const feeds = (state.podcasts || [])
      .map((p: any) => ({
        url: (p.url || p.domain || "").toString(),
        title: p.title?.toString?.() || undefined,
      }))
      .filter((f) => !!f.url);

    const opml = buildOpml(feeds, { title: "Phonograph Subscriptions" });
    const suggestedFileName = `phonograph-subscriptions-${new Date().toISOString().slice(0, 10)}.opml`;

    try {
      const nativeExportStatus = await exportOpmlWithNativeDialog(opml, suggestedFileName);

      if (nativeExportStatus === "cancelled") {
        return;
      }

      if (nativeExportStatus === "unsupported") {
        exportOpmlToBrowser(opml, suggestedFileName);
      }

      showExportSuccessNotice(feeds.length);
    } catch (error: any) {
      setNotice({
        open: true,
        message:
          error?.message || intl.formatMessage({ id: "settings.exportFailed", defaultMessage: "Failed to export OPML." }),
        severity: "error",
      });
    }
  };

  const importOpmlText = async (text: string) => {
    setIsImporting(true);
    setImportProgress(null);

    try {
      const { feeds } = parseOpml(text);

      const existing = new Set(
        (state.podcasts || []).map((p: any) => (p.url || p.domain || "").toString())
      );

      const toImport = feeds.filter((f) => f.url && !existing.has(f.url));

      if (toImport.length === 0) {
        setNotice({
          open: true,
          message: intl.formatMessage({ id: "settings.importNoneFound", defaultMessage: "No new podcasts found to import." }),
          severity: "info",
        });
        return;
      }

      setImportProgress({ done: 0, total: toImport.length });

      const { successes, failures } = await importFeeds(engine, toImport, {
        timeoutMs: 15000,
        save: true,
        onProgress: (done, total) => setImportProgress({ done, total }),
      });

      await initializeLibrary(engine as any, dispatch);

      if (failures.length === 0) {
        setNotice({
          open: true,
          message: intl.formatMessage(
            { id: "settings.importSuccess", defaultMessage: "Imported {count} podcasts from OPML." },
            { count: successes.length }
          ),
          severity: "success",
        });
      } else {
        setNotice({
          open: true,
          message: intl.formatMessage(
            {
              id: "settings.importPartial",
              defaultMessage: "Imported {successCount}/{totalCount} podcasts. {failureCount} failed (check your connection or feed URLs).",
            },
            { successCount: successes.length, totalCount: toImport.length, failureCount: failures.length }
          ),
          severity: "warning",
        });
      }
    } catch (err: any) {
      setNotice({
        open: true,
        message: err?.message || intl.formatMessage({ id: "settings.importFailed", defaultMessage: "Failed to import OPML." }),
        severity: "error",
      });
    } finally {
      setIsImporting(false);
      setTimeout(() => setImportProgress(null), 500);
    }
  };

  const openFilePicker = async () => {
    if (isImporting) return;

    if (hasNativeOpmlDialogs()) {
      try {
        const selected = await importOpmlFromNativeDialog();
        if (!selected) return;
        await importOpmlText(selected.text);
      } catch (err: any) {
        setNotice({
          open: true,
          message: err?.message || intl.formatMessage({ id: "settings.importFailed", defaultMessage: "Failed to import OPML." }),
          severity: "error",
        });
      }
      return;
    }

    fileInputRef.current?.click();
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (ev) => {
    const file = ev.target.files?.[0];
    ev.target.value = ""; // allow re-importing the same file
    if (!file) return;
    await importOpmlText(await file.text());
  };

  const { podcasts } = state;

  return (
    <>
      <AppBar sx={{ WebkitAppRegion: "drag" }} position="static">
        <Toolbar variant="dense">
          <Typography variant="h6">
            <FormattedMessage id="settings.title" defaultMessage="Settings" />
          </Typography>
        </Toolbar>
      </AppBar>

      <Card>
        <CardContent>
          <Typography variant={"h5"}>
            <FormattedMessage id="settings.configurations" defaultMessage="Configurations" />
          </Typography>
          <FormattedMessage id="settings.version" defaultMessage="Version:" /> {APP_VERSION}
          {APP_COMMIT_REF ? ` (${APP_COMMIT_REF.slice(0, 7)})` : ""}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant={"h6"} gutterBottom>
            <FormattedMessage id="settings.themeSelector" defaultMessage="Theme Selector" />
          </Typography>
          <ToggleButtonGroup
            value={state.theme}
            exclusive
            onChange={themeSwitcher}
            aria-label={intl.formatMessage({ id: "a11y.themeSelector", defaultMessage: "theme selector" })}
          >
            <ToggleButton value={"light"} aria-label={intl.formatMessage({ id: "a11y.lightTheme", defaultMessage: "Light theme" })}>
              <BrightnessLowIcon />
            </ToggleButton>
            <ToggleButton value={"dark"} aria-label={intl.formatMessage({ id: "a11y.darkTheme", defaultMessage: "Dark theme" })}>
              <BrightnessHighIcon />
            </ToggleButton>
            <ToggleButton value={"os"} aria-label={intl.formatMessage({ id: "a11y.osPreference", defaultMessage: "OS preference" })}>
              <FormattedMessage id="settings.osTheme" defaultMessage="OS" />
            </ToggleButton>
          </ToggleButtonGroup>

          <div style={{ marginTop: 12 }}>
            <Typography variant="subtitle1" gutterBottom>
              <FormattedMessage id="settings.themePalette" defaultMessage="Theme Palette" />
            </Typography>
            <ToggleButtonGroup
              value={state.themeName || "nord"}
              exclusive
              onChange={themeNameSwitcher}
              aria-label={intl.formatMessage({ id: "a11y.themePaletteSelector", defaultMessage: "theme palette selector" })}
            >
              <ToggleButton value={"legacy"}>
                <FormattedMessage id="settings.themeLegacy" defaultMessage="Legacy" />
              </ToggleButton>
              <ToggleButton value={"nord"}>
                <FormattedMessage id="settings.themeNord" defaultMessage="Nord" />
              </ToggleButton>
              <ToggleButton value={"dracula"}>
                <FormattedMessage id="settings.themeDracula" defaultMessage="Dracula" />
              </ToggleButton>
              <ToggleButton value={"highContrast"}>
                <FormattedMessage id="settings.themeHighContrast" defaultMessage="High Contrast" />
              </ToggleButton>
            </ToggleButtonGroup>
          </div>

          <div style={{ marginTop: 12 }}>
            <Typography variant="subtitle1" gutterBottom>
              <FormattedMessage id="settings.podcastView" defaultMessage="Podcast View" />
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={state.podcastViewEnabled !== false}
                  onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                    dispatch({ type: "setPodcastViewEnabled", payload: ev.target.checked })
                  }
                  name="podcastViewEnabled"
                  color="primary"
                />
              }
              label={intl.formatMessage({ id: "settings.enablePodcastView", defaultMessage: "Enable Podcast View" })}
            />
          </div>

          <div style={{ marginTop: 12 }}>
            <Typography variant="subtitle1" gutterBottom>
              <FormattedMessage id="settings.language" defaultMessage="Language" />
            </Typography>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="language-select-label">
                <FormattedMessage id="settings.language" defaultMessage="Language" />
              </InputLabel>
              <Select
                labelId="language-select-label"
                id="language-select"
                value={currentLocale}
                onChange={localeSwitcher}
                label={intl.formatMessage({ id: "settings.language", defaultMessage: "Language" })}
                aria-label={intl.formatMessage({ id: "a11y.languageSelector", defaultMessage: "language selector" })}
              >
                {SUPPORTED_LOCALES.map((loc) => (
                  <MenuItem key={loc} value={loc}>
                    {LOCALE_LABELS[loc]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant={"h6"} gutterBottom>
            <FormattedMessage id="settings.importExport" defaultMessage="Import / Export (OPML)" />
          </Typography>

          <input
            ref={fileInputRef}
            type="file"
            accept={".opml,application/xml,text/xml,text/x-opml"}
            onChange={onFileChange}
            style={{ display: "none" }}
          />

          <Button
            variant="outlined"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={exportOpml}
            disabled={isImporting}
            sx={{ mr: 1 }}
          >
            <FormattedMessage id="settings.exportOpml" defaultMessage="Export OPML" />
          </Button>

          <Button
            variant="outlined"
            color="primary"
            startIcon={<UploadFileIcon />}
            onClick={openFilePicker}
            disabled={isImporting}
          >
            <FormattedMessage id="settings.importOpml" defaultMessage="Import OPML" />
          </Button>

          {importProgress ? (
            <div style={{ marginTop: 12 }}>
              <Typography variant="caption">
                <FormattedMessage
                  id="settings.importingProgress"
                  defaultMessage="Importing {done}/{total}…"
                  values={{ done: importProgress.done, total: importProgress.total }}
                />
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(importProgress.done / Math.max(1, importProgress.total)) * 100}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
            <Typography variant="h6" gutterBottom>
              <FormattedMessage id="settings.data" defaultMessage="Data" />
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List style={{ width: "100%" }}>
              <Divider />
              {podcasts &&
                podcasts.map((podcast: PodcastEntry) => (
                  <div key={podcast.domain as string}>
                    <ListItem
                      secondaryAction={
                        <IconButton
                          aria-label={intl.formatMessage({ id: "a11y.delete", defaultMessage: "Delete" })}
                          onClick={eraseThisPodcast(podcast.domain as string)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        secondary={
                          <Typography component="span" variant="subtitle1">
                            {podcast.title} <br />
                            <Typography component="span" variant="caption">
                              {podcast.created ? intl.formatDate(new Date(podcast.created as number), { dateStyle: "medium", timeStyle: "short" }) : ""}
                            </Typography>
                          </Typography>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </div>
                ))}
            </List>
          </AccordionDetails>
        </Accordion>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Button variant="outlined" color="primary" onClick={clearState} disabled={isImporting}>
            <FormattedMessage id="settings.resetState" defaultMessage="Reset State" />
          </Button>
          <Button variant="outlined" color="primary" onClick={reloadCasts} disabled={isImporting}>
            <FormattedMessage id="settings.reloadPodcasts" defaultMessage="Reload Saved Podcasts" />
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ textAlign: "center" }}>
          <Typography variant="h5">Phonograph</Typography>
          <Typography>
            <FormattedMessage id="settings.developedIn" defaultMessage="is developed with ❤️ in Jersey City, NJ" />
          </Typography>
        </CardContent>
      </Card>

      <Snackbar
        open={notice.open}
        autoHideDuration={4000}
        onClose={() => setNotice((n) => ({ ...n, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setNotice((n) => ({ ...n, open: false }))} severity={notice.severity} variant="filled">
          {notice.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Settings;
