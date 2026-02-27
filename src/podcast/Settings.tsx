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

import { Button } from "@mui/material";
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
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

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

  const themeNameSwitcher = (_ev: React.MouseEvent<HTMLElement>, input: string | null) => {
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

    setNotice({ open: true, message: `Exported ${feeds.length} podcasts to OPML.`, severity: "success" });
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
        setNotice({ open: true, message: "No new podcasts found to import.", severity: "info" });
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
        setNotice({ open: true, message: `Imported ${successes.length} podcasts from OPML.`, severity: "success" });
      } else {
        setNotice({
          open: true,
          message: `Imported ${successes.length}/${toImport.length} podcasts. ${failures.length} failed (check your connection or feed URLs).`,
          severity: "warning",
        });
      }
    } catch (err: any) {
      setNotice({ open: true, message: err?.message || "Failed to import OPML.", severity: "error" });
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

  const handleLanguageChange = (ev: any) => {
    const lang = ev.target.value as string;
    i18n.changeLanguage(lang);
    try {
      localStorage.setItem("i18nextLng", lang);
    } catch (e) {
      /* ignore */
    }
  };

  return (
    <>
      <AppBar sx={{ WebkitAppRegion: "drag" }} position="static">
        <Toolbar variant="dense">
          <Typography variant="h6">{t("settings.title")}</Typography>
        </Toolbar>
      </AppBar>

      <Card>
        <CardContent>
          <Typography variant={"h5"}>{t("settings.configurations")}</Typography>
          Version: {version}

          <FormControl sx={{ minWidth: 160, ml: 2 }} size="small">
            <InputLabel id="language-select-label">{t("settings.language")}</InputLabel>
            <Select
              labelId="language-select-label"
              id="language-select"
              value={i18n.language || "en"}
              label={t("settings.language")}
              onChange={handleLanguageChange}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="es">Español</MenuItem>
              <MenuItem value="fr">Français</MenuItem>
              <MenuItem value="de">Deutsch</MenuItem>
              <MenuItem value="it">Italiano</MenuItem>
              <MenuItem value="pt-BR">Português (Brasil)</MenuItem>
              <MenuItem value="zh-CN">中文（简体）</MenuItem>
              <MenuItem value="hi">हिन्दी</MenuItem>
              <MenuItem value="ar">العربية</MenuItem>
              <MenuItem value="eo">Esperanto</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant={"h6"} gutterBottom>
            {t("settings.themeSelector")}
          </Typography>
          <ToggleButtonGroup value={state.theme} exclusive onChange={themeSwitcher} aria-label="theme selector">
            <ToggleButton value={"light"} aria-label="White">
              <BrightnessLowIcon />
            </ToggleButton>
            <ToggleButton value={"dark"} aria-label="Black">
              <BrightnessHighIcon />
            </ToggleButton>
            <ToggleButton value={"os"} aria-label="OS preference">
              OS
            </ToggleButton>
          </ToggleButtonGroup>

          <div style={{ marginTop: 12 }}>
            <Typography variant="subtitle1" gutterBottom>
              Theme Palette
            </Typography>
            <ToggleButtonGroup
              value={state.themeName || "default"}
              exclusive
              onChange={themeNameSwitcher}
              aria-label="theme palette selector"
            >
              <ToggleButton value={"default"}>Default</ToggleButton>
              <ToggleButton value={"nord"}>Nord</ToggleButton>
              <ToggleButton value={"dracula"}>Dracula</ToggleButton>
              <ToggleButton value={"highContrast"}>High Contrast</ToggleButton>
            </ToggleButtonGroup>
          </div>

          <div style={{ marginTop: 12 }}>
            <Typography variant="subtitle1" gutterBottom>
              Podcast View
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
              label={t("settings.enablePodcastView")}
            />
          </div>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant={"h6"} gutterBottom>
            {t("settings.importExport")}
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
            {t("settings.exportOpml")}
          </Button>

          <Button
            variant="outlined"
            color="primary"
            startIcon={<UploadFileIcon />}
            onClick={openFilePicker}
            disabled={isImporting}
          >
            {t("settings.importOpml")}
          </Button>

          {importProgress ? (
            <div style={{ marginTop: 12 }}>
              <Typography variant="caption">
                Importing {importProgress.done}/{importProgress.total}…
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
              Data
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
                        <IconButton aria-label="Delete" onClick={eraseThisPodcast(podcast.domain as string)}>
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
            Reset State
          </Button>
          <Button variant="outlined" color="primary" onClick={reloadCasts} disabled={isImporting}>
            Reload Saved Podcasts
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ textAlign: "center" }}>
          <Typography variant="h5">Phonograph</Typography>
          <Typography>is developed with ❤️ in Hoboken, NJ</Typography>
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
