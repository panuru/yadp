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
