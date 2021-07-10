import ui from './ui';

let closeFuncIds = [];
let prevFocusElement = {};

function closeDialog (id) {
    let dialog = document.getElementById(id);
    if(!dialog) return;

    dialog.classList.add('closing');
    let bg = document.getElementById(id + 'Bg');
    if(bg && bg.parentElement) bg.style.animation = 'fadeOut ease 0.3s';
    setTimeout(() => {
        dialog.classList.remove('vis');
        if(dialog.parentElement) dialog.parentElement.removeChild(dialog);
        if(bg && bg.parentElement) {
            let rootelem = bg.parentElement;
            bg.parentElement.removeChild(bg);
            rootelem.parentElement.removeChild(rootelem);
        }
    }, 250);
    closeFuncIds.shift();
    if(closeFuncIds.length <= 0) {
        window.removeEventListener('keydown', closeFunc);
    }

    if(prevFocusElement[id]) {
        prevFocusElement[id].focus();
    }
}

function openFunc(id) {
    closeFuncIds.unshift(id);
    window.addEventListener('keydown', closeFunc);
    prevFocusElement[id] = document.activeElement;
}
function closeFunc(e) {
    if(e.keyCode == 27) {
        closeDialog(closeFuncIds[0]);
        if(closeFuncIds.length <= 0) {
            window.removeEventListener('keydown', closeFunc);
        }
    }

    return false;
}

export default {

    setCursor: (n) => {
        document.body.style.cursor = n || "";
    },

    createDialog: (id, title, closeButton, content, fullSize) => {
        ui.renderUiObject({
            properties: {
                type: 'dialog',
                id: id,
                title: title,
                closeButton: closeButton,
                fullSize: fullSize
            },
            children: content
        }, document.body);
        let elemContent = document.querySelector('#'+id).querySelector('.ui-element');
        let maxheight = document.querySelector('#app').getBoundingClientRect().height * 0.6;
        elemContent.style.marginTop = '10px';
        if(elemContent.getBoundingClientRect().height > maxheight)
            elemContent.style.height = maxheight + 'px';

        openFunc(id);
    },

    closeDialog: (id) => {
        closeDialog(id);
    },

    alert: (id, title, description, button, dontShowAgain) => {
        let obj = {
            properties: {
                type: 'dialog',
                id: id,
                title: title,
                closeButton: true
            },
            children: [
                {
                    properties: {
                        type: 'container',
                        paddingX: 15,
                        paddingY: 10,
                    },
                    children: [
                        {
                            properties: {
                                type: 'label',
                                text: description,
                                align: 'center',
                                marginBottom: 10,
                            }
                        },
                        {
                            properties: {
                                type: 'button',
                                id: id + 'Ok',
                                focusIndex: 0,
                                text: button,
                                primary: true,
                                onClick: () => {
                                    closeDialog(id);
                                }
                            }
                        }
                    ]
                }
            ]
        }
        if(dontShowAgain) 
            obj.children[0].children.push({
                properties: {
                    type: 'checkbox',
                    id: id + 'DontShowAgain',
                    text: 'Don\'t show this again',
                    marginTop: 8,
                    checked: () => {
                        return false
                    },
                    onCheckChange: (t) => {
                        if(t) localStorage.setItem(`${id}DontShowAgain`, 'true');
                        else localStorage.setItem(`${id}DontShowAgain`, 'false');
                    }
                }
            });
        ui.renderUiObject(obj, document.body);

        openFunc(id);
    },

    confirm: (id, title, description, options) => {
        if(!options) return
        let buttons = [options.buttonYes || 'OK', options.buttonNo || 'Cancel'];

        ui.renderUiObject({
            properties: {
                type: 'dialog',
                id: id,
                title: title,
                closeButton: false
            },
            children: [
                {
                    properties: {
                        type: 'container',
                        paddingX: 15,
                        paddingY: 10,
                    },
                    children: [
                        {
                            properties: {
                                type: 'label',
                                text: description,
                                align: 'center',
                                marginBottom: 10,
                            }
                        },
                        {
                            properties: {
                                type: 'container',
                                direction: 'row'
                            },
                            children: [
                                {
                                    properties: {
                                        type: 'button',
                                        id: id + 'Ok',
                                        focusIndex: 0,
                                        text: buttons[0],
                                        primary: true,
                                        onClick: () => {
                                            closeDialog(id);
                                            if(options.onConfirm) options.onConfirm(true);
                                        }
                                    }
                                },
                                {
                                    properties: {
                                        type: 'button',
                                        id: id + 'Cancel',
                                        focusIndex: 1,
                                        text: buttons[1],
                                        onClick: () => {
                                            closeDialog(id);
                                            if(options.onConfirm) options.onConfirm(false);
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        }, document.body);

        openFunc(id);
    },

    prompt: (id, title, description, options) => {
        if(!options) return
        let buttons = [options.buttonYes || 'OK', options.buttonNo || 'Cancel'];
        let input = {
            type: 'textInput',
            id: id + 'Input',
            placeholder: options.placeholder || 'Enter Here',
            defaultValue: options.defaultValue,
            maxlength: options.maxlength || 32,
            marginBottom: 10,
            focusIndex: 0
        }
        if(options.type == 'number') {
            input = {
                type: 'numberInput',
                id: id + 'Input',
                placeholder: options.placeholder || 'Enter Here',
                defaultValue: options.defaultValue,
                min: options.min,
                max: options.max,
                marginBottom: 10,
                focusIndex: 0
            }
        }

        ui.renderUiObject({
            properties: {
                type: 'dialog',
                id: id,
                title: title,
                closeButton: false
            },
            children: [
                {
                    properties: {
                        type: 'container',
                        paddingX: 15,
                        paddingY: 10,
                    },
                    children: [
                        {
                            properties: {
                                type: 'label',
                                text: description,
                                align: 'center',
                                marginBottom: 10,
                            }
                        },
                        {
                            properties: input
                        },
                        {
                            properties: {
                                type: 'container',
                                direction: 'row'
                            },
                            children: [
                                {
                                    properties: {
                                        type: 'button',
                                        id: id + 'Ok',
                                        focusIndex: 1,
                                        text: buttons[0],
                                        primary: true,
                                        onClick: () => {
                                            closeDialog(id);
                                            let inp = document.querySelector('#' + id + 'Input');
                                            if(options.onConfirm) options.onConfirm(inp ? inp.value : null);
                                        }
                                    }
                                },
                                {
                                    properties: {
                                        type: 'button',
                                        id: id + 'Cancel',
                                        focusIndex: 2,
                                        text: buttons[1],
                                        onClick: () => {
                                            closeDialog(id);
                                            if(options.onConfirm) options.onConfirm(null);
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        }, document.body);

        openFunc(id);
    }

}