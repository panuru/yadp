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
;
(function($){

  function DatePicker($input, options) {
    this.$input = $input;
    this.options = options = _.extend($.fn.datepicker.defaults, options);
    var date = new Date($input.val());
    // if not a valid date, use today's date
    if(isNaN(date.getDay())) {
      date = new Date();
    }
    this.date = date;
    // replace dom element with a datepicker control
    this.$button = $($.fn.datepicker.templates.button({ 
      value: date.toString('d MMM \'yy') 
    }));
    $input.replaceWith(this.$button);
    this.$button.click(this.toggleCalendar.bind(this));
  }

  DatePicker.prototype = {
    isExpanded: function() {
      return !!this.$calendar;
    },
    toggleCalendar: function() {
      if (this.isExpanded()) {
        this.$calendar.remove();
        delete this.$calendar;
        this.$button.removeClass('dp-expanded').addClass('dp-collapsed');
      } else {
        this.$calendar = $($.fn.datepicker.templates.calendarContainer);
        this.renderCalendar();
        this.$button.after(this.$calendar);
        this.$button.removeClass('dp-collapsed').addClass('dp-expanded');
      }
    },
    renderCalendar: function(){

    }
  }

  $.fn.datepicker.DatePicker = DatePicker;

})(jQuery);
;
(function($){
  $.fn.datepicker.daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  $.fn.datepicker.templates = {
    button: _.template('<span class="dp-control dp-collapsed"><%= value %></span>'),
    calendarContainer: '<div class="dp-calendar-container">Hello! I\'m a calendar (actually not, but I will be one day)</div>',
    month: _.template(
      '<section class="dp-month-container">' + 
      '  <h3><%= month %></h3>' + 
      '  <table class="dp-month">' + 
      '    <th class="dp-days-of-week"><% _.each($.fn.datepicker.daysOfWeek, function(day) { print("<td>" + day + "</td"); }) %></th>' +
      '  </table>' + 
      '</section>'),
    week: '<tr class="dp-week"></tr>',
    day: _.template('<td class="dp-day <% if(selected) { print("dp-selected"); } %>"><%= day %></td>'),
    emptyCell: '<td class="dp-day dp-empty"></td>'
  }
})(jQuery);
