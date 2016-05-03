
(function() {

    var templates = {};

    /*
        ---------------------------------------------------------------------------------
        Clock
        ---------------------------------------------------------------------------------
    */

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
        .html(Mustache.render(templates['clock'], {
            time: lz(now.getHours()) +':'+ lz(now.getMinutes()),
            day: dayNames[now.getDay()],
            date: now.getDate() + nth(now.getDate()),
            month: monthNames[now.getMonth()],
            year: now.getFullYear()
        }));
        setTimeout(updateClock, 1000);
    }

    /*
        ---------------------------------------------------------------------------------
        Weather
        ---------------------------------------------------------------------------------
    */

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

    function updateWeather() {
        var url = config.OPEN_WEATHER_MAP_API_URL +
            '?id=' + config.OPEN_WEATHER_MAP_LOC +
            '&appid=' + config.OPEN_WEATHER_MAP_KEY +
            '&units=metric';

        $.get(url)
        .done(function(data) {
            $('#weather')
            .html(Mustache.render(templates['weather'], {
                temp: Math.round(data['main']['temp']),
                description: data['weather'][0]['description'],
                icon: weatherIcons[data['weather'][0]['icon']]
            }));
        });

        setTimeout(updateWeather, 1000 * 60);
    }

    /*
        ---------------------------------------------------------------------------------
        Motion Detector
        ---------------------------------------------------------------------------------
    */

    function motionDetector() {

        var video = $('#motion-detector video')[0];
        var canvas = $('#motion-detector canvas')[0];
        var context = canvas.getContext('2d');
        var width = video.width;
        var height = video.height;
        var bufidx = 0
        var buffers = [new Uint8Array(width * height), new Uint8Array(width * height)];

        function capture() {
            context.drawImage(video, 0, 0, width, height);
            var frame = context.getImageData(0, 0, width, height);
            var changedPixels = checkChanged(frame.data);
            if(changedPixels > 1000) {
                $(document).trigger('motionDetected', [canvas.toDataURL('image/png')]);
            }
            //context.putImageData(frame, 0, 0);
            setTimeout(capture, 1000);
        }

        function checkChanged(data) {
            var buffer = buffers[bufidx++ % buffers.length];
            var changedPixels = 0;
            for(var i=0, j=0; i<buffer.length; i++, j+=4) {
                var current = lightnessValue(data[j], data[j + 1], data[j + 2]);
                data[j] = data[j + 1] = data[j + 2] = 255;
                var hasChanged = lightnessHasChanged(i, current);
                if(hasChanged) {
                    changedPixels++;
                }
                data[j + 3] = 255 * hasChanged;
                buffer[i] = current;
            }
            return changedPixels;
        }

        function lightnessHasChanged(index, value) {
            return buffers.some(function (buffer) {
                return Math.abs(value - buffer[index]) >= 15;
            });
        }

        function lightnessValue(r, g, b) {
            return (Math.min(r, g, b) + Math.max(r, g, b)) / 255 * 50;
        }

        navigator
        .mediaDevices
        .getUserMedia({ video:true })
        .then(function(stream) {
            video.src = URL.createObjectURL(stream);
            capture();
        });
    }

    /*
        ---------------------------------------------------------------------------------
        Calendar
        ---------------------------------------------------------------------------------
    */

    function GoogleCalendar() {

        this.authorize = function(immediate) {
            var immediate = immediate || true;
            gapi.auth.authorize({
                'client_id': config.GOOGLE_API_CLIENT_ID,
                'scope': config.GOOGLE_API_SCOPES.join(' '),
                'immediate': immediate
            }, handleAuthResult);
        }

        function handleAuthResult(authResult) {
            if (authResult && !authResult.error) {
                gapi.client.load('calendar', 'v3', listUpcomingEvents);
            } else {
                $('#auth-google').show();
                console.log(authResult.error);
            }
        }

        function listUpcomingEvents() {
            gapi.client.calendar.events.list({
                'calendarId': config.GOOGLE_API_CALENDAR_ID,
                'timeMin': (new Date()).toISOString(),
                'showDeleted': false,
                'singleEvents': true,
                'maxResults': 10,
                'orderBy': 'startTime'
            })
            .execute(function(response) {
                if(!templates['calendar']) {
                    $.get('/static/templates/kiosk/calendar.mst', function(template) {
                        templates['calendar'] = template;
                        renderEvents(response);
                    });
                }
                else {
                    renderEvents(response);
                }
            });
        }

        function formatDate(s) {
            var d = new Date();
        }

        function renderEvents(response) {
            var runningDate = null;
            $('#calendar').html(Mustache.render(templates['calendar'], {
                items: response.items,
                dayHeading: function() {
                    return function(text, render) {
                        var currentDate = this.start.date;
                        if(!currentDate) {
                            currentDate = this.start.dateTime.substr(0,10);
                        }
                        if(runningDate != currentDate) {
                            runningDate = currentDate;
                            return '<li><strong>'+ runningDate +'</strong></li>';
                        }
                        return '';
                    }
                }
            }));
        }
    }

    window.googleCalendar = new GoogleCalendar();
    window.initCalendar = window.googleCalendar.authorize;

    $(function() {
        $.get('/static/templates/kiosk/clock.mst', function(template) {
            templates['clock'] = template;
            updateClock();
        });
        $.get('/static/templates/kiosk/weather.mst', function(template) {
            templates['weather'] = template;
            updateWeather();
        });

        //motionDetector();
        $(document).on('motionDetected', function(evt, image) {
            //console.log(image)
        });

        $('#auth-google').on('click', function(evt) {
            evt.preventDefault();
            window.googleCalendar.authorize(false);
        });
    });

})();

