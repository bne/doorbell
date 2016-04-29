
var weatherIcons = {
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
var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function lz(i) {
    var s = '0'+i;
    return s.substr(s.length-2);
}

function nth(d) {
  if(d>3 && d<21) { return 'th'; }
  switch (d % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
    }
}

function updateClock() {
    var now = new Date();
    $('#clock')
    .html(Mustache.render(window.templates['clock'], {
        time: lz(now.getHours()) +':'+ lz(now.getMinutes()),
        day: dayNames[now.getDay()],
        date: now.getDate() + nth(now.getDate()),
        month: monthNames[now.getMonth()],
        year: now.getFullYear()
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
        console.log(data)
        $('#weather')
        .html(Mustache.render(window.templates['weather'], {
            temp: Math.round(data['main']['temp']),
            description: data['weather'][0]['description'],
            icon: weatherIcons[data['weather'][0]['icon']]
        }));
    });

    setTimeout(updateWeather, 1000 * 60);
}

$(function() {
    window.templates = {};
    $.get('/static/templates/kiosk/clock.mst', function(template) {
        window.templates['clock'] = template;
        updateClock();
    });
    $.get('/static/templates/kiosk/weather.mst', function(template) {
        window.templates['weather'] = template;
        updateWeather();
    });
});
