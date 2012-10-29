$(function() {
  var bgimg = $('#bgimg');  
  var ratio = 480 / 640;

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
    
  $('#stream-toggle').on('click', function() {
    var lnk = $(this);
    var url = lnk.hasClass('off') ? '/image/stream/start' : '/image/stream/stop';
    $.get(url, function(data) {
      if(data == 'started') {
        lnk.removeClass('off');
        bgimg.attr('src', '/');
      }
      else {
        $(lnk).html('Start camera stream');
        lnk.addClass('off');
      }
    });
    return false;
  });  
  
  bgimg.on('error', function() {
    $.get('/image/stream/start');
    bgimg.attr('src', 'http://' + document.location.hostname + ':8090/?action=stream');
    $('#stream-toggle').html('Stop camera stream');
  });
  
  $(window).on('unload', function() {
    $.get('/image/stream/stop');
  });
  
  var socket = new WebSocket('ws://' + document.location.hostname + ':8080');
  socket.onopen = function(){
      console.log('socket open');
  }
  socket.onmessage = function(msg){
      console.log(msg.data);
  }
  $('#socket-check').on('click', function(){
      socket.send('client says ' + (new Date()).getTime());
      return false;
  });
  
});

