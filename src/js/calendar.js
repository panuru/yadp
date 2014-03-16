(function($){
  "use strict";

  var templates = $.fn.datepicker.templates;

  function Calendar(options) {
    this.options = options;
    this.date = new Date(options.date);
    this._callbacks = {};
  }

  Calendar.prototype = {
    render: function(options){
      this.$el = $(templates.calendarContainer).insertAfter(options.after);
      this.$innerContainer = this.$el.find('.dp-calendar-container-inner');

      // render previous month first
      var month = new Date(this.date).moveToFirstDayOfMonth().addMonths(-1);
      this._firstMonth = new Date(month);
      var $month = this._renderMonth({ month: month }); 

      // when the first month is in DOM, get its width and calculate total
      // amount of months visible
      this._monthWidth = $month.outerWidth();
      this._containerWidth = this.$el.width();
      var monthsCount = Math.ceil(this._containerWidth / this._monthWidth);
      _(monthsCount - 1).times(function() {
        this._renderMonth({ month: month.addMonths(1) });
      }.bind(this));
      this._lastMonth = new Date(month);

      this._bindEvents();

      fadeIn(this.$el);
    },
    select: function(date) {
      this._getCell(this.date).removeClass('dp-selected');
      this._getCell(date).addClass('dp-selected');
      this.date = date;
    },
    remove: function() {
      fadeOut(this.$el, function(){
        this.$el.remove();
        delete this.$el;
      }.bind(this));
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
      this.$innerContainer.pep({ 
        axis: 'x',
        useCSSTranslation: false,
        drag: _.throttle(this._addMoreMonths.bind(this), 200),
        rest: this._addMoreMonths.bind(this)
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
      } else {
        $month.appendTo(this.$innerContainer);
      }
      fadeIn($month);

      // adjust calendar height to absolute positioned inner container
      this.$el.height(this.$innerContainer.height());

      return $month;
    },
    _addMoreMonths: function() {
      var left = this.$innerContainer.position().left;
      var monthsCount, month;
      if(left > 0) {
        monthsCount = Math.ceil(left / this._monthWidth);

        // $.pep adds css transition to 'left' property, here is a workaround
        var transition = this.$innerContainer.css('transition');
        this.$innerContainer.css({ 'transition': 'none', 'webkit-transition': 'none' });
        this.$innerContainer.css({ left: left - this._monthWidth * monthsCount });
        
        _(monthsCount).times(function() {
          this._renderMonth({ month: this._firstMonth.addMonths(-1), prepend: true });
        }.bind(this));

        this.$innerContainer.css({ 'transition': transition, 'webkit-transition': transition });
      } 
      else {
        var right = this.$el.width() - (left + this.$innerContainer.width());
        if(right > 0) {
          monthsCount = Math.ceil(right / this._monthWidth);
          _(monthsCount).times(function() {
            this._renderMonth({ month: this._lastMonth.addMonths(1) });
          }.bind(this));
        }
      }
    },
    _getCell: function(date){
      return this.$el.find('.dp-day[title="' + date.toDateString() + '"]');
    },
  };

  // css transition hacks
  function fadeIn($el, callback) {
    setTimeout(function (){
      $el.removeClass('dp-hidden').one('transitionend oTransitionEnd webkitTransitionEnd', callback);
    }, 0);
  }
  function fadeOut($el, callback) {
    $el.addClass('dp-hidden').one('transitionend oTransitionEnd webkitTransitionEnd', callback);
  }

  $.fn.datepicker.Calendar = Calendar;

})(jQuery);
