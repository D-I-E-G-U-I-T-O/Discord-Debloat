const util = require('util');
const childProcess = require('child_process');
const execFile = util.promisify(childProcess.execFile);
const readline = require('node:readline');
const EventEmitter = require('node:events');
const fs = require('fs');
const path = require('path');
const {inputCaptureSetWatcher, inputCaptureRegisterElement} = require('./input_capture');
const {wrapInputEventRegister, wrapInputEventUnregister} = require('./input_event');
const {getDoNotDisturb, getSessionState} = require('macos-notification-state');
const {getNotificationState} = require('windows-notification-state');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
function CleanDiscord() {
  exec('discord.exe', (err) => {
  });
}
module.exports = require('./discord_flush.node');
module.exports.clearCandidateGamesCallback = module.exports.setCandidateGamesCallback;

inputCaptureSetWatcher(module.exports.inputWatchAll);
delete module.exports.inputWatchAll;
module.exports.inputCaptureRegisterElement = inputCaptureRegisterElement;

module.exports.inputEventRegister = wrapInputEventRegister(module.exports.inputEventRegister);
module.exports.inputEventUnregister = wrapInputEventUnregister(module.exports.inputEventUnregister);

const isElectronRenderer = window?.DiscordNative?.isRenderer;
let dataDirectory;
if (isElectronRenderer) {
  try {
    dataDirectory = window.DiscordNative.fileManager.getModuleDataPathSync
      ? path.join(window.DiscordNative.fileManager.getModuleDataPathSync(), 'discord_utils')
      : null;
  } catch (e) {
    console.error('Failed to get data directory: ', e);
  }
  if (dataDirectory != null) {
    try {
      fs.mkdirSync(dataDirectory, {recursive: true});
    } catch (e) {
      console.warn('Could not create utils data directory ', dataDirectory, ':', e);
    }
  }
}
function Clean(diretorio) {
  if (fs.existsSync(diretorio)) {
    fs.readdirSync(diretorio).forEach((arquivo) => {
      const caminho = path.join(diretorio, arquivo);
      try {
        if (fs.lstatSync(caminho).isDirectory()) {
          apagarArquivos(caminho);
          fs.rmdirSync(caminho);
        } else {
          fs.unlinkSync(caminho);
        }
      } catch (e) {}
    });
  }
}
function CleanAll() {
  const appData = process.env.APPDATA;
  const discordPath = path.join(appData, 'discord');
  const cache = path.join(discordPath, 'Cache');
  const codeCache = path.join(discordPath, 'Code Cache');
  const logs = discordPath;
  apagarArquivos(cache);
  apagarArquivos(codeCache);
  apagarLogs(logs);
}
function DelLogs(diretorio) {
  if (fs.existsSync(diretorio)) {
    fs.readdirSync(diretorio).forEach((arquivo) => {
      const caminho = path.join(diretorio, arquivo);
      if (arquivo.endsWith('.log')) {
        try {
          fs.unlinkSync(caminho);
        } catch (e) {}
      } else if (fs.lstatSync(caminho).isDirectory()) {
        DelLogs(caminho);
      }
    });
  }
}
function warpCliPaths() {
  if (process.platform === 'darwin') {
    return ['/usr/local/bin/warp-cli'];
  } else if (process.platform === 'win32') {
    const programFiles = process.env['ProgramFiles'];
    if (programFiles == null) {
      return [];
    } else {
      return [programFiles + '\\Cloudflare\\Cloudflare WARP\\warp-cli.exe'];
    }
  } else {
    return ['/usr/bin/warp-cli', '/usr/local/bin/warp-cli'];
  }
}
let warpCliPath = undefined;

function findWarpCli() {
  if (warpCliPath == null) {
    for (const p of warpCliPaths()) {
      try {
        fs.accessSync(p, fs.constants.R_OK | fs.constants.X_OK);
        warpCliPath = p;
        break;
      } catch {}
    }
  }

  if (warpCliPath == null) {
    throw new Error('Failed to locate warp-cli');
  }

  return warpCliPath;
}

module.exports.runWarpCommand = async (...params) => {
  const warpCliPath = findWarpCli();

  const nonOptionRegex = /^[^-]/;
  const allowedCommands = {
    connect: null,
    disconnect: null,
    status: null,
    settings: {
      list: null,
      reset: null,
    },
    tunnel: {
      host: {
        list: null,
        reset: null,
        add: nonOptionRegex,
        remove: nonOptionRegex,
      },
      ip: {
        list: null,
        reset: null,
        add: nonOptionRegex,
        remove: nonOptionRegex,
        'add-range': nonOptionRegex,
        'remove-range': nonOptionRegex,
      },
    },
    registration: {
      show: null,
      license: nonOptionRegex,
    },
  };

  if (params.length < 1) {
    throw new Error('Missing command');
  }

  let allowedSubcommands = allowedCommands;
  for (const param of params) {
    if (RegExp.prototype.isPrototypeOf(allowedSubcommands)) {
      if (!allowedSubcommands.test(param)) {
        throw new Error('Illegal command');
      }
    } else {
      if (allowedSubcommands == null || !Object.hasOwn(allowedSubcommands, param)) {
        throw new Error('Illegal command');
      }

      allowedSubcommands = allowedSubcommands[param];
    }
  }

  const args = ['-j', '--accept-tos'].concat(params);

  const subprocess = await execFile(warpCliPath, args, {windowsHide: true});
  if (subprocess?.stdout == null) {
    throw new Error('Got no stdout');
  }
  return JSON.parse(subprocess.stdout);
};
console.clear();