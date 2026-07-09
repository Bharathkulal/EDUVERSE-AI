const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class FridayDesktopService {
  /**
   * Launch standard Windows applications
   */
  launchApp(appName) {
    return new Promise((resolve, reject) => {
      let command = '';
      const name = appName.toLowerCase().trim();

      if (name.includes('chrome')) {
        command = 'start chrome';
      } else if (name.includes('code') || name.includes('vs code') || name.includes('vscode')) {
        command = 'code';
      } else if (name.includes('terminal') || name.includes('cmd') || name.includes('powershell')) {
        command = 'start cmd';
      } else if (name.includes('explorer') || name.includes('file explorer')) {
        command = 'explorer';
      } else if (name.includes('calculator') || name.includes('calc')) {
        command = 'calc';
      } else if (name.includes('settings')) {
        command = 'start ms-settings:';
      } else if (name.startsWith('http://') || name.startsWith('https://')) {
        command = `start ${name}`;
      } else {
        command = `start ${name}`;
      }

      console.log(`[FridayDesktopService] Executing command: ${command}`);
      exec(command, (error) => {
        if (error) {
          console.error(`Failed to launch app: ${appName}`, error.message);
          return reject(new Error(`Failed to open application: ${appName}`));
        }
        resolve(`Successfully launched ${appName}`);
      });
    });
  }

  /**
   * OS Power Operations
   */
  powerAction(action) {
    return new Promise((resolve, reject) => {
      let command = '';
      const act = action.toLowerCase().trim();

      if (act === 'shutdown') {
        command = 'shutdown /s /t 10'; // 10 seconds warning
      } else if (act === 'restart') {
        command = 'shutdown /r /t 10';
      } else if (act === 'sleep') {
        command = 'rundll32.exe powrprof.dll,SetSuspendState 0,1,0';
      } else if (act === 'lock') {
        command = 'rundll32.exe user32.dll,LockWorkStation';
      } else {
        return reject(new Error(`Unsupported power action: ${action}`));
      }

      console.log(`[FridayDesktopService] Executing system power action: ${command}`);
      exec(command, (error) => {
        if (error) {
          console.error(`Power operation failed: ${action}`, error.message);
          return reject(new Error(`System command failed for ${action}`));
        }
        resolve(`Successfully triggered system ${action}`);
      });
    });
  }

  /**
   * File Operations (Windows Shell / Powershell integration)
   */
  createFolder(folderName, parentDir = 'C:\\Users\\User\\Downloads') {
    return new Promise((resolve, reject) => {
      const fullPath = path.resolve(parentDir, folderName);
      fs.mkdir(fullPath, { recursive: true }, (err) => {
        if (err) return reject(err);
        resolve(`Created folder at ${fullPath}`);
      });
    });
  }

  renameFile(oldPath, newPath) {
    return new Promise((resolve, reject) => {
      fs.rename(oldPath, newPath, (err) => {
        if (err) return reject(err);
        resolve(`Renamed file to ${path.basename(newPath)}`);
      });
    });
  }

  /**
   * Powershell Compression Utilities (No external npm packages required)
   */
  compressFolder(folderPath, zipOutputPath) {
    return new Promise((resolve, reject) => {
      const cmd = `powershell -Command "Compress-Archive -Path '${folderPath}' -DestinationPath '${zipOutputPath}' -Force"`;
      exec(cmd, (error) => {
        if (error) return reject(error);
        resolve(`Compressed folder into ZIP at ${zipOutputPath}`);
      });
    });
  }

  extractZip(zipPath, destinationPath) {
    return new Promise((resolve, reject) => {
      const cmd = `powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${destinationPath}' -Force"`;
      exec(cmd, (error) => {
        if (error) return reject(error);
        resolve(`Extracted ZIP contents into ${destinationPath}`);
      });
    });
  }

  /**
   * Window state control (Minimize all windows using shell interface)
   */
  minimizeAll() {
    return new Promise((resolve, reject) => {
      const cmd = `powershell -Command "(New-Object -ComObject Shell.Application).MinimizeAll()"`;
      exec(cmd, (error) => {
        if (error) return reject(error);
        resolve('All windows minimized');
      });
    });
  }

  restoreAll() {
    return new Promise((resolve, reject) => {
      const cmd = `powershell -Command "(New-Object -ComObject Shell.Application).UndoMinimizeAll()"`;
      exec(cmd, (error) => {
        if (error) return reject(error);
        resolve('All windows restored');
      });
    });
  }
}

module.exports = new FridayDesktopService();
