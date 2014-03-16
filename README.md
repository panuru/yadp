Yet another date picker
====

## Usage

Create a datepicker on input element

    $element.datepicker({ dateFormat, firstDayOfWeek }<optional>)
    
Get or set selectedDate

    $element.datepicker('setDate', newDate);
    var date = $element.datepicker('getDate');
    
Destroy datepicker and release the input element

    $element.datepicker('destroy');
