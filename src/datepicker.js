console.log('html templates');
;
console.log('datepicker class');
;
(function($){
  $.fn.datepicker = function() {
    var date = new Date(this.val());
    console.log(date);
  }

})(jQuery);
