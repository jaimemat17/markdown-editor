const {
    app,
    Menu,
    shell,
    ipcMain,
    BrowserWindow,
    globalShortcut,
    dialog
} = require('electron');

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
    globalShortcut.register('CommandOrControl+S', () => {
        console.log('Saving the file');
        const window = BrowserWindow.getFocusedWindow();
        window.webContents.send('editor-event', 'save');
    });
});

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
    dialog.showSaveDialog(window, options, filename => {
        console.log(filename);
    });
});

const menu = Menu.buildFromTemplate(template);

module.exports = menu; 