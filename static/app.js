$(function() {
  var bgimg = $('#bgimg');  
  var ratio = 480 / 640;

  function resize_bg() {
    var wndim = { 'w': $(window).width(), 'h': $(window).height() }
    if(wndim.h / wndim.w > ratio) {
      bgimg.height(wndim.h);
      bgimg.width(wndim.h / ratio);      
    }
    else {
      bgimg.width(wndim.w);
      bgimg.height(wndim.w * ratio);    
    }
    bgimg.css('left', (wndim.w - bgimg.width())/2);
    bgimg.css('top', (wndim.h - bgimg.width())/2);        
  }
  resize_bg();
  bgimg.on('load', resize_bg);
    
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
    bgimg.attr('src', 'http://localhost:8090/?action=stream');
    $('#stream-toggle').html('Stop camera stream');
  });
  
});

