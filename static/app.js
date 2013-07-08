var EVT_DOORBELL = 1;
var EVT_DOOROPEN = 2;
var DOOR_EVENT_WS_PORT = 9876;
var STREAM_URL = 'http://0.0.0.0:8070/?action=stream';

function DoorEvent(start_event, end_event) {
  this.started = false;
  this.start_event = start_event;
  this.end_event = end_event;

  this.activate = function() {
    if(!this.started) {
      $(document).trigger(this.start_event);
    }

    if(!this.end_interval) {
      this.started = new Date();
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
  init: function() {
    $('#camera_icon').hide();
    $('<img/>').attr('src', STREAM_URL).load(function() {
      $('html').css('background-image', 'url('+ this.src +')');
      $('#camera_icon').show();
    });
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

});

