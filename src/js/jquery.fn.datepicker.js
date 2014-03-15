;(function($){
  $.fn.datepicker = function(method, options) {
    if (_.isObject(method)) { 
      options = method; method = undefined;
    }
    options = _.defaults(options, $.fn.datepicker.defaults);

    var $this = this.first();
    var dp = $this.data('datepicker');
    var result = undefined;

    if (!dp){
      dp = new $.fn.datepicker.DatePicker($this, options);
      $this.data('datepicker', dp);
    }
    if (method) {
      result = dp[method].call(dp, options);
    }
    return result == null ? $this : result;
  }

  $.fn.datepicker.defaults = { 
    dateFormat: 'd MMM \'yy',
    firstDayOfWeek: 1 // Monday
  };

  $.fn.datepicker.daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

})(jQuery);
