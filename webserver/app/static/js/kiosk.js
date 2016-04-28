
function updateClock() {
    var now = moment()

    $('#clock')
    .find('.time')
    .html(now.format('HH:mm:ss'))
    .end()
    .find('.day')
    .html(now.format('dddd'))
    .end()
    .find('.date')
    .html(now.format('Do MMMM YYYY'));

    setTimeout(updateClock, 1000);
}

$(function() {
    updateClock();
});