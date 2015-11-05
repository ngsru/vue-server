var _ = require('underscore');
var log4js = require('log4js');

var filtersGlobal = require('./../filters');

var common = require('./common.js');
var scope = require('./scope.js');
var compilers = require('./compilers.js');
var renders = require('./renders.js');

var VueRender = function (logger) {
    logger = logger || log4js.getLogger('[VueServer]');

    var makeRootVm = function (instance) {
        var that = this;
        var vm;
        var compileInProgress = false;

        this.logger = this._initLogger(this.config, this._logger);

        if (!instance) {
            that.logger.error('Can\'t initialize render: no root instance transmitted');
            return this;
        }

        common.$logger = that.logger;
        scope.$logger = that.logger;
        scope.config = this.config;

        scope.filters = this._filters;
        scope.partials = this._partials;
        scope.components = this._components;

        renders.$logger = that.logger;


        vm = scope.initViewModel({
            parent: null,
            filters: {},
            partials: {},
            components: {},
            component: common.composeComponent(instance),
            isComponent: true
        });

        vm
            .$on('_vueServer.tryBeginCompile', function () {
                if (that._checkVmsReady(this)) {
                    if (compileInProgress) {
                        that.logger.error(
                            'Building proccess gone wrong. Some VMs finished compilation after $root Ready'
                        );
                        return;
                    }

                    compileInProgress = true;
                    this.$emit('_vueServer.readyToCompile');
                    this.$broadcast('_vueServer.readyToCompile');

                    process.nextTick(function () {
                        compilers.compile(this);

                        process.nextTick(function () {
                            var html = renders.render(this);
                            this.$emit('vueServer.htmlReady', html);
                        }.bind(this));
                    }.bind(this));
                }
            })
            .$on('_vueServer.vmReady', function () {
                this.$emit('_vueServer.tryBeginCompile');
            });

        return vm;
    };

    makeRootVm.component = this.component;
    makeRootVm.filter = this.filter;
    makeRootVm.partial = this.partial;
    makeRootVm.prototype._components = {};
    makeRootVm.prototype._filters = filtersGlobal;
    makeRootVm.prototype._partials = {};

    makeRootVm.prototype._logger = logger;
    makeRootVm.prototype._initLogger = this._initLogger;
    makeRootVm.prototype._checkVmsReady = this._checkVmsReady;

    makeRootVm.prototype.config = {
        debug: false,
        silent: false,
        strict: false,
        replace: true,
        onLogMessage: null
    };
    makeRootVm.config = makeRootVm.prototype.config;

    return makeRootVm;
};

// Проверка готовности VM-ов
VueRender.prototype._checkVmsReady = function (vm) {
    if (!vm._isReady) {
        return false;
    }

    if (vm.__states.children) {
        for (var item in vm.__states.children) {
            if (!this._checkVmsReady(vm.__states.children[item])) {
                return false;
            }
        }
    }

    return true;
};

// Объявление глобальных компонентов
VueRender.prototype.component = function (id, component) {
    if (!component) {
        this.logger.debug('global component\'s content is empty: "' + id + '"');
        return this;
    }

    this.prototype._components[id] = component;

    return this;
};

VueRender.prototype.filter = function (id, filter) {
    if (!filter) {
        this.logger.debug('global filter\'s content is empty: "' + id + '"');
        return this;
    }

    this.prototype._filters[id] = filter;

    return this;
};

VueRender.prototype.partial = function (id, partial) {
    if (!partial) {
        this.logger.debug('global partial\'s content is empty: "' + id + '"');
        return this;
    }

    this.prototype._partials[id] = partial;

    return this;
};

VueRender.prototype._initLogger = function (config, logger) {
    return {
        _config: config,
        _logger: logger,
        log: function () {
            if (!this._config.silent) {
                this._logger.debug.apply(this._logger, arguments);
            }

            return this;
        },
        debug: function () {
            if (!this._config.silent && this._config.debug) {
                this._logger.debug.apply(this._logger, arguments);
            }

            return this;
        },
        info: function () {
            if (!this._config.silent && this._config.debug) {
                this._logger.info.apply(this._logger, arguments);
            }

            return this;
        },
        warn: function () {
            if (!this._config.silent) {
                this._logger.warn.apply(this._logger, arguments);
            }

            return this;
        },
        error: function () {
            if (!this._config.silent) {
                this._logger.error.apply(this._logger, arguments);
            }

            return this;
        }
    };
};

module.exports = VueRender;
