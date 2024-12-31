import { app, BrowserWindow } from "electron";
import { join } from "path";
import { isDev } from "./util.js";

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1500,
    height: 1000,
    autoHideMenuBar: true,
  });

  if (isDev) win.loadURL("http://localhost:3000");
  else win.loadFile(join(app.getAppPath(), "/dist/react/index.html"));
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
