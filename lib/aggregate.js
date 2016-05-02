'use strict';

function aggregatePaginate(aggregate, options, callback) {
  var maxDocs = -1;

  if (options) {
    maxDocs = options.maxDocs || maxDocs;
  }

  var defaults = {
        from: 0,
        limit: maxDocs,
        page: 1
      },
      wrap = {};

  options = options || defaults;
  options.limit = parseInt(options && options.limit ? options.limit : defaults.limit);
  options.page = (options && options.page ? parseFloat(options.page) - 1 : parseFloat(defaults.page) - 1);
  options.from = options.limit * options.page;

  if (maxDocs > 0 && (options.limit > maxDocs || options.limit === 0)) {
    options.limit = maxDocs;
  }

  aggregate.exec(function (err, results) {
    if (err) {
      return callback(err);
    }

    options.page = options.page + 1;

    var to = options.from + options.limit;
    var total = results && results.length > 0 ? (results[0].total || 0) : 0;

    if (total === 0) {
      options.from = to = 0;
    } else if (to > total) {
      to = total;
    }

    wrap = {
      options: options,
      results: results || [],
      total: total,
      show_prev: options.from <= 1 ? false : true,
      show_next: to >= total ? false : true
    };

    callback(err, wrap);
  });
}

module.exports = function (schema) {
  schema.statics.aggregatePaginate = aggregatePaginate
};
