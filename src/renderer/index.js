var log4js = require('log4js');

var filtersGlobal = require('./../filters');

var asset = require('./asset.js');
var scope = require('./scope.js');
var compilers = require('./compilers.js');
var renders = require('./renders.js');

var systemOptions = {
    filters: true,
    partials: true,
    components: true,
    mixin: true,
    config: true,
    _logger: true
};

var initLogger = function (config, logger) {
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

var VueRender = function (logger) {
    logger = logger || log4js.getLogger('[VueServer]');

    var VueRoot = function (instance) {
        var that = this;
        var vm;
        var compileInProgress = false;

        // Check for VM ready
        this._checkVmsReady = function (vm) {
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

        scope.$logger = this.logger;
        renders.$logger = this.logger;

        if (!instance) {
            this.logger.error('Can\'t initialize render: no root instance transmitted');
            return this;
        }

        // -------------------------
        // Global prototype
        var globalPrototype = {};
        var proto = Object.getPrototypeOf(this);

        for (var name in proto) {
            if (systemOptions[name]) {
                continue;
            } else {
                globalPrototype[name] = proto[name];
            }
        }

        scope.globalPrototype = globalPrototype;
        // -------------------------

        scope.config = this.config;

        scope.filters = this.filters;
        scope.partials = this.partials;
        scope.components = this.components;
        scope.mixin = this.mixin || null;

        vm = scope.initViewModel({
            parent: null,
            filters: {},
            partials: {},
            components: {},
            component: asset.composeComponent(this.logger, instance, this.mixin),
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

    VueRoot.extend = function (instance) {
        if (!instance) {
            instance = {};
        }
        return asset.composeComponent(this.prototype.logger, instance, this.mixin);
    };

    VueRoot.component = function (id, instance) {
        var result = this.extend(instance);
        this.prototype.components[id] = result;

        return result;
    };

    VueRoot.filter = function (id, filter) {
        this.prototype.filters[id] = filter;

        return filter;
    };

    VueRoot.partial = function (id, partial) {
        var result = asset.compileTemplate(
            this.prototype.logger,
            partial,
            'Partial "' + id + '"'
        );

        this.prototype.partials[id] = result;

        return result;
    };

    Object.defineProperty(VueRoot, 'mixin', {
        get: function () {
            return this.prototype.mixin;
        },
        set: function (val) {
            this.prototype.mixin = val;
        }
    });

    VueRoot.prototype._logger = logger;

    VueRoot.prototype.components = {};
    VueRoot.prototype.filters = filtersGlobal;
    VueRoot.prototype.partials = {};

    VueRoot.prototype.config = {
        debug: false,
        silent: false,
        strict: false,
        replace: true,
        onLogMessage: null
    };
    VueRoot.config = VueRoot.prototype.config;

    VueRoot.prototype.logger = initLogger(VueRoot.config, logger);

    return VueRoot;
};

module.exports = VueRender;
