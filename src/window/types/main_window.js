import ui from '../../scripts/ui';

let testData = [
    {
        "name": "GDMultiplayer",
        "version": "1.0.0",
        "authors": ["IliasHDZ"],
        "loaded": true,
        "reason": ""
    },
    {
        "name": "impostor.lol",
        "loaded": false,
        "reason": "Invalid mod file"
    }
];

class MainWindow {
    constructor(desktop) {
        this.window = desktop.createWindow({
            title: 'Geode Mod Manager',
            width: 480,
            height: 480,
            x: 20,
            y: 20
        });

        this.events = {};

        this.window.on('close', () => this.window.close());

        this.generate();
    }

    generate() {
        this.window.content.style.display = 'flex';
        this.window.content.style.flexDirection = 'column';

        // add tabs
        let mainTabs = ui.tabs(['Installed', 'Browse Mods', 'Settings'], { 
            selected: () => {return 0}, 
            style: 'header', 
            id: 'mainWindowTabs',
            onSelectChange: (i, n) => {
                for(let j = 0; j < n.length; j++) {
                    this.window.content.querySelector('#mainWindowTab' + j).style.display = 'none';
                }
                this.window.content.querySelector('#mainWindowTab' + i).style.display = '';
            },
            marginBottom: 2
        });
        ui.renderUiObject(mainTabs, this.window.content);
        this.window.content.classList.add('uistretch');
    
        // add tab sections
        let tabInstalled = document.createElement('div');
        tabInstalled.id = 'mainWindowTab0';
        tabInstalled.classList.add('flex');
        tabInstalled.style.height = '100%';
        let tabBrowse = document.createElement('div');
        tabBrowse.id = 'mainWindowTab1';
        tabBrowse.style.display = 'none';
        let tabSettings = document.createElement('div');
        tabSettings.id = 'mainWindowTab2';
        tabSettings.style.display = 'none';

        this.window.content.appendChild(tabInstalled);
        this.window.content.appendChild(tabBrowse);
        this.window.content.appendChild(tabSettings);

        // add installed tab lists + content
        let tabInstalledInfo = document.createElement('div');
        tabInstalledInfo.classList.add('sidebar-info');

        function updateInstalledInfo(item) {
            tabInstalledInfo.innerHTML = '';

            let infoUi = ui.container('column', { scroll: 'vertical', paddingX: 15, paddingY: 0}, [
                ui.container('row', {}, [
                    ui.label(item.name, { style: 'bold' }),
                    ui.label(item.version? 'v' + item.version : '', { color: '#ffffff66' }),
                ]),
                ui.label(item.authors ? 'by ' +  item.authors.join(', ') : 'Source Unknown', { color: '#ffffff66', marginTop: 0, marginBottom: 5 }),
                ui.container('row', { marginTop: 5, uistretch: true }, [
                    ui.button('Disable', {primary: true}),
                    ui.button('Uninstall', {})
                ])
            ]);

            ui.renderUiObject(infoUi, tabInstalledInfo);
        }

        let selectedListItem = 0;
        let tabInstalledList = document.createElement('div');
        tabInstalledList.classList.add('sidebar-list');
        let itemi = -1;
        testData.forEach(item => {
            itemi++;
            let localitemi = itemi;
            let listItem = document.createElement('div');
            listItem.classList.add('sidebar-list-item');
            if(localitemi == selectedListItem) {
                listItem.classList.add('sel');
                updateInstalledInfo(testData[localitemi]);
            }
            if(item.name) {
                let listItemName = document.createElement('h4');
                listItemName.innerText = item.name;
                listItem.appendChild(listItemName);
            }
            if(item.authors) {
                let listItemDesc = document.createElement('p');
                listItemDesc.innerText = 'by ' + item.authors.join(', ');
                listItem.appendChild(listItemDesc);
            }

            listItem.onclick = () => {
                let curSel = this.window.content.querySelector('.sidebar-list-item.sel');
                if(curSel) curSel.classList.remove('sel');
                listItem.classList.add('sel');
                updateInstalledInfo(testData[localitemi]);
            }

            tabInstalledList.appendChild(listItem);
        });

        tabInstalled.appendChild(tabInstalledList);
        tabInstalled.appendChild(tabInstalledInfo);
    }

    emit(event, ...args) {
        if (this.events[event])
            for (let cb of this.events[event])
                cb(...args);
    }

    on(event, callback) {
        if (!this.events[event])
            this.events[event] = [];

        this.events[event].push(callback);
    }
}

export default MainWindow; 