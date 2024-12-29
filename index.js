import { event_types, eventSource } from '../../../../script.js';
import { quickReplyApi } from '../../quick-reply/index.js';
import { QuickReplySet } from '../../quick-reply/src/QuickReplySet.js';

const dom = {
    /**@type {HTMLElement} */
    root: undefined,
    /**@type {HTMLElement} */
    qrList: undefined,
};

const hideMenu = ()=>{
    dom.root?.remove();
    dom.root = undefined;
    dom.qrList = undefined;
};
/**
 *
 * @param {PointerEvent} evt
 */
const showMenu = (evt = null)=>{
    if (dom.root !== undefined) return;
    const bar = document.querySelector('#qr--bar').getBoundingClientRect();
    const origin = {
        x: evt?.clientX ?? bar.left,
        y: evt?.clientY ?? bar.top,
    };
    const globalSets = quickReplyApi.listGlobalSets();
    const chatSets = quickReplyApi.listChatSets();
    let currentSet;
    const root = document.createElement('div'); {
        dom.root = root;
        root.classList.add('stqrs--root');
        root.style.setProperty('--x', origin.x.toString());
        root.style.setProperty('--y', origin.y.toString());
        root.addEventListener('click', ()=>{
            hideMenu();
        });
        const wrapper = document.createElement('div'); {
            wrapper.classList.add('stqrs--wrapper');
            const setList = document.createElement('ul'); {
                setList.classList.add('stqrs--sets');
                setList.classList.add('list-group');
                setList.addEventListener('click', (evt)=>evt.stopPropagation());
                for (const qrs of QuickReplySet.list.toSorted((a,b)=>a.name.toLowerCase().localeCompare(b.name.toLowerCase()))) {
                    const set = document.createElement('li'); {
                        set.classList.add('stqrs--set');
                        set.classList.add('list-group-item');
                        set.addEventListener('pointerenter', async()=>{
                            if (currentSet == qrs) return;
                            currentSet = qrs;
                            dom.qrList.innerHTML = '';
                            for (const qr of qrs.qrList) {
                                const item = document.createElement('li'); {
                                    item.classList.add('stqrs--qr');
                                    item.classList.add('list-group-item');
                                    item.title = (qr.title ? `${qr.title}\n---\n` : '') + qr.message;
                                    const lbl = document.createElement('div'); {
                                        lbl.classList.add('stqrs--label');
                                        const icon = document.createElement('div'); {
                                            icon.classList.add('fa-solid', 'fa-fw');
                                            if (qr.icon) icon.classList.add(qr.icon);
                                            lbl.append(icon);
                                        }
                                        const text = document.createElement('div'); {
                                            text.classList.add('stqrs--text');
                                            text.textContent = qr.label;
                                            lbl.append(text);
                                        }
                                        item.append(lbl);
                                    }
                                    const edit = document.createElement('div'); {
                                        edit.classList.add('menu_button');
                                        edit.classList.add('fa-solid', 'fa-fw');
                                        edit.classList.add('fa-pen-to-square');
                                        edit.title = 'Edit Quick Reply';
                                        edit.addEventListener('click', ()=>{
                                            qr.showEditor();
                                            hideMenu();
                                        });
                                        item.append(edit);
                                    }
                                    const hide = document.createElement('div'); {
                                        hide.classList.add('menu_button');
                                        hide.classList.add('fa-solid', 'fa-fw');
                                        hide.classList.add(qr.isHidden ? 'fa-eye-slash' : 'fa-eye');
                                        hide.title = 'Invisible (auto-execute only)';
                                        hide.addEventListener('click', ()=>{
                                            qr.isHidden = !qr.isHidden;
                                            hide.classList.add(qr.isHidden ? 'fa-eye-slash' : 'fa-eye');
                                            hide.classList.remove(qr.isHidden ? 'fa-eye' : 'fa-eye-slash');
                                            qr.onUpdate();
                                        });
                                        item.append(hide);
                                    }
                                    const run = document.createElement('div'); {
                                        run.classList.add('menu_button');
                                        run.classList.add('fa-solid', 'fa-fw');
                                        run.classList.add('fa-play-circle');
                                        run.title = 'Execute Quick Reply';
                                        run.addEventListener('click', ()=>{
                                            qr.execute();
                                        });
                                        item.append(run);
                                    }
                                    dom.qrList.append(item);
                                }
                            }
                        });
                        const global = document.createElement('div'); {
                            global.classList.add('stqrs--toggle');
                            if (globalSets.includes(qrs.name)) global.classList.add('stqrs--active');
                            global.classList.add('menu_button');
                            global.classList.add('fa-solid', 'fa-fw', 'fa-globe');
                            global.title = 'Activate as global set';
                            global.addEventListener('click', ()=>{
                                quickReplyApi.toggleGlobalSet(qrs.name);
                                if (quickReplyApi.listGlobalSets().includes(qrs.name)) {
                                    global.classList.add('stqrs--active');
                                } else {
                                    global.classList.remove('stqrs--active');
                                }
                            });
                            set.append(global);
                        }
                        const chat = document.createElement('div'); {
                            chat.classList.add('menu_button');
                            chat.classList.add('fa-solid', 'fa-fw', 'fa-comments');
                            chat.classList.add('stqrs--toggle');
                            if (chatSets.includes(qrs.name)) chat.classList.add('stqrs--active');
                            chat.title = 'Activate as chat set';
                            chat.addEventListener('click', ()=>{
                                quickReplyApi.toggleChatSet(qrs.name);
                                if (quickReplyApi.listChatSets().includes(qrs.name)) {
                                    chat.classList.add('stqrs--active');
                                } else {
                                    chat.classList.remove('stqrs--active');
                                }
                            });
                            set.append(chat);
                        }
                        const lbl = document.createElement('div'); {
                            lbl.textContent = qrs.name;
                            set.append(lbl);
                        }
                        setList.append(set);
                    }
                }
                wrapper.append(setList);
            }
            const qrList = document.createElement('ul'); {
                dom.qrList = qrList;
                qrList.classList.add('stqrs--qrs');
                qrList.classList.add('list-group');
                qrList.addEventListener('click', (evt)=>evt.stopPropagation());
                wrapper.append(qrList);
            }
            root.append(wrapper);
        }
        document.body.append(root);
    }
};

const init = ()=>{
    document.querySelector('#send_form').addEventListener('contextmenu', (evt)=>{
        if (!(evt.target.id == 'qr--bar' || evt.target.parentElement.id == 'qr--bar')) return;
        evt.preventDefault();
        evt.stopPropagation();
        showMenu(evt);
    });
};
eventSource.once(event_types.APP_READY, ()=>init());
