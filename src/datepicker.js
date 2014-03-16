;(function($){
  "use strict";

  $.fn.datepicker = function(method, options) {
    if (_.isObject(method)) { 
      options = method; method = undefined;
    }
    options = _.defaults(options, $.fn.datepicker.defaults);

    var $this = this.first();
    var dp = $this.data('datepicker');
    var result;

    if (!dp){
      dp = new $.fn.datepicker.DatePicker($this, options);
      $this.data('datepicker', dp);
    }
    if (method) {
      result = dp[method].call(dp, options);
    }
    return result == null ? $this : result;
  };

  $.fn.datepicker.defaults = { 
    dateFormat: 'd MMM \'yy',
    firstDayOfWeek: 1 // Monday
  };

  $.fn.datepicker.daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

})(jQuery);
;
(function($){
  "use strict";

  $.fn.datepicker.templates = {

    button: _.template('<span class="dp-control dp-collapsed"><%= value %></span>'),

    calendarContainer: 
      '<div class="dp-calendar-container-outer dp-hidden">' + 
      '  <div class="dp-calendar-container-inner"></div>' +
      '  <div class="dp-calendar-backdrop"></div>' +
      '</div>',

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

    emptyCell: '<td class="dp-empty"></td>'

  };

})(jQuery);
;
(function($){
  "use strict";

  var templates = $.fn.datepicker.templates;

  function Calendar(options) {
    this.options = options;
    this.date = new Date(options.date);
    this.months = [];
    this._callbacks = {};
  }

  Calendar.prototype = {
    render: function(options){
      this.$el = $(templates.calendarContainer).insertAfter(options.after);
      // render previous month first
      var month = new Date(this.date).moveToFirstDayOfMonth().addMonths(-1);
      this._renderMonth(month); 
      
      // hack to make css transition work
      setTimeout(function(){
        this.$el.removeClass('dp-hidden');

        // when the first month is in DOM, get its width and calculate total
        // amount of months per page
        var monthWidth = this.$el.find('.dp-month-container').outerWidth();
        var containerWidth = this.$el.width();
        this._monthsPerPage = Math.floor(containerWidth / monthWidth);
        _(this._monthsPerPage - 1).times(function() {
          this._renderMonth(month.addMonths(1));
        }.bind(this));

        // adjust height to absolute positioned child
        this.$el.height(this.$el.find('.dp-calendar-container-inner').height());

        this._bindEvents();

      }.bind(this), 0);
    },
    select: function(date) {
      this._getCell(this.date).removeClass('dp-selected');
      this._getCell(date).addClass('dp-selected');
      this.date = date;
    },
    remove: function() {
      this.months = [];
      this.$el.addClass('dp-hidden');
      // quick & dirty hack - use timeout to avoid transitionend event
      setTimeout(function(){
        this.$el.remove();
        delete this.$el;
      }.bind(this), 200);
    },
    destroy: function() {
      this.remove();
      _.each(this._callbacks, function(callbacks) {
        callbacks.disable();
      });
      this._callbacks = {};
    },
    trigger: function(event, data) {
      var cb = this._callbacks[event];
      if(cb) { cb.fire(data); }
    },
    on: function(event, callback) {
      var cb = this._callbacks[event];
      if(!cb) { 
        cb = this._callbacks[event] = $.Callbacks(); 
      }
      cb.add(callback);
    },
    _bindEvents: function(){
      this.$el.find('.dp-calendar-container-inner').pep({ axis: 'x' });

      this.$el.click(function(ev) {
        var $target = $(ev.target);
        if($target.hasClass('dp-day')) {
          this.trigger('date:click', new Date($target.attr('title')));
        }
      }.bind(this));
    },
    _renderMonth: function(monthDate) {
      var date = new Date(monthDate);
      var daysOfWeek = _.clone($.fn.datepicker.daysOfWeek);
      // rearrange days of week according to the first day of week setting
      _(this.options.firstDayOfWeek).times(function() {
        daysOfWeek.push(daysOfWeek.shift());
      });
      var $month = $(templates.month({ 
        month: date.toString('MMMM'), 
        year: date.getFullYear(),
        daysOfWeek: daysOfWeek
      }));
      var $table = $month.find('.dp-month-table');
      var $week = $(templates.week);

      // append empty cells before month's first day
      var firstDayDOW = $.fn.datepicker.daysOfWeek[date.getDay()];
      _(daysOfWeek.indexOf(firstDayDOW)).times(function(){
        $week.append(templates.emptyCell);
      });

      while(date.getMonth() === monthDate.getMonth()) {
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
      this.$el.find('.dp-calendar-container-inner').append($month);

      this.months.push({ month: monthDate, $el: $month });

    },
    _removeMonth: function(month) {
      month.$el.remove();
      _.pull(this.months, month);
    },
    _getCell: function(date){
      return this.$el.find('.dp-day[title="' + date.toDateString() + '"]');
    },
  };

  $.fn.datepicker.Calendar = Calendar;

})(jQuery);
;
(function($){
  "use strict";

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

    this.calendar = new $.fn.datepicker.Calendar(_.extend({ date: this.date }, this.options));

    this.$button.click(this.toggle.bind(this));
    this.calendar.on('date:click', this.setDate.bind(this));
  }

  DatePicker.prototype = {
    isExpanded: function() {
      return this.$button.hasClass('dp-expanded');
    },
    toggle: function() {
      if (this.isExpanded()) {
        this.calendar.remove();
        this.$button.removeClass('dp-expanded').addClass('dp-collapsed');
      } else {
        this.calendar.render({ after: this.$button });
        this.$button.removeClass('dp-collapsed').addClass('dp-expanded');
      }
    },
    getDate: function() {
      return this.date;
    },
    setDate: function(date){
      date = new Date(date);
      if(isNaN(date)) { 
        throw new Error('Invalid date.'); 
      }
      this.date = date;
      this.$button.html(date.toString(this.options.dateFormat));
      this.$input.val(date.toDateString());
      this.calendar.select(date);
    },
    destroy: function() {
      this.calendar.destroy();
      this.$button.remove();
      this.$input.data('datepicker', undefined).show();
    }
  };

  $.fn.datepicker.DatePicker = DatePicker;

})(jQuery);
