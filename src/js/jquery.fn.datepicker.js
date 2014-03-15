;(function($){
  $.fn.datepicker = function(method, options) {
    if (_.isObject(method)) { 
      options = method; method = undefined;
    }
    options = _.defaults(options, $.fn.datepicker.defaults);

    return this.each(function(){
      var $this = $(this);
      var dp = $this.data('datepicker');

      if (!dp){
        dp = new $.fn.datepicker.DatePicker($this, options);
        $this.data('datepicker', dp);
      }
      if (method) {
        dp[method].call(dp, options);
      }
    });
  }

  $.fn.datepicker.defaults = { 
    dateFormat: 'd MMM \'yy'
  };

})(jQuery);
