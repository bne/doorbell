
function updateClock() {
    var now = moment()

    $('#clock')
    .find('.time')
    .html(now.format('HH:mm'))
    .end()
    .find('.day')
    .html(now.format('dddd'))
    .end()
    .find('.date')
    .find('.d')
    .html(now.format('Do'))
    .end()
    .find('.m')
    .html(now.format('MMMM'))
    .end()
    .find('.y')
    .html(now.format('YYYY'));

    setTimeout(updateClock, 1000);
}

var weather_icon_map = {
    '01d': 'wi-day-sunny', //clear sky
    '01n': 'wi-night-clear',
    '02d': 'wi-day-cloudy-high', //few clouds
    '02n': 'wi-night-cloudy-high',
    '03d': 'wi-day-cloudy', //scattered clouds
    '03n': 'wi-night-alt-cloudy',
    '04d': 'wi-day-cloudy', //broken clouds
    '04n': 'wi-night-alt-cloudy',
    '09d': 'wi-day-showers', //shower rain
    '09n': 'wi-night-alt-showers',
    '10d': 'wi-day-rain', //rain
    '10n': 'wi-night-alt-rain',
    '11d': 'wi-day-thunderstorm', //thunderstorm
    '11n': 'wi-night-alt-thunderstorm',
    '13d': 'wi-day-snow', //snow
    '13n': 'wi-night-alt-snow',
    '50d': 'wi-day-haze', //mist
    '50n': 'wi-night-fog'
}

function updateWeather() {
    var url = 'http://api.openweathermap.org/data/2.5/weather?id=' +
        config.OPEN_WEATHER_MAP_LOC +
        '&appid=' +
        config.OPEN_WEATHER_MAP_KEY +
        '&units=metric';

    $.get(url)
    .done(function(data) {
        var icon = data['weather'][0]['icon'];
        var description = data['weather'][0]['description'];
        var temp = data['main']['temp'];

        $('#weather .current')
        .find('.temp')
        .html(Math.round(temp) + '&deg;C')
        .end()
        .find('.description')
        .html(description)
        .end()
        .find('.icon')
        .html('<i class="wi '+ weather_icon_map[icon] +'"></i>');
    });

    setTimeout(updateClock, 1000 * 60 * 60);
}

$(function() {
    updateClock();
    updateWeather();
});
