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
