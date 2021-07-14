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
            minWidth: 320,
            minHeight: 128,
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
        let tabsMaxHeight = this.window.content.querySelector('#mainWindowTabs') ? 
        this.window.content.querySelector('#mainWindowTabs').clientHeight : 0;
        let tabsMaxHeightCss = `calc(100% - ${tabsMaxHeight}px)`

        let tabInstalled = document.createElement('div');
        tabInstalled.id = 'mainWindowTab0';
        tabInstalled.classList.add('flex');
        tabInstalled.style.height = '100%';
        tabInstalled.style.maxHeight = tabsMaxHeightCss;

        let tabBrowse = document.createElement('div');
        tabBrowse.id = 'mainWindowTab1';
        tabBrowse.style.display = 'none';
        tabBrowse.style.maxHeight = tabsMaxHeightCss;

        let tabSettings = document.createElement('div');
        tabSettings.id = 'mainWindowTab2';
        tabSettings.style.display = 'none';
        tabSettings.style.maxHeight = tabsMaxHeightCss;

        this.window.content.appendChild(tabInstalled);
        this.window.content.appendChild(tabBrowse);
        this.window.content.appendChild(tabSettings);

        // add installed tab lists + content
        let tabInstalledInfo = document.createElement('div');
        tabInstalledInfo.classList.add('sidebar-info');

        function updateInstalledInfo(item) {
            tabInstalledInfo.innerHTML = '';

            let infoUi = ui.container('column', { scroll: 'vertical', paddingX: 15, paddingY: 0}, [
                ui.container('row', { uiunstretch: true }, [
                    ui.label(item.name, { style: 'bold' }),
                    ui.label(item.version? 'v' + item.version : '', { color: '#ffffff66' }),
                ]),
                ui.label(item.authors ? 'by ' +  item.authors.join(', ') : 'Source Unknown', { color: '#ffffff66', marginTop: 0, marginBottom: 5 }),
                
                ui.container('row', 
                { 
                    marginTop: 10, 
                    uistretch: true, 
                    id: 'installedInfo', 
                    onCreate: () => { 
                        if(item.loaded == false) 
                            document.querySelector('#installedInfo').style.display = 'none';
                    } 
                }, 
                [
                    ui.button( 
                        item.enabled ? 'Disable' : 'Enable', 
                        {
                            primary: true,
                            icon: item.enabled ? 'ic-disable.svg' : 'ic-enable.svg', 
                            iconHeight: 14
                        } 
                    ),
                    ui.button(
                        'Uninstall', 
                        { 
                            icon: 'ic-uninstall.svg', 
                            iconHeight: 14 
                        }
                    )
                ]),
                ui.container('row', 
                { 
                    uiunstretch: true,
                    id: 'installedReason',
                    onCreate: () => { 
                        if(!item.reason) 
                            document.querySelector('#installedReason').style.display = 'none';
                    } 
                }, 
                [
                    ui.icon('ic-error.svg', { srcType: 'asset', height: 18 }),
                    ui.label(item.reason, { color: '#f33333' }),
                ]),

                ui.container('row', { marginTop: 5, scroll: 'horizontal' }, [
                    ui.container('row', { }, [
                        ui.card('Test'),
                        ui.card('Test'),
                        ui.card('Test'),
                        ui.card('Test'),
                        ui.card('Test'),
                        ui.card('Test'),
                        ui.card('Test')
                    ]),
                ]),
            ]);

            ui.renderUiObject(infoUi, tabInstalledInfo);
        }

        let selectedListItem = 0;
        let tabInstalledList = document.createElement('div');
        tabInstalledList.classList.add('sidebar-list');

        function refreshInstalledList(th) {
            tabInstalledList.innerHTML = '';
            let loadedMods = window.geode.getLoadedMods();
            let itemi = -1;
            loadedMods.forEach(item => {
                itemi++;
                let localitemi = itemi;
                let listItem = document.createElement('div');
                listItem.classList.add('sidebar-list-item');
                if(localitemi == selectedListItem) {
                    listItem.classList.add('sel');
                    updateInstalledInfo(loadedMods[localitemi]);
                }
                if(!item.loaded) {
                    listItem.style.order = 5;
                    listItem.style.opacity = 0.6;
                }
                if(item.name) {
                    let listItemName = document.createElement('h4');
                    listItemName.innerText = item.name;
                    listItem.appendChild(listItemName);
                }
                if(item.authors) {
                    let listItemDesc = document.createElement('p');
                    listItemDesc.innerText = 'by ' + item.authors.join(', ');
                    if(!item.loaded) listItemDesc = 'Error Loading Mod';
                    listItem.appendChild(listItemDesc);
                } else if(!item.loaded) {
                    let listItemDesc = document.createElement('p');
                    listItemDesc.innerText = 'Error Loading Mod';
                    listItem.appendChild(listItemDesc);
                }

                listItem.onclick = () => {
                    let curSel = th.window.content.querySelector('.sidebar-list-item.sel');
                    if(curSel) curSel.classList.remove('sel');
                    listItem.classList.add('sel');
                    updateInstalledInfo(loadedMods[localitemi]);
                    selectedListItem = localitemi;
                }

                tabInstalledList.appendChild(listItem);
            });
        }

        if(window.geode) {
            window.geode.onModsLoaded(() => {
                refreshInstalledList(this);
            });
        }

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