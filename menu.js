const { app, Menu, shell, ipcMain, BrowserWindow, globalShortcut, dialog } = require('electron');
const fs = require('fs');

const template = [
    {
        role: 'help',
        submenu: [
            {
                label: 'About Editor Component',
                click() {
                    shell.openExternal('https://simplemde.com/');
                }
            }
        ]
    },
    {
        label: 'Format',
        submenu: [
            {
                label: 'Toggle Bold',
                click() {
                    const window = BrowserWindow.getFocusedWindow();
                    window.webContents.send(
                        'editor-event',
                        'toggle-bold'
                    );
                }
            },
            {
                label: 'Toggle Italic',
                click() {
                    const window = BrowserWindow.getFocusedWindow();
                    window.webContents.send(
                        'editor-event',
                        'toggle-italic'
                    );
                }
            }
        ]
    },
    {
        label: 'File',
        submenu: [
            {
                label: 'Open',
                accelerator: 'CommandOrControl+O',
                click() {
                    loadFile();
                }
            },
            {
                label: 'Save',
                accelerator: 'CommandOrControl+S',
                click() {
                    saveFile();
                }
            }
        ]
    }
];

if (process.platform === 'win32') {
    template.unshift({
        label: app.getName(),
        submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    })
};

if (process.env.DEBUG) {
    template.push({
        label: 'Debugging',
        submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { type: 'separator' },
            { role: 'toggledevtools' }
        ]
    });
};

ipcMain.on('editor-reply', (event, arg) => {
    console.log(`Received reply from web page: ${arg}`);
});

app.on('ready', () => {
    globalShortcut.register('CommandOrControl+S', () => { saveFile(); });
    globalShortcut.register('CommandOrControl+O', () => { loadFile(); });
});

function saveFile() {
    console.log('Saving the file');
    const window = BrowserWindow.getFocusedWindow();
    window.webContents.send('editor-event', 'save');
}
function loadFile() {
    const window = BrowserWindow.getFocusedWindow();

    const options = {
        title: 'Pick a markdown file',
        filters: [
            { name: 'Markdown files', extensions: ['md'] },
            { name: 'Text files', extensions: ['txt'] }

        ]
    };

    dialog.showOpenDialog(window, options).then(result => {
        if (result.filePaths && result.filePaths.length > 0) {
            // read file and send to the renderer process
            const content = fs.readFileSync(result.filePaths[0]).toString();
            window.webContents.send('load', content);
        }
    });
}

ipcMain.on('save', (event, arg) => {
    console.log('Saving content of the file');
    console.log(arg);

    const window = BrowserWindow.getFocusedWindow();
    const options = {
        title: 'Save markdown file',
        filters: [
            { name: 'MyFile', extensions: ['md'] },
        ]
    };
    dialog.showSaveDialog(window, options).then(result => {
        console.log(`Saving content to the file: ${result.filePath}`);
        fs.writeFileSync(result.filePath, arg);
    });
});



const menu = Menu.buildFromTemplate(template);

module.exports = menu; 