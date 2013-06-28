var EVT_DOORBELL = 1;
var EVT_DOOROPEN = 2;

$(function() {

  var socket = new WebSocket('ws://' + document.location.hostname + ':9876');
  var doorbell_msg_to = null;

  socket.onmessage = function(evt){
    console.log(evt.data);

    if(EVT_DOORBELL & evt.data) {
      $('#doorbell_msg').show();
      if(!doorbell_msg_to) {
        console.log('foo')
        doorbell_msg_to = window.setTimeout(function() {
          $('#doorbell_msg').hide();
        }, 10000);
      }
    }

    if(EVT_DOOROPEN & evt.data) {
      $('#doorbell_msg').hide();
    }
  }

  socket.onopen = function(){
    console.log('socket open');
  }
  socket.onerror = function(evt) {
    console.log(evt);
  }
  socket.onclose = function() {
    console.log('socket closed');
  }

  /*
  var bgimg = $('#bgimg');
  var ratio = 480 / 640;
  var max_stream_attempts = 10;
  var count_stream_attempts = 0;

  $(window).on('resize', function() {
    var w = $(window).width();
    var h = $(window).height();
    if(h / w > ratio) {
      bgimg.height(h);
      bgimg.width(h / ratio);
    }
    else {
      bgimg.width(w);
      bgimg.height(w * ratio);
    }
    bgimg.css('left', (w - bgimg.width())/2);
    bgimg.css('top', (h - bgimg.height())/2);
  });
  $(window).resize();

  $('.stream-toggle').on('click', function() {
    var lnk = $(this);
    var url = lnk.hasClass('off') ? '/image/stream/start' : '/image/stream/stop';
    $.get(url, function(data) {
      if(data == 'started') {
        lnk.removeClass('off');
        count_stream_attempts = 0;
        bgimg.attr('src', '/');
      }
      else {
        lnk.addClass('off');
        $(lnk).attr('title', 'Start camera stream');
      }
      console.log('stream ' + data);
    });
    return false;
  });

  bgimg.on('error', function() {
    return;
    bgimg.hide();
    if(count_stream_attempts > max_stream_attempts) {
      console.log('image stream could not be loaded');
      return;
    }
    count_stream_attempts++;
    setTimeout(function() {
      $.get('/image/stream/start');
      bgimg.attr('src', 'http://' + document.location.hostname + ':8070/?action=stream');
      $('.stream-toggle').attr('title', 'Stop camera stream');
      bgimg.show();
    }, 200);
  });

  $(window).on('unload', function() {
    $.get('/image/stream/stop');
  });

  */

});

