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
