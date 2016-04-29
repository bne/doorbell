
function MotionDetector(options) {

    var video = document.getElementById('md-video');
    var canvas = document.getElementById('md-canvas');
    var context = canvas.getContext('2d');
    var width = video.width;
    var height = video.height;
    var bufidx = 0
    var buffers = [];

    this.init = function() {
        for(var i=0; i<2; i++) {
            buffers.push(new Uint8Array(width * height));
        }
        navigator.mediaDevices
        .getUserMedia({ video:true })
        .then(startStream);
    }

    startStream = function(stream) {
        video.src = window.URL.createObjectURL(stream);
        video.play();
        requestAnimationFrame(draw);
    }

    draw = function() {
        var frame = readFrame();
        if(frame) {
            markLightnessChanges(frame.data);
            context.putImageData(frame, 0, 0);
        }
        requestAnimationFrame(draw);
    }

    function readFrame() {
        try {
            context.drawImage(video, 0, 0, width, height);
        } catch (e) {
        // The video may not be ready, yet.
        return null;
        }

        return context.getImageData(0, 0, width, height);
    }

    function markLightnessChanges(data) {
        // Pick the next buffer (round-robin).
        var buffer = buffers[bufidx++ % buffers.length];
        var changed = false;

        for (var i = 0, j = 0; i < buffer.length; i++, j += 4) {
            // Determine lightness value.
            var current = lightnessValue(data[j], data[j + 1], data[j + 2]);

            // Set color to black.
            data[j] = data[j + 1] = data[j + 2] = 255;

            var hasChanged = lightnessHasChanged(i, current);
            if(hasChanged) {
                changed = true;
            }

            // Full opacity for changes.
            data[j + 3] = 255 * hasChanged;

            // Store current lightness value.
            buffer[i] = current;
        }

        return changed;
    }

    function lightnessHasChanged(index, value) {
        return buffers.some(function (buffer) {
            return Math.abs(value - buffer[index]) >= 15;
        });
    }

    function lightnessValue(r, g, b) {
        return (Math.min(r, g, b) + Math.max(r, g, b)) / 255 * 50;
    }
}

(function() {

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

        motionDetector = new MotionDetector();
        motionDetector.init();
    });

})();

