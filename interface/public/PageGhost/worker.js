"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
function Cursors(input) {
    var cursor = 'default';
    switch (input) {
        case 'all-scroll':
        case 'grab':
        case 'grabbing':
        case 'move':
            cursor = 'grab';
            break;
        case 'e-resize':
        case 'ew-resize':
            cursor = 'e-resize';
            break;
        case 'ne-resize':
        case 'sw-resize':
        case 'nesw-resize':
            cursor = 'ne-resize';
            break;
        case 'ns-resize':
        case 's-resize':
            cursor = 'ns-resize';
            break;
        case 'nw-resize':
        case 'se-resize':
        case 'nwse-resize':
            cursor = 'nw-resize';
            break;
        case 'crosshair':
        case 'col-resize':
        case 'help':
        case 'n-resize':
        case 'no-drop':
        case 'not-allowed':
        case 'pointer':
        case 'progress':
        case 'wait':
        case 'text':
        case 'w-resize':
        case 'default':
        case 'row-resize':
            cursor = input;
            break;
    }
    return "./cursors/unix/" + cursor + ".apng";
}
function htmlToElement(html) {
    var template = document.createElement('template');
    //html = html.trim() // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
document.addEventListener('DOMContentLoaded', function () {
    window['PageGhost'] = (_a = /** @class */ (function () {
            function PageGhost() {
            }
            PageGhost.initialize = function () {
                var _this = this;
                var _a = this, container = _a.container, cursor = _a.cursor, iframe = _a.iframe;
                var comment = document.createComment(this.comment);
                document.documentElement.insertBefore(comment, document.head);
                this.containarize(function (doc) {
                    _this.win.postMessage({
                        type: 'PageGhost',
                        id: decodeURIComponent(window.location.search.substr(1)),
                        event: 'refresh'
                    }, '*');
                    _this.setConfig();
                    // this.fadeCursor(10, 0)
                    // setTimeout(() => {
                    //   this.click()
                    //   setTimeout(() => {
                    //     this.click()
                    //     setTimeout(() => {
                    //       this.setCursor(100, 50)
                    //     }, 1000)
                    //   }, 100)
                    // }, 1000)
                });
                window.addEventListener('message', function (_a) {
                    var data = _a.data;
                    _this.update(data);
                });
                window.addEventListener('resize', function () {
                    _this.scale();
                });
            };
            PageGhost.scroll = function (e) {
                if (window.shouldNotScroll) {
                    window.shouldNotScroll = false;
                    return;
                }
                if (!e)
                    return;
                if (!window.sO)
                    window.sO = 0;
                window.sO++;
                var element = e.target === this.iframe.contentDocument ? this.iframe.contentDocument.body : e.target;
                var id = element === this.iframe.contentDocument.body ? '1' : element.getAttribute('_-_') || '1';
                var x = element.scrollLeft || 0;
                var y = element.scrollTop || 0;
                if (window.lS && window.lS[0] === x && window.lS[1] === y && window.lS[2] === id) {
                    return;
                }
                this.sendScroll([x, y, id, window.sO]);
            };
            PageGhost.linkify = function (url) {
                if (this.base) {
                    if (this.base.getAttribute('href') !== url) {
                        this.base.setAttribute('href', url);
                        this.reload();
                    }
                }
                else {
                    this.base = this.container.contentDocument.createElement('base');
                    this.base.setAttribute('href', url);
                    this.container.contentDocument.head.appendChild(this.base);
                    this.reload();
                }
            };
            PageGhost.reload = function () {
                if (this.iframe &&
                    this.iframe.contentWindow &&
                    this.iframe.contentWindow.location) {
                    this.iframe.contentWindow.location.reload();
                }
            };
            PageGhost.setCursor = function (x, y) {
                this.cursor.style.transform = "translate(" + x + "px, " + y + "px)";
            };
            PageGhost.fadeCursor = function (x, y) {
                var cursor = document.getElementsByClassName('cursor')[0];
                cursor.style.transition = 'transform 0.05s ease-in-out';
                this.setCursor(x, y);
                this.setConfig();
            };
            PageGhost.setConfig = function (newConfig) {
                this.config = __assign({}, this.config, newConfig);
                if (this.config.smoothCursor) {
                    this.cursor.style.transition = 'transform 0.05s ease-in-out';
                }
                else {
                    this.cursor.style.transition = '';
                }
            };
            PageGhost.update = function (message) {
                console.debug(message.data);
                var data = message.data, id = message.id, sender = message.sender, timestamp = message.timestamp;
                this.linkify(sender.window.url);
                if (!document.body.classList.contains('loaded')) {
                    document.body.classList.add('loaded');
                    setTimeout(function () {
                        document.body.removeChild(document.getElementsByClassName('loader')[0]);
                    }, 1000);
                }
                if (data.click) {
                    this.click(data.click);
                }
                if (data.activeElement) {
                    var element = this.getElementById(data.activeElement);
                    console.log("Focused element " + data.activeElement);
                    if (element) {
                        element.focus();
                        // @ts-ignore
                        if (element.select)
                            element.select();
                    }
                }
                if (data.scroll instanceof Array && typeof data.scroll[0] === 'number' && typeof data.scroll[1] === 'number') {
                    window.shouldNotScroll = true;
                    var body = this.iframe.contentDocument.body.getAttribute('_-_');
                    var id_1 = data.scroll[2] || body;
                    // Fix document.documentElement scrolling messed up
                    if (id_1 === '1')
                        id_1 = body;
                    var element = this.getElementById(id_1);
                    element.scrollLeft = data.scroll[0];
                    element.scrollTop = data.scroll[1];
                    window.lS = [data.scroll[0], data.scroll[1], id_1];
                }
                if (data.dom) {
                    this.html = data.dom;
                    this.setInnerHTML(data.dom);
                }
                if (data.mutation) {
                    if (typeof data.mutation.id === 'string' && typeof data.mutation.type === 'string') {
                        var element_1 = this.getElementById(data.mutation.id);
                        if (element_1 === null) {
                            console.warn("Failed to locate element with ID " + id + " in the DOM!", data.mutation);
                            return;
                        }
                        if (data.mutation.type === 'childList') {
                            if (data.mutation.data instanceof Array) {
                                data.mutation.data.forEach(function (change) {
                                    if (change.type === 'addition') {
                                        var type = change.type, html = change.html, replace = change.replace;
                                        if (replace) {
                                            element_1.innerHTML = html;
                                        }
                                        else {
                                            element_1.appendChild(htmlToElement(html));
                                        }
                                    }
                                    else if (change.type === 'removal') {
                                        var type = change.type, id_2 = change.id;
                                        var target = element_1.querySelector("[_-_=" + JSON.stringify(id_2) + "]");
                                        if (element_1.contains(target)) {
                                            element_1.removeChild(target);
                                        }
                                    }
                                });
                            }
                        }
                        else if (data.mutation.type === 'attributes') {
                            if (data.mutation.data.value === null) {
                                element_1.removeAttribute(data.mutation.data.name);
                            }
                            else {
                                element_1.setAttribute(data.mutation.data.name, data.mutation.data.value);
                            }
                        }
                        else if (data.mutation.type === 'characterData') {
                            element_1.innerHTML = escapeHtml(data.mutation.data);
                        }
                    }
                }
                if (typeof data.cursorStyle === 'string') {
                    console.log("Switched cursor to " + data.cursorStyle);
                    this.pointer.style.backgroundImage = "url('" + Cursors(data.cursorStyle) + "')";
                }
                if (typeof data.clientX !== 'undefined' && typeof data.clientY !== 'undefined') {
                    this.setCursor(data.clientX, data.clientY);
                }
                if (typeof data.innerHeight === 'number' && typeof data.innerWidth === 'number') {
                    this.resize(data.innerWidth, data.innerHeight);
                }
            };
            PageGhost.click = function (side) {
                var clicker = document.createElement('div');
                clicker.classList.add('click');
                document.getElementsByClassName('cursor')[0].appendChild(clicker);
                setTimeout(function () {
                    document.getElementsByClassName('cursor')[0].removeChild(clicker);
                }, 750);
            };
            PageGhost.clickJack = function (event) {
                event.preventDefault();
                var id = event.toElement.getAttribute('_-_');
                console.log("You clicked on element " + id);
                var config = {
                    element: "document.querySelector('[_-_=" + JSON.stringify(id) + "]')",
                    type: event.type,
                    cancelable: event.cancelable,
                    detail: event.detail,
                    screenX: event.screenX,
                    screenY: event.screenY,
                    clientX: event.clientX,
                    clientY: event.clientY,
                    ctrlKey: event.ctrlKey,
                    altKey: event.altKey,
                    shiftKey: event.shiftKey,
                    metaKey: event.metaKey,
                    button: event.button,
                };
                this.execute("injectify.module('click', " + JSON.stringify(config) + ")");
            };
            PageGhost.resize = function (width, height) {
                this.master.setAttribute('style', "width: " + width + "px; height: " + height + "px");
                this.scale();
            };
            PageGhost.execute = function (code) {
                this.win.postMessage({
                    type: 'PageGhost',
                    id: decodeURIComponent(window.location.search.substr(1)),
                    event: 'execute',
                    data: code
                }, '*');
            };
            PageGhost.sendScroll = function (array) {
                this.win.postMessage({
                    type: 'PageGhost',
                    id: decodeURIComponent(window.location.search.substr(1)),
                    event: 'scroll',
                    data: array
                }, '*');
            };
            PageGhost.scale = function () {
                var padding = this.embedded ? 0 : 60;
                this.master.style.transform = "";
                var heightScale = (window.innerHeight - padding) / this.master.offsetHeight;
                var widthScale = (window.innerWidth - padding) / this.master.offsetWidth;
                var scale = heightScale < widthScale ? heightScale : widthScale;
                var pixelScale = ((1 - scale) + 1);
                if (pixelScale < 0.5)
                    pixelScale = 0.5;
                this.master.style.transform = "translateZ(0) scale(" + scale + ") translate(-50%, -50%)";
                if (!this.embedded) {
                    this.master.style.borderRadius = pixelScale * 7 + "px";
                }
                this.master.style.boxShadow = "0 " + pixelScale * 14 + "px " + pixelScale * 28 + "px rgba(0,0,0,0.25), 0 " + pixelScale * 10 + "px " + pixelScale * 10 + "px rgba(0,0,0,0.22)";
            };
            PageGhost.setInnerHTML = function (html) {
                if (this.iframe &&
                    this.iframe.contentDocument &&
                    this.iframe.contentDocument.documentElement &&
                    this.iframe.contentDocument.documentElement.innerHTML) {
                    this.iframe.contentDocument.documentElement.innerHTML = html;
                    this.iframe.contentDocument.documentElement.setAttribute('_-_', '1');
                }
            };
            PageGhost.containarize = function (callback) {
                var _this = this;
                var iframe = document.createElement('iframe');
                iframe.setAttribute('style', 'border: 0; height: 100%; width: 100%');
                this.iframe = iframe;
                var comment = document.createComment("\n - Why is there two iframes?\n    - For security reasons\n      - Sandboxed frame is handled to prevent code execution on the " + window.location.host + " domain\n    - To sandbox the <base> outside the parent\n");
                var viewport = document.createElement('meta');
                viewport.name = 'viewport';
                viewport.content = 'width=device-width, initial-scale=1.0';
                this.container.onload = this.iframe.onload = function () {
                    try {
                        // Prevent window hijacking
                        _this.container.contentWindow.parent = null;
                        _this.iframe.contentWindow.parent = null;
                        _this.iframe.contentWindow.onclick = _this.clickJack.bind(_this);
                        // Sync scroll events with parent
                        _this.iframe.contentWindow.addEventListener('scroll', _this.scroll.bind(_this), true);
                        // Reload HTML
                        if (_this.html) {
                            _this.setInnerHTML(_this.html);
                        }
                    }
                    catch (e) { }
                };
                this.container.contentWindow.parent = null;
                this.container.contentDocument.head.appendChild(viewport);
                this.container.contentDocument.body.appendChild(comment);
                this.container.contentDocument.body.appendChild(iframe);
                this.container.contentDocument.body.setAttribute('style', 'margin: 0');
                this.container;
                callback(iframe.contentDocument);
            };
            PageGhost.getElementById = function (id) {
                if (typeof id === 'number')
                    id = id.toString();
                if (typeof id === 'string') {
                    return this.iframe.contentDocument.querySelector("[_-_=" + JSON.stringify(id) + "]");
                }
                else {
                    return null;
                }
            };
            return PageGhost;
        }()),
        _a.master = document.getElementsByClassName('window-container')[0],
        _a.container = document.getElementsByTagName('iframe')[0],
        _a.cursor = document.getElementsByClassName('cursor')[0],
        _a.pointer = document.getElementsByClassName('pointer')[0],
        _a.win = window.parent || window.opener,
        _a.embedded = window.location.search === '?embedded',
        _a.comment = "\n# PageGhost quick tips \uD83D\uDC4B\n\n - How secure is this?\n   - Relatively\n     - The client can get your IP (but only by modifying their DOM)\n     - Code execute is possible - but it's sandboxed on the about:blank domain\n\n - How are DOM updates applied?\n   - Each element is given an unique ID (_-_), a Mutation listener is used to detect changes in the clients DOM and the events are re-emmited and use the ID's to apply the changes to this sandboxed DOM\n\n - Why is it loaded over HTTP?\n   - If it's loaded over HTTPS, you'll only be able to inspect clients with HTTPS pages\n\n - Why is the window so big / small\n   - PageGhost automatically detects the clients screen resolution and scales accordingly. This prevents CSS media queries, mouse positions etc. from not working\n",
        _a.config = {
            smoothCursor: false
        },
        _a);
    window['PageGhost'].initialize();
    var _a;
});
