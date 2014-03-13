(function($){
  $.fn.datepicker = function(method, options) {
    if (_.isObject(method)) { 
      options = method; method = undefined;
    }
    options = _.defaults(options, $.fn.datepicker.defaults);
    return this.each(function(){
      var $this = $(this);
      var dp = $this.data('datepicker');
      if (method) {
        if (!dp) {
          throw new Error('Cannot call datepicker method: datepicker is not initialized.');
        }
        var fn = dp[method];
        if (!_.isFunction(fn)){
          throw new Error('Datepicker does not have a method "' + method + '".');
        }
        fn.call(dp, options);
      }
      else if (!dp){
        dp = new $.fn.datepicker.DatePicker($this, options);
        $this.data('datepicker', dp);
      }
    });
  }

  $.fn.datepicker.defaults = { 
    dateFormat: 'd MMM \'yy'
  };

})(jQuery);
