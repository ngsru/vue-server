var _ = require('underscore');
var log4js = require('log4js');

var filtersGlobal = require('./../filters');

var common = require('./common.js');
var scope = require('./scope.js');
var compilers = require('./compilers.js');
var renders = require('./renders.js');

var VueRender = function (logger) {
    logger = logger || log4js.getLogger('[VueServer]');

    var VueRoot = function (instance) {
        var that = this;
        var vm;
        var compileInProgress = false;

        this.logger = this._initLogger(this.config, this._logger);

        if (!instance) {
            that.logger.error('Can\'t initialize render: no root instance transmitted');
            return this;
        }

        // Precompiling global partials
        for (var name in this._partials) {
            this._partials[name] = common.prepareTemplate(
                this._partials[name],
                'Partial "' + name + '"'
            );
        }

        common.$logger = that.logger;
        scope.$logger = that.logger;
        scope.config = this.config;

        scope.filters = this._filters;
        scope.partials = this._partials;
        scope.components = this._components;
        scope.mixin = this.mixin || null;

        renders.$logger = that.logger;


        vm = scope.initViewModel({
            parent: null,
            filters: {},
            partials: {},
            components: {},
            component: common.composeComponent(instance, this.mixin),
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




    VueRoot.component = function (id, component) {
        if (!component) {
            this.logger.debug('global component\'s content is empty: "' + id + '"');
            return this;
        }

        this.prototype._components[id] = component;

        return this;
    };

    VueRoot.filter = function (id, filter) {
        if (!filter) {
            this.logger.debug('global filter\'s content is empty: "' + id + '"');
            return this;
        }

        this.prototype._filters[id] = filter;

        return this;
    };

    VueRoot.partial = function (id, partial) {
        if (!partial) {
            this.logger.debug('global partial\'s content is empty: "' + id + '"');
            return this;
        }

        this.prototype._partials[id] = partial;

        return this;
    };

    Object.defineProperty(VueRoot, 'mixin', {
        get: function () {
            return this.prototype.mixin;
        },
        set: function (val) {
            this.prototype.mixin = val;
        }
    });

    // Check for VM ready
    VueRoot.prototype._checkVmsReady = function (vm) {
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

    VueRoot.prototype._initLogger = function (config, logger) {
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

    VueRoot.prototype._logger = logger;

    VueRoot.prototype._components = {};
    VueRoot.prototype._filters = filtersGlobal;
    VueRoot.prototype._partials = {};

    VueRoot.prototype.config = {
        debug: false,
        silent: false,
        strict: false,
        replace: true,
        onLogMessage: null
    };
    VueRoot.config = VueRoot.prototype.config;

    return VueRoot;
};

module.exports = VueRender;
