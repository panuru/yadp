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
    this._callbacks = {};
  }

  Calendar.prototype = {
    trigger: function(event, data) {
      var cb = this._callbacks[event];
      if(cb) { cb.fire(data); }
    },
    on: function(event, callback) {
      var cb = this._callbacks[event];
      if(!cb) { cb = this._callbacks[event] = $.Callbacks()}
      cb.add(callback);
    },
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

      this.$el.click(function(ev) {
        $target = $(ev.target);
        if($target.hasClass('dp-day')) {
          this.trigger('date:click', new Date($target.attr('title')));
        }
      }.bind(this));
      
      for(var i = -1; i <= 1; i++) {
        this._renderMonth(month + i, year);
      }
    },
    select: function(date) {
      this._getCell(this.date).removeClass('dp-selected');
      this.date = date;
      this._getCell(this.date).addClass('dp-selected');
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
    removeMonth: function(month) {
      month.$el.remove();
      _.pull(this.months, month);
    },
    destroy: function() {
      this.remove();
      _.each(this._callbacks, function(callbacks) {
        callbacks.disable();
      });
      this._callbacks = {};
    },
    _renderMonth: function(month, year) {
      var date = new Date(year, month, 1);
      var daysOfWeek = _.clone($.fn.datepicker.daysOfWeek);
      // rearrange days of week according to the first day of week setting
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

      this.months.push({ month: month, year: year, $el: $month });

    },
    _getCell: function(date){
      return this.$el.find('.dp-day[title="' + date.toDateString() + '"]');
    },
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

    this.calendar = new $.fn.datepicker.Calendar(_.extend({ date: this.date }, this.options));

    this.$button.click(this.toggle.bind(this));
    this.calendar.on('date:click', this.select.bind(this));
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
        this.calendar.insertAfter(this.$button);
        this.$button.removeClass('dp-collapsed').addClass('dp-expanded');
      }
    },
    select: function(date){
      date = new Date(date);
      if(isNaN(date)) { throw new Error('Invalid date.'); }
      this.date = date;
      this.$button.html(date.toString(this.options.dateFormat));
      this.calendar.select(date);
    },
    destroy: function() {
      this.calendar.destroy();
      this.$button.remove();
      this.$input.data('datepicker', undefined).show();
    }
  }

  $.fn.datepicker.DatePicker = DatePicker;

})(jQuery);
