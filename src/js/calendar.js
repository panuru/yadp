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
      var $month = this._renderMonth({ month: month }); 

      // when the first month is in DOM, get its width and calculate total
      // amount of months per page
      this._monthWidth = $month.outerWidth();
      this._containerWidth = this.$el.width();
      var monthsCount = Math.ceil(this._containerWidth / this._monthWidth);
      _(monthsCount - 1).times(function() {
        this._renderMonth({ month: month.addMonths(1) });
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
      this.$el.find('.dp-calendar-container-inner').pep({ 
        axis: 'x',
        useCSSTranslation: false,
        stop: function(ev) {
          var left = this.$innerContainer.position().left;
          var monthsCount, month;
          if(left > 0) {
            monthsCount = Math.ceil(left / this._monthWidth);
            month = new Date(this.months[0].date);
            this.$innerContainer.css({ left: left - this._monthWidth * monthsCount });
            _(monthsCount).times(function() {
              this._renderMonth({ month: month.addMonths(-1), prepend: true });
            }.bind(this));
          } 
          else {
            var right = this.$el.width() - (left + this.$innerContainer.width());
            monthsCount = Math.ceil(right / this._monthWidth);
            month = new Date(this.months[this.months.length - 1].date);
            _(monthsCount).times(function() {
              this._renderMonth({ month: month.addMonths(1) });
            }.bind(this));
          }
        }.bind(this)
      });

      this.$el.click(function(ev) {
        var $target = $(ev.target);
        if($target.hasClass('dp-day')) {
          this.trigger('date:click', new Date($target.attr('title')));
        }
      }.bind(this));
    },
    _renderMonth: function(options) {
      var date = new Date(options.month);
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

      while(date.getMonth() === options.month.getMonth()) {
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
      if(options.prepend) {
        $month.prependTo(this.$innerContainer);
        this.months.unshift({ date: new Date(options.month), $el: $month });
      } else {
        $month.appendTo(this.$innerContainer);
        this.months.push({ date: new Date(options.month), $el: $month });
      }
      // adjust calendar height to absolute positioned child
      this.$el.height(this.$innerContainer.height());


      return $month;
    },
    _getCell: function(date){
      return this.$el.find('.dp-day[title="' + date.toDateString() + '"]');
    },
  };

  $.fn.datepicker.Calendar = Calendar;

})(jQuery);
