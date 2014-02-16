var EVT_DOORBELL = 1;
var EVT_DOOROPEN = 2;
var DOOR_EVENT_WS_PORT = 9876;
var STREAM_PORT = 8070;
var STREAM_URL = '/?action=stream';
var STREAM_START_URL = '/camera/stream/start';
var STREAM_STOP_URL = '/camera/stream/stop';

function DoorEvent(start_event, end_event) {
  this.started = false;
  this.start_event = start_event;
  this.end_event = end_event;

  this.activate = function() {
    if(!this.started) {
      this.started = new Date();
      $(document).trigger(this.start_event);
    }

    if(!this.end_interval) {
      this.end_interval = window.setInterval($.proxy(function() {
        if(this.ended == this.latest) {
          $(document).trigger(this.end_event);
          window.clearInterval(this.end_interval);
          delete this.end_interval;
          delete this.started;
        }
        this.ended = this.latest;
      }, this), 200);
    }
    this.latest = new Date();    
  }
}

var door_listener = {
  init: function() {
    this.socket = new WebSocket(
      'ws://' + document.location.hostname + ':' + DOOR_EVENT_WS_PORT);
    this.socket.onmessage = $.proxy(this.listen, this);
    this.door = new DoorEvent('dooropen', 'doorclose');
    this.doorbell = new DoorEvent('doorbellpress', 'doorbellrelease');
    $('#doorbell_icon').hide();
    $('#door_icon').hide();
  },
  listen: function(evt) {
    if(EVT_DOORBELL & evt.data) {
      this.doorbell.activate();
    }
    if(EVT_DOOROPEN & evt.data) {
      this.door.activate();
    }
  }
};

var camera = {
  img_src: document.location.protocol + '//' + 
    document.location.hostname + ':' + STREAM_PORT + STREAM_URL,
  load_attempts: 0,
  max_load_attempts: 5,
  init: function() {
    $('<img/>').attr('src', this.img_src)
    .on('error', $.proxy(function() {
      if(this.load_attempts > this.max_load_attempts) {
        console.log('image stream could not be loaded');
        $(document).trigger('streamstop');
        this.load_attempts = 0;
        return;
      }
      this.load_attempts++;
      setTimeout($.proxy(this.init, this), 200);
    }, this))
    .load($.proxy(function() {
      $(document).trigger('streamstart', [this.img_src]);
    }, this));
  },
  start: function() {
    $.get(STREAM_START_URL);
    this.init();
  },
  stop: function() {
    $.get(STREAM_STOP_URL);
    $(document).trigger('streamstop');
  }
}

$(function() {
  door_listener.init();
  camera.init();

  var doorbell_msg_timeout = null;
  
  function hide_doorbell_msg() {
    if(typeof doorbell_msg_timeout == 'number') {
      window.clearTimeout(doorbell_msg_timeout);
      doorbell_msg_timeout = null;
    }
    $('#doorbell_msg').hide();
  }  

  $(document).on('doorbellpress', function() { 
    $('#doorbell_icon').show();
    $('#doorbell_msg').show();
    if(!doorbell_msg_timeout) {
      doorbell_msg_timeout = window.setTimeout(hide_doorbell_msg, 10000);
    }
  });

  $(document).on('doorbellrelease', function() { 
    $('#doorbell_icon').hide();
  });

  $(document).on('dooropen', function() { 
    $('#door_icon').show();
    hide_doorbell_msg();
  });

  $(document).on('doorclose', function() { 
    $('#door_icon').hide();
  });

  $(document).on('streamstop', function() {
    $('#camera_icon').hide();
    $('#toggle_stream_btn')
    .off('click')
    .on('click', $.proxy(camera.start, camera))
    .html('Start image stream');
  });

  $(document).on('streamstart', function(ev, img_src) {
    console.log(img_src)
    $('html').css('background-image', 'url('+ img_src +')');
    $('#camera_icon').show();
    $('#toggle_stream_btn')
    .off('click')
    .on('click', camera.stop)
    .html('Stop image stream');
  });



});

