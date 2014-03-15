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
    dateFormat: 'd MMM \'yy',
    firstDayOfWeek: 1 // Monday
  };

  $.fn.datepicker.daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

})(jQuery);
;
(function($){

  $.fn.datepicker.templates = {

    button: _.template('<span class="dp-control dp-collapsed"><%= value %></span>'),

    calendarContainer: '<div class="dp-calendar-container dp-hidden"></div>',

    month: _.template(
      '<div class="dp-month-container">' + 
      '  <h3 class="dp-month-header"><%= month %>, <%= year %></h3>' + 
      '  <table class="dp-month-table">' + 
      '    <tr class="dp-days-of-week">' + 
      '      <% _.each(daysOfWeek, function(day) { print("<th>" + day + "</th>"); }) %>' + 
      '    </tr>' +
      '  </table>' + 
      '</div>'
    ),

    week: '<tr class="dp-week"></tr>',

    day: _.template(
      '<td class="dp-day <% if(selected) { print("dp-selected"); } %>" title="<%= title %>"><%= day %></td>'
    ),

    emptyCell: '<td class="dp-day dp-empty"></td>'

  }

})(jQuery);
;
(function($){
  var templates = $.fn.datepicker.templates;

  function Calendar(options) {
    this.options = options;
    this.date = options.date;
    this.months = [];
  }

  Calendar.prototype = {
    insertAfter: function($element){
      if(!this.$el) { this.render(); }
      this.$el.insertAfter($element);
      // hack to make css transition work
      setTimeout(function(){
        this.$el.removeClass('dp-hidden');
      }.bind(this), 0);
    },
    render: function(){
      var month = this.date.getMonth();
      var year = this.date.getFullYear();
      
      this.$el = $(templates.calendarContainer);
      
      for(var i = -1; i <= 1; i++) {
        this.renderMonth(month + i, year);
      }
    },
    renderMonth: function(month, year) {
      var date = new Date(year, month, 1);
      var daysOfWeek = _.clone($.fn.datepicker.daysOfWeek);
      _(this.options.firstDayOfWeek).times(function() {
        daysOfWeek.push(daysOfWeek.shift());
      });
      var $month = $(templates.month({ 
        month: date.toString('MMMM'), 
        year: year,
        daysOfWeek: daysOfWeek
      }));
      var $table = $month.find('.dp-month-table')
      var $week = $(templates.week);

      this.months.push([month, year]);

      // append empty cells before month's first day
      var firstDayDOW = $.fn.datepicker.daysOfWeek[date.getDay()];
      _(daysOfWeek.indexOf(firstDayDOW)).times(function(){
        $week.append(templates.emptyCell);
      });

      while(date.getMonth() === month) {
        var day = date.getDate();
        if(date.getDay() === this.options.firstDayOfWeek && day !== 1) {
          $week.appendTo($table);
          $week = $(templates.week);
        }
        $week.append(templates.day({ 
          day: day, 
          title: date.toDateString(), 
          selected: date.isSameDay(this.date) 
        }));
        date.addDays(1);
      }

      // append empty cells after month's last day
      var lastDayDOW = $.fn.datepicker.daysOfWeek[date.addDays(-1).getDay()];
      _(6 - daysOfWeek.indexOf(lastDayDOW)).times(function(){
        $week.append($.fn.datepicker.templates.emptyCell);
      });

      $week.appendTo($table);
      this.$el.append($month);
    },
    destroy: function() {
      this.$el.addClass('dp-hidden');
      // quick & dirty hack - use timeout to avoid transitionend event
      setTimeout(function(){
        this.$el.remove();
        delete this.$el;
      }.bind(this), 200);
    }
  };

  $.fn.datepicker.Calendar = Calendar;

})(jQuery);
;
(function($){
  var templates = $.fn.datepicker.templates;

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
    this.$button = $(templates.button({ 
      value: date.toString(options.dateFormat) 
    })).insertAfter($input.hide());

    this.$button.click(this.toggleCalendar.bind(this));

    this.calendar = new $.fn.datepicker.Calendar(_.extend({ date: this.date }, this.options));
  }

  DatePicker.prototype = {
    isExpanded: function() {
      return this.$button.hasClass('dp-expanded');
    },
    toggleCalendar: function() {
      if (this.isExpanded()) {
        this.calendar.destroy();
        this.$button.removeClass('dp-expanded').addClass('dp-collapsed');
      } else {
        this.calendar.insertAfter(this.$button);
        this.$button.removeClass('dp-collapsed').addClass('dp-expanded');
      }
    }
  }

  $.fn.datepicker.DatePicker = DatePicker;

})(jQuery);
