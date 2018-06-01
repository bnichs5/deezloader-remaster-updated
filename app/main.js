// @ts-check

// Load settings before everything
const path = require('path');
const electron = require('electron');
const os = require('os');
const app = electron.app;
const { settings } = require('./service/config')

const socketStarter = require('./server')
const BrowserWindow = electron.BrowserWindow;
const WindowStateManager = require('electron-window-state-manager');

const url = require('url');

let mainWindow;

// Create a new instance of the WindowStateManager
const mainWindowState = new WindowStateManager('mainWindow', {
	defaultWidth: 1280,
	defaultHeight: 800
});

require('electron-context-menu')({
	showInspectElement: false
});

function createWindow () {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: mainWindowState.width,
		height: mainWindowState.height,
		x: mainWindowState.x,
		y: mainWindowState.y,
		frame: false,
		icon: __dirname + "/icon.png"
	});

	// TEMP
	// mainWindow.setMenu(null);

	// and load the index.html of the app.
	mainWindow.loadURL('http://localhost:' + settings.serverPort());

	mainWindow.on('closed', function () {
		mainWindow = null;
	});

	// Check if window was closed maximized and restore it
	if (mainWindowState.maximized) {
		mainWindow.maximize();
	}

	// Save current window state
	mainWindow.on('close', () => {
		mainWindowState.saveState(mainWindow);
	});
}

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	app.quit();
});

app.on('activate', function () {
	if (mainWindow === null) {
		createWindow();
	}
});
