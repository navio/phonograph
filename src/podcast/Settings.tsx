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

import { Button, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import PodcastEngine from "podcastsuite";
import { AppContext } from "../App";
import { AppContextValue, PodcastEntry } from "../types/app";
import { version } from "../../package.json";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import BrightnessLowIcon from "@mui/icons-material/WbSunny";
import BrightnessHighIcon from "@mui/icons-material/NightsStay";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";

import { initializeLibrary } from "../engine";
import { buildOpml, parseOpml } from "./opml";
import { importFeeds } from "./opmlImporter";

import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useTranslation } from "react-i18next";

const Settings: React.FC = () => {
  const { state, dispatch, engine } = useContext(AppContext) as AppContextValue;
  const { t, i18n } = useTranslation();

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

  const themeSwitcher = (_ev: React.MouseEvent<HTMLElement>, input: string | null) => {
    if (!input) return;
    dispatch({ type: "setDark", payload: input as AppContextValue["state"]["theme"] });
  };

  const themeNameSwitcher = (ev: any) => {
    const input = ev?.target?.value as string | undefined;
    if (!input) return;
    dispatch({ type: "setThemeName", payload: input as any });
  };

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

  const exportOpml = () => {
    const feeds = (state.podcasts || [])
      .map((p: any) => ({
        url: (p.url || p.domain || "").toString(),
        title: p.title?.toString?.() || undefined,
      }))
      .filter((f) => !!f.url);

    const opml = buildOpml(feeds, { title: "Phonograph Subscriptions" });

    const blob = new Blob([opml], { type: "text/x-opml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `phonograph-subscriptions-${new Date().toISOString().slice(0, 10)}.opml`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);

    setNotice({ open: true, message: t("snackbar.exported", { count: feeds.length }), severity: "success" });
  };

  const importOpmlFile = async (file: File) => {
    setIsImporting(true);
    setImportProgress(null);

    try {
      const text = await file.text();
      const { feeds } = parseOpml(text);

      const existing = new Set(
        (state.podcasts || []).map((p: any) => (p.url || p.domain || "").toString())
      );

      const toImport = feeds.filter((f) => f.url && !existing.has(f.url));

      if (toImport.length === 0) {
        setNotice({ open: true, message: t("opml.noNewFound"), severity: "info" });
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
        setNotice({ open: true, message: t("opml.importedSuccess", { count: successes.length }), severity: "success" });
      } else {
        setNotice({
          open: true,
          message: t("opml.importedPartial", { successes: successes.length, total: toImport.length, failures: failures.length }),
          severity: "warning",
        });
      }
    } catch (err: any) {
      setNotice({ open: true, message: err?.message || t("opml.importFailed"), severity: "error" });
    } finally {
      setIsImporting(false);
      setTimeout(() => setImportProgress(null), 500);
    }
  };

  const openFilePicker = () => {
    if (isImporting) return;
    fileInputRef.current?.click();
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (ev) => {
    const file = ev.target.files?.[0];
    ev.target.value = ""; // allow re-importing the same file
    if (!file) return;
    await importOpmlFile(file);
  };

  const { podcasts } = state;

  return (
    <>
      <AppBar sx={{ WebkitAppRegion: "drag" }} position="static">
        <Toolbar variant="dense">
          <Typography variant="h6">{t("app.settings")}</Typography>
        </Toolbar>
      </AppBar>

      <Card>
        <CardContent>
          <Typography variant={"h5"}>{t("app.configurations")}</Typography>
          {t("app.version")} {version}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant={"h6"} gutterBottom>
            {t("theme.selector")}
          </Typography>
          <ToggleButtonGroup value={state.theme} exclusive onChange={themeSwitcher} aria-label="theme selector">
            <ToggleButton value={"light"} aria-label={t("theme.light")}>
              <BrightnessLowIcon />
            </ToggleButton>
            <ToggleButton value={"dark"} aria-label={t("theme.dark")}>
              <BrightnessHighIcon />
            </ToggleButton>
            <ToggleButton value={"os"} aria-label={t("theme.os")}>
              OS
            </ToggleButton>
          </ToggleButtonGroup>

          <div style={{ marginTop: 12 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="theme-palette-label">{t("theme.paletteLabel")}</InputLabel>
              <Select
                labelId="theme-palette-label"
                id="theme-palette"
                value={(state.themeName || "nord") as any}
                label={t("theme.paletteLabel")}
                onChange={themeNameSwitcher}
                inputProps={{ "aria-label": "theme palette selector" }}
              >
                <MenuItem value={"default"}>{t("theme.default")}</MenuItem>
                <MenuItem value={"nord"}>{t("theme.nord")}</MenuItem>
                <MenuItem value={"dracula"}>{t("theme.dracula")}</MenuItem>
                <MenuItem value={"highContrast"}>{t("theme.highContrast")}</MenuItem>
                <MenuItem value={"matrix"}>{t("theme.matrix")}</MenuItem>
                <MenuItem value={"monokai"}>{t("theme.monokai")}</MenuItem>
                <MenuItem value={"solarized"}>{t("theme.solarized")}</MenuItem>
              </Select>
            </FormControl>
          </div>


          <div style={{ marginTop: 12 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t("podcast.view")}
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
              label={t("podcast.enableView")}
            />

            <div style={{ marginTop: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="language-label">{t("language.label")}</InputLabel>
                <Select
                  labelId="language-label"
                  id="language-select"
                  value={i18n.language || "en"}
                  label={t("language.label")}
                  onChange={(ev) => i18n.changeLanguage(ev.target.value)}
                >
                  <MenuItem value="en">{t("language.en")}</MenuItem>
                  <MenuItem value="es">{t("language.es")}</MenuItem>
                  <MenuItem value="fr">{t("language.fr")}</MenuItem>
                  <MenuItem value="pt-BR">{t("language.pt-BR")}</MenuItem>
                  <MenuItem value="zh-CN">{t("language.zh-CN")}</MenuItem>
                  <MenuItem value="hi">{t("language.hi")}</MenuItem>
                  <MenuItem value="it">{t("language.it")}</MenuItem>
                  <MenuItem value="ar">{t("language.ar")}</MenuItem>
                  <MenuItem value="de">{t("language.de")}</MenuItem>
                  <MenuItem value="eo">{t("language.eo")}</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant={"h6"} gutterBottom>
            {t("opml.title")}
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
            {t("opml.export")}
          </Button>

          <Button
            variant="outlined"
            color="primary"
            startIcon={<UploadFileIcon />}
            onClick={openFilePicker}
            disabled={isImporting}
          >
            {t("opml.import")}
          </Button>

          {importProgress ? (
            <div style={{ marginTop: 12 }}>
              <Typography variant="caption">
                {t("opml.importing", { done: importProgress.done, total: importProgress.total })}
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
              {t("data.title")}
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
                        <IconButton aria-label={t("delete")} onClick={eraseThisPodcast(podcast.domain as string)}>
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        secondary={
                          <Typography component="span" variant="subtitle1">
                            {podcast.title} <br />
                            <Typography component="span" variant="caption">
                              {podcast.created ? new Date(podcast.created as number).toLocaleString() : ""}
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
            {t("settings.reset")}
          </Button>
          <Button variant="outlined" color="primary" onClick={reloadCasts} disabled={isImporting}>
            {t("settings.reload")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ textAlign: "center" }}>
          <Typography variant="h5">{t("brand.title")}</Typography>
          <Typography>{t("brand.footer")}</Typography>
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
