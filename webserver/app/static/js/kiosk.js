
var weather_icon_map = {
    '01d': 'wi-day-sunny',        '01n': 'wi-night-clear', //clear sky
    '02d': 'wi-day-cloudy-high',  '02n': 'wi-night-cloudy-high', //few clouds
    '03d': 'wi-day-cloudy',       '03n': 'wi-night-alt-cloudy', //scattered clouds
    '04d': 'wi-day-cloudy',       '04n': 'wi-night-alt-cloudy', //broken clouds
    '09d': 'wi-day-showers',      '09n': 'wi-night-alt-showers', //shower rain
    '10d': 'wi-day-rain',         '10n': 'wi-night-alt-rain', //rain
    '11d': 'wi-day-thunderstorm', '11n': 'wi-night-alt-thunderstorm', //thunderstorm
    '13d': 'wi-day-snow',         '13n': 'wi-night-alt-snow', //snow
    '50d': 'wi-day-haze',         '50n': 'wi-night-fog' //mist
}

function updateClock() {
    $('#clock')
    .html(window.templates['clock']({
        now: moment()
    }));
    setTimeout(updateClock, 1000);
}

function updateWeather() {
    var url = config.OPEN_WEATHER_MAP_API_URL +
        '?id=' + config.OPEN_WEATHER_MAP_LOC +
        '&appid=' + config.OPEN_WEATHER_MAP_KEY +
        '&units=metric';

    $.get(url)
    .done(function(data) {
        $('#weather')
        .html(window.templates['weather']({
            temp: Math.round(data['main']['temp']),
            description: data['weather'][0]['description'],
            icon: weather_icon_map[data['weather'][0]['icon']]
        }));
    });

    setTimeout(updateWeather, 1000 * 60);
}

$(function() {
    window.templates = {
        clock: _.template($('#tmpl-clock').html()),
        weather: _.template($('#tmpl-weather').html())
    }
    updateClock();
    updateWeather();
});
