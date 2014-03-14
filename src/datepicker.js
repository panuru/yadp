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
    })).insertAfter($input.hide());

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
      var month = this.date.getMonth();
      var year = this.date.getFullYear();
      for(var i = -1; i <= 1; i++) {
        this.renderMonth(month + i, year);
      }
    },
    renderMonth: function(month, year) {
      var templates = $.fn.datepicker.templates;
      var date = new Date(year, month, 1);
      var $month = $(templates.month({ month: date.toString('MMMM'), year: year }));
      var $table = $month.find('.dp-month-table')
      var $week = $(templates.week);
      // append empty cells before month's first day
      for(var i = 0, day = date.getDay(); i < day; i++ ) {
        $week.append(templates.emptyCell);
      }
      while(date.getMonth() === month) {
        var day = date.getDate();
        if(date.getDay() === 0 && day !== 1) {
          $week.appendTo($table);
          $week = $(templates.week);
        }
        $week.append(templates.day({ 
          day: day, 
          title: date.toString(), 
          selected: date.isSameDay(this.date) 
        }));
        date.addDays(1);
      }
      for(var i = date.getDay(); i <= 6; i++) {
        $week.append($.fn.datepicker.templates.emptyCell);
      }
      $week.appendTo($table);
      this.$calendar.append($month);
    }
  }

  $.fn.datepicker.DatePicker = DatePicker;

})(jQuery);
;
(function($){
  $.fn.datepicker.daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  $.fn.datepicker.templates = {
    button: _.template('<span class="dp-control dp-collapsed"><%= value %></span>'),
    calendarContainer: '<div class="dp-calendar-container"></div>',
    month: _.template(
      '<section class="dp-month-container">' + 
      '  <h3><%= month %>, <%= year %></h3>' + 
      '  <table class="dp-month-table">' + 
      '    <tr class="dp-days-of-week"><% _.each($.fn.datepicker.daysOfWeek, function(day) { print("<th>" + day + "</th>"); }) %></tr>' +
      '  </table>' + 
      '</section>'),
    week: '<tr class="dp-week"></tr>',
    day: _.template(
      '<td class="dp-day <% if(selected) { print("dp-selected"); } %>" title="<%= title %>"><%= day %></td>'),
    emptyCell: '<td class="dp-day dp-empty"></td>'
  }
})(jQuery);
