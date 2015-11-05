var timer = {
    getTimer: function() {
        var self = this;
        var begin = process.hrtime();
        return function() {
            var end = process.hrtime();
            return (end[0] - begin[0]) + ((end[1] - begin[1]) / 1000000000);
        }
    }
};

module.exports = timer;