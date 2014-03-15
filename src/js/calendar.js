(function($){
  var templates = $.fn.datepicker.templates;

  function Calendar(options) {
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
      var $month = $(templates.month({ 
        month: date.toString('MMMM'), 
        year: year,
        daysOfWeek: $.fn.datepicker.daysOfWeek
      }));
      var $table = $month.find('.dp-month-table')
      var $week = $(templates.week);

      this.months.push([month, year]);

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

      // append empty cells after month's last day
      for(var i = date.addDays(-1).getDay() + 1; i <= 6; i++) {
        $week.append($.fn.datepicker.templates.emptyCell);
      }

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
