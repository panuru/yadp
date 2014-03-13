(function($){
  $.fn.datepicker.daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  $.fn.datepicker.templates = {
    button: _.template('<span class="dp-control dp-collapsed"><%= value %></span>'),
    calendarContainer: '<div class="dp-calendar-container">Hello! I\'m a calendar (actually not, but I will be one day)</div>',
    month: _.template(
      '<section class="dp-month-container">' + 
      '  <h3><%= month %></h3>' + 
      '  <table class="dp-month">' + 
      '    <th class="dp-days-of-week"><% _.each($.fn.datepicker.daysOfWeek, function(day) { print("<td>" + day + "</td"); }) %></th>' +
      '  </table>' + 
      '</section>'),
    week: '<tr class="dp-week"></tr>',
    day: _.template('<td class="dp-day <% if(selected) { print("dp-selected"); } %>"><%= day %></td>'),
    emptyCell: '<td class="dp-day dp-empty"></td>'
  }
})(jQuery);
