var EVT_DOORBELL = 1;
var EVT_DOOROPEN = 2;
var DOOR_EVENT_WS_PORT = 9876;


var door_event = {
  init: function() {
    this.socket = new WebSocket('ws://' + document.location.hostname + ':' + DOOR_EVENT_WS_PORT);
    this.socket.onmessage = $.proxy(this.listen, this);
    $('#doorbell_icon').hide();
    $('#door_icon').hide();
  },
  listen: function(evt) {
    if(EVT_DOORBELL & evt.data) {
      this.doorbell.start();
    }
    if(EVT_DOOROPEN & evt.data) {
      this.doorbell.hide_msg();
      this.door.open();
    }
  },
  doorbell: {
    start: function() {
      $('#doorbell_msg').show();
      $('#doorbell_icon').show();
      if(!this.msg_timeout) {
        this.msg_timeout = window.setTimeout($.proxy(this.hide_msg, this), 10000);
      }
      if(!this.end_interval) {
        this.started = new Date();
        this.end_interval = window.setInterval($.proxy(function() {
          if(this.ended == this.latest) {
            this.stop();
            window.clearInterval(this.end_interval);
            delete this.end_interval;
          }
          this.ended = this.latest;
        }, this), 100);
      }
      this.latest = new Date();
    },
    stop: function() {
      $('#doorbell_icon').hide();
    },
    hide_msg: function() {
      if(typeof this.msg_timeout == 'number') {
        window.clearTimeout(this.msg_timeout);
        delete this.msg_timeout;
      }
      $('#doorbell_msg').hide();
    }
  },
  door: {
    open: function() {
      $('#door_icon').show();
      this.opened = new Date();
    },
    close: function() {
    }
  }
};

var camera = {
  init: function() {
    $('#camera_icon').hide();
  }
}

$(function() {
  door_event.init();
  camera.init();

  /*

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

