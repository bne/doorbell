
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
            if (data && data.list) {
                var forecast = data.list.slice(0, 5).map(function(item) {
                    return {
                        temp: Math.round(item['main']['temp']),
                        description: item['weather'][0]['description'],
                        icon: weatherIcons[item['weather'][0]['icon']]
                    }
                });

                $('#weather')
                .html(templates['weather']({forecast}));
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
            gapi.client.init({
                apiKey: config.GOOGLE_API_KEY,
                client_id: config.GOOGLE_API_CLIENT_ID,
                discoveryDocs: config.GOOGLE_API_DISCOVERY_DOCS,
                scope: config.GOOGLE_API_SCOPES,
            }).then(function () {
                var auth = gapi.auth2.getAuthInstance();
                auth.isSignedIn.listen(window.googleCalendar.handleAuthResult);
                window.googleCalendar.handleAuthResult(auth.isSignedIn.get());
            });
        }

        this.handleAuthClick = function() {
            gapi.auth2.getAuthInstance().signIn();
        }

        this.handleAuthResult = function(isSignedIn) {
            if (isSignedIn) {
                gapi.client.load('calendar', 'v3', getEvents);
            } else {
                $('#auth-google').show();
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

    window.googleCalendar = new GoogleCalendar();
    window.initCalendar = function() { gapi.load('client:auth2', window.googleCalendar.authorize(true)); }

    $(function() {
        templates['clock'] = _.template($('#tmpl-clock').html());
        templates['weather'] = _.template($('#tmpl-weather').html());
        templates['calendar'] = _.template($('#tmpl-calendar').html());

        updateClock();
        updateWeather();

        $('#auth-google').on('click', window.googleCalendar.handleAuthClick);
    });

})();

