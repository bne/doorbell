var EVT_DOORBELL = 1;
var EVT_DOOROPEN = 2;
var DOOR_EVENT_WS_PORT = 9876;


var door_event = {
  init: function() {
    this.socket = new WebSocket('ws://' + document.location.hostname + ':' + DOOR_EVENT_WS_PORT);
    this.socket.onmessage = $.proxy(this.listen, this);
  },
  listen: function(evt) {
    if(EVT_DOORBELL & evt.data) {
      this.doorbell.start();
    }
    if(EVT_DOOROPEN & evt.data) {
      // TODO: stop doorbell if it started ringing when the door was closed
      this.doorbell.stop();
      this.door.open();
    }
  },
  doorbell: {
    start: function() {
      this.cancel();
      $('#doorbell_msg').show();
      this.timeout = window.setTimeout($.proxy(this.stop, this), 10000);
    },
    cancel: function() {
      if(typeof this.timeout == 'number') {
        window.clearTimeout(this.timeout);
        delete this.timeout;
      }
    },
    stop: function() {
      this.cancel();
      $('#doorbell_msg').hide();
    }
  },
  door: {
    open: function() {
      $('#door_msg').addClass('icon open');
    },
    close: function() {
      $('#door_msg').removeClass('icon open');
    }
  }
};

$(function() {
  door_event.init();

  /*

  USe background-size: cover; ?

  var bg_img = $('#bg_img');
  var ratio = 480 / 640;
  var max_stream_attempts = 10;
  var count_stream_attempts = 0;

  $(window).on('resize', function() {
    var w = $(window).width();
    var h = $(window).height();
    if(h / w > ratio) {
      bg_img.height(h);
      bg_img.width(h / ratio);
    }
    else {
      bg_img.width(w);
      bg_img.height(w * ratio);
    }
    bg_img.css('left', (w - bg_img.width())/2);
    bg_img.css('top', (h - bg_img.height())/2);
  });
  $(window).resize();

  $('.stream-toggle').on('click', function() {
    var lnk = $(this);
    var url = lnk.hasClass('off') ? '/image/stream/start' : '/image/stream/stop';
    $.get(url, function(data) {
      if(data == 'started') {
        lnk.removeClass('off');
        count_stream_attempts = 0;
        bg_img.attr('src', '/');
      }
      else {
        lnk.addClass('off');
        $(lnk).attr('title', 'Start camera stream');
      }
      console.log('stream ' + data);
    });
    return false;
  });

  bg_img.on('error', function() {
    return;
    bg_img.hide();
    if(count_stream_attempts > max_stream_attempts) {
      console.log('image stream could not be loaded');
      return;
    }
    count_stream_attempts++;
    setTimeout(function() {
      $.get('/image/stream/start');
      bg_img.attr('src', 'http://' + document.location.hostname + ':8070/?action=stream');
      $('.stream-toggle').attr('title', 'Stop camera stream');
      bg_img.show();
    }, 200);
  });

  $(window).on('unload', function() {
    $.get('/image/stream/stop');
  });

  */

});

