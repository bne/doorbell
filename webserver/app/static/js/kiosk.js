
(function() {

    var templates = {};

    /*
        ---------------------------------------------------------------------------------
        Clock
        ---------------------------------------------------------------------------------
    */

    function updateClock() {
        $('#clock').html(templates['clock']({ now: moment() }));
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
            if (data && data.main) {
                $('#weather')
                .html(templates['weather']({
                    temp: Math.round(data['main']['temp']),
                    description: data['weather'][0]['description'],
                    icon: weatherIcons[data['weather'][0]['icon']]
                }));
            } else {
                console.error(data)
            }
        });

        setTimeout(updateWeather, 1000 * 60);
    }

    /*
        ---------------------------------------------------------------------------------
        Calendar
        ---------------------------------------------------------------------------------
    */

    function GoogleCalendar() {

        this.authorize = function(immediate) {
            var options = {
                client_id: config.GOOGLE_API_CLIENT_ID,
                scope: config.GOOGLE_API_SCOPES.join(' '),
            }
            if (!immediate) {
                options['prompt'] = 'select_account';
                options['display'] = 'popup';
            } else {
                options['immediate'] = true;
            }
            gapi.auth.authorize(options, handleAuthResult);
        }

        function handleAuthResult(authResult) {
            if (authResult && !authResult.error) {
                gapi.client.load('calendar', 'v3', getEvents);
            } else {
                $('#auth-google').show();
                console.log(authResult);
            }
        }

        function getEvents() {
            gapi.client.calendar.events.list({
                'calendarId': config.GOOGLE_API_CALENDAR_ID,
                'timeMin': (new Date()).toISOString(),
                'showDeleted': false,
                'singleEvents': true,
                'maxResults': 10,
                'orderBy': 'startTime'
            })
            .execute(renderEvents);
        }

        function renderEvents(response) {
            var dayGroups = {};
            var runningDate = null;
            $.each(response.items, function(idx, item) {
                var currentDate = moment(item.start.date || item.start.dateTime.substr(0, 10)).valueOf();
                if(currentDate != runningDate) {
                    dayGroups[currentDate] = [];
                    runningDate = currentDate;
                }
                dayGroups[currentDate].push(item);
            });

            $('#calendar').html(templates['calendar']({
                days: Object.keys(dayGroups),
                dayGroups: dayGroups
            }));
        }
    }

    /*
        ---------------------------------------------------------------------------------
        Motion Detector
        ---------------------------------------------------------------------------------
    */

    function motionDetector() {

        var video = $('#motion-detector video')[0];
        var canvas = $('#motion-detector #buffer')[0];
        var context = canvas.getContext('2d');
        var width = video.width;
        var height = video.height;
        var bufidx = 0
        var buffers = [new Uint8Array(width * height), new Uint8Array(width * height)];

        function capture() {
            context.drawImage(video, 0, 0, width, height);
            var frame = context.getImageData(0, 0, width, height);
            var changedPixels = checkChanged(frame.data);
            if(changedPixels > 500) {
                $(document).trigger('motionDetected', [canvas.toDataURL('image/png')]);
            }
            context.putImageData(frame, 0, 0);
            if(window.motionDetect) {
                setTimeout(capture, 1000);
            }
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
            video.play();
            capture();
        });
    }

    function highlightFace(image, data) {
        var canvas = document.getElementById('face-highlight');
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        if(data.faces) {
            var img = new Image();
            img.onload = function() {
                context.drawImage(this, 0, 0, canvas.width, canvas.height);
                _.each(data.faces, function(path, i) {

                    context.beginPath();
                    context.rect(path[0], path[1], path[2], path[3]);
                    context.lineWidth = 1;
                    context.strokeStyle = 'red';
                    context.stroke();

                    var subject = data.subjects[i];
                    var user = data.users.find(function(user) { return user.id === subject[0] });
                    if (user) {
                        context.font = '10px sans-serif';
                        context.fillStyle = 'white';
                        context.fillText(user.name +' ['+ subject[1] +']', path[0], path[1]+10);
                    }
                });
            }
            img.src = image;
        }
    }

    function faceDetector(image) {
        $.post('/face-detector', { image: image }, 'json')
        .done(function(data) {
            var status = [];
            var training_user = data.users.find(function(user) { return user.training });

            if(training_user) {
                status.push('training '+ training_user.name);
            }
            if (config.DEBUG_FACE) {
                highlightFace(image, data);
            }
            _.each(data.faces, function(path, i) {
                var subject = data.subjects[i];
                var user = data.users.find(function(user) { return user.id === subject[0] });
                if (user) {
                    status.push(user.name +' ['+ subject[1] +']');
                }
            });

            $('#status').html(status.join('<br />'));
        })
        .error(function() {
            console.error(arguments);
            window.motionDetect = false;
        })
    }

    window.googleCalendar = new GoogleCalendar();
    window.initCalendar = function() { return window.googleCalendar.authorize(true); }

    window.motionDetect = true;

    $(function() {
        templates['clock'] = _.template($('#tmpl-clock').html());
        templates['weather'] = _.template($('#tmpl-weather').html());
        templates['calendar'] = _.template($('#tmpl-calendar').html());

        updateClock();
        updateWeather();

        if (config.DEBUG_FACE) {
            $('#motion-detector').show();
        }

        motionDetector();
        $(document).on('motionDetected', function(evt, image) {
            faceDetector(image);
        });

        $('#auth-google').on('click', function(evt) {
            evt.preventDefault();
            window.googleCalendar.authorize(false);
        });
    });

})();

