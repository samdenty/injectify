document.addEventListener('DOMContentLoaded', function () {
    new /** @class */ (function () {
        function class_1() {
            var _this = this;
            this.iframe = document.getElementsByTagName('iframe')[0];
            window.addEventListener('message', function (_a) {
                var data = _a.data;
                _this.update(data);
            });
        }
        class_1.prototype.update = function (data) {
            data.
            ;
        };
        return class_1;
    }());
});
