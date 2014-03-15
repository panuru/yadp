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
    destroy: function() {
      this.month = [];
      this.$el.addClass('dp-hidden');
      // quick & dirty hack - use timeout to avoid transitionend event
      setTimeout(function(){
        this.$el.remove();
        delete this.$el;
      }.bind(this), 200);
    },
    destroyMonth: function(month) {
      month.$el.remove();
      _.pull(this.months, month);
    }
  };

  $.fn.datepicker.Calendar = Calendar;

})(jQuery);
