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
