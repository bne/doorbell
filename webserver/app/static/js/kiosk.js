
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
        Calendar
        ---------------------------------------------------------------------------------
    */

    var SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

      /**
       * Check if current user has authorized this application.
       */
      function checkAuth() {
        gapi.auth.authorize(
          {
            'client_id': CLIENT_ID,
            'scope': SCOPES,
            'immediate': true
          }, handleAuthResult);
      }
      /**
       * Handle response from authorization server.
       *
       * @param {Object} authResult Authorization result.
       */
      function handleAuthResult(authResult) {
        var authorizeDiv = document.getElementById('authorize-div');
        if (authResult && !authResult.error) {
          // Hide auth UI, then load client library.
          authorizeDiv.style.display = 'none';
          loadCalendarApi();
        } else {
          // Show auth UI, allowing the user to initiate authorization by
          // clicking authorize button.
          authorizeDiv.style.display = 'inline';
        }
      }
      /**
       * Load Google Calendar client library. List upcoming events
       * once client library is loaded.
       */
      function loadCalendarApi() {
        gapi.client.load('calendar', 'v3', listUpcomingEvents);
      }

      /**
       * Print the summary and start datetime/date of the next ten events in
       * the authorized user's calendar. If no events are found an
       * appropriate message is printed.
       */
      function listUpcomingEvents() {
        var request = gapi.client.calendar.events.list({
          'calendarId': CALENDAR_ID, /* Can be 'primary' or a given calendarid */
          'timeMin': (new Date()).toISOString(),
          'showDeleted': false,
          'singleEvents': true,
          'maxResults': 10,
          'orderBy': 'startTime'
        });

        request.execute(function(resp) {
          var events = resp.items;
          if (events.length > 0) {
            for (i = 0; i < events.length; i++) {
              var event = events[i];
              var when = event.start.dateTime;
              if (!when) {
                when = event.start.date;
              }
              console.log(event.summary + ' (' + when + ')')
            }
          } else {
            console.log('No upcoming events found.');
          }
        });
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



    $(function() {
        $.get('/static/templates/kiosk/clock.mst', function(template) {
            templates['clock'] = template;
            updateClock();
        });
        $.get('/static/templates/kiosk/weather.mst', function(template) {
            templates['weather'] = template;
            updateWeather();
        });

        motionDetector();
        $(document).on('motionDetected', function(evt, image) {
            //console.log(image)
        });

        //window.checkAuth = checkAuth;
    });

})();

