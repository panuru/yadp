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
      this.$innerContainer = this.$el.find('.dp-calendar-container-inner');

      // render previous month first
      var month = new Date(this.date).moveToFirstDayOfMonth().addMonths(-1);
      var $month = this._renderMonth(month); 

      // when the first month is in DOM, get its width and calculate total
      // amount of months per page
      var monthWidth = $month.outerWidth();
      var containerWidth = this.$el.width();
      this._monthsPerPage = Math.floor(containerWidth / monthWidth);
      _(this._monthsPerPage - 1).times(function() {
        this._renderMonth(month.addMonths(1));
      }.bind(this));

      this._bindEvents();
      
      // hack to make css transition work
      setTimeout(function (){
        this.$el.removeClass('dp-hidden');
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
      this.$innerContainer.append($month);

      this.months.push({ month: monthDate, $el: $month });

      // adjust calendar height to absolute positioned child
      this.$el.height(this.$innerContainer.height());

      return $month;
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
