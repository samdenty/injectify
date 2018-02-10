var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
document.addEventListener('DOMContentLoaded', function () {
    window['PageGhost'] = (_a = /** @class */ (function () {
            function PageGhost() {
            }
            PageGhost.initialize = function () {
                var _this = this;
                var _a = this, container = _a.container, cursor = _a.cursor, iframe = _a.iframe;
                this.containarize(function (doc) {
                    window.opener.postMessage({
                        type: 'PageGhost',
                        id: decodeURIComponent(window.location.search.substr(1))
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
                cursor.style.transition = 'transform 0.1s ease-in-out';
                this.setCursor(x, y);
                this.setConfig();
            };
            PageGhost.setConfig = function (newConfig) {
                this.config = __assign({}, this.config, newConfig);
                if (this.config.smoothCursor) {
                    this.cursor.style.transition = 'transform 0.1s ease-in-out';
                }
                else {
                    this.cursor.style.transition = '';
                }
            };
            PageGhost.update = function (message) {
                console.log(message.data);
                var data = message.data, id = message.id, sender = message.sender, timestamp = message.timestamp;
                this.linkify(sender.window.url);
                if (data.click) {
                    this.click(data.click);
                }
                if (data.scroll instanceof Array && typeof data.scroll[0] === 'number' && typeof data.scroll[1] === 'number') {
                    this.iframe.contentWindow.scrollTo(data.scroll[0], data.scroll[1]);
                }
                if (data.dom) {
                    this.html = data.dom;
                    this.setInnerHTML(data.dom);
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
            PageGhost.resize = function (width, height) {
                this.master.setAttribute('style', "width: " + width + "px; height: " + height + "px");
                this.scale();
            };
            PageGhost.scale = function () {
                this.master.style.transform = "";
                var heightScale = (window.innerHeight - 60) / this.master.offsetHeight;
                var widthScale = (window.innerWidth - 60) / this.master.offsetWidth;
                var scale = heightScale < widthScale ? heightScale : widthScale;
                var pixelScale = ((1 - scale) + 1);
                this.master.style.transform = "scale(" + scale + ") translate(-50%, -50%)";
                this.master.style.borderRadius = pixelScale * 7 + "px";
                this.master.style.boxShadow = "0 " + pixelScale * 14 + "px " + pixelScale * 28 + "px rgba(0,0,0,0.25), 0 " + pixelScale * 10 + "px " + pixelScale * 10 + "px rgba(0,0,0,0.22)";
            };
            PageGhost.setInnerHTML = function (html) {
                if (this.iframe &&
                    this.iframe.contentDocument &&
                    this.iframe.contentDocument.documentElement &&
                    this.iframe.contentDocument.documentElement.innerHTML) {
                    this.iframe.contentDocument.documentElement.innerHTML = html;
                }
            };
            PageGhost.containarize = function (callback) {
                var _this = this;
                var iframe = document.createElement('iframe');
                iframe.setAttribute('style', 'border: 0; height: 100%; width: 100%');
                this.iframe = iframe;
                var viewport = document.createElement('meta');
                viewport.name = 'viewport';
                viewport.content = 'width=device-width, initial-scale=1.0';
                this.container.onload = this.iframe.onload = function () {
                    try {
                        // Prevent window hijacking
                        _this.container.contentWindow.parent = null;
                        _this.iframe.contentWindow.parent = null;
                        // Reload HTML
                        if (_this.html) {
                            _this.setInnerHTML(_this.html);
                        }
                    }
                    catch (e) { }
                };
                this.container.contentWindow.parent = null;
                this.container.contentDocument.head.appendChild(viewport);
                this.container.contentDocument.body.appendChild(iframe);
                this.container.contentDocument.body.setAttribute('style', 'margin: 0');
                this.container;
                callback(iframe.contentDocument);
            };
            return PageGhost;
        }()),
        _a.master = document.getElementsByClassName('window-container')[0],
        _a.container = document.getElementsByTagName('iframe')[0],
        _a.cursor = document.getElementsByClassName('cursor')[0],
        _a.config = {
            smoothCursor: true
        },
        _a);
    window['PageGhost'].initialize();
    var _a;
});
