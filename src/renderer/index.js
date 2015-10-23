var _ = require('underscore');
var log4js = require('log4js');

var filtersGlobal = require('./../filters');

var scope = require('./scope.js');
var compilers = require('./compilers.js');
var renders = require('./renders.js');


var VueRender = function(logger) {
    logger = logger || log4js.getLogger('[VueServer]');

    var makeRootVm = function(instance) {
        var that = this;
        var styles = {};
        var vm;
        var compileInProgress = false;

        this.logger = this._initLogger(this.config, this._logger);

        this.components = {};
        this.filters = filtersGlobal;
        this.partials = {};

        if (!instance) {
            that.logger.error('Can\'t initialize render: no root instance transmitted');
            return this;
        }


        scope.$logger = that.logger;
        scope.config = this.config;
        renders.$logger = that.logger;

        vm = scope.initViewModel({
            parent: null,
            filters: that.filters,
            partials: that.partials,
            components: that.components,
            component: instance,
            isComponent: true
        });


        vm
            .$on('_vueServer.populateStyles', function (style) {
                styles[style] = 1;
            })
            .$on('_vueServer.tryBeginCompile', function() {
                if (that._checkVmsReady(this)) {
                    if (compileInProgress) {
                        that.logger.warn('"vueServer:action.rebuildVm" called after application finished compiling. Changes won\'t appear.');
                        return;
                    }

                    compileInProgress = true;
                    this.$emit('_vueServer.readyToCompile');
                    this.$broadcast('_vueServer.readyToCompile');

                    // Инициализация стилей из компонентов
                    var styleStr = '';
                    for (var style in styles) {
                        styleStr += style;
                    }
                    this.styles = styleStr;

                    process.nextTick(function() {
                        compilers.compile(this);

                        process.nextTick(function() {
                            var html = renders.render(this);
                            this.$emit('vueServer.htmlReady', html);
                        }.bind(this));
                    }.bind(this));
                }
            })
            .$on('_vueServer.vmReady', function() {
                this.$emit('_vueServer.tryBeginCompile');
            });

        return vm;
    };


    makeRootVm.prototype.config = {
        debug: false,
        silent: false,
        replace: true,
        onLogMessage: null
    };

    makeRootVm.prototype.component = this.component;
    makeRootVm.prototype.filter = this.filter;
    makeRootVm.prototype.partial = this.partial;
    makeRootVm.prototype._logger = logger;
    makeRootVm.prototype._initLogger = this._initLogger;
    makeRootVm.prototype._checkVmsReady = this._checkVmsReady;

    makeRootVm.config = makeRootVm.prototype.config;

    return makeRootVm;
};





// Проверка готовности VM-ов
VueRender.prototype._checkVmsReady = function(vm) {
    if (!vm._isReady) {
        return false;
    }

    if (vm.$children) {
        for (var item in vm.$children) {
            if (!this._checkVmsReady(vm.$children[item])) {
                return false;
            }
        }
    }

    return true;
};


// Объявление глобальных компонентов
VueRender.prototype.component = function(id, component) {
    if (!component) {
        this.logger.debug('global component\'s content is empty: "' + id + '"');
        return this;
    }

    this.components[id] = component;

    return this;
};


VueRender.prototype.filter = function(id, filter) {
    if (!filter) {
        this.logger.debug('global filter\'s content is empty: "' + id + '"');
        return this;
    }

    this.filters[id] = filter;

    return this;
};


VueRender.prototype.partial = function(id, partial) {
    if (!partial) {
        this.logger.debug('global partial\'s content is empty: "' + id + '"');
        return this;
    }

    this.partials[id] = partial;

    return this;
};


VueRender.prototype._initLogger = function(config, logger) {
    return {
        _config: config,
        _logger: logger,
        debug: function() {
            if (!this._config.silent && this._config.debug) {
                this._logger.debug.apply(this._logger, arguments);
            }

            return this;
        },
        info: function() {
            if (!this._config.silent && this._config.debug) {
                this._logger.info.apply(this._logger, arguments);
            }

            return this;
        },
        warn: function() {
            if (!this._config.silent) {
                this._logger.warn.apply(this._logger, arguments);
            }

            return this;
        },
        error: function() {
            if (!this._config.silent) {
                this._logger.error.apply(this._logger, arguments);
            }

            return this;
        }
    };
};


module.exports = VueRender;
