$(function() {

    function displayMessages(messages) {
        $('#messages').html('');
        $.each(messages, function(idx, message) {
            $('#messages')
            .append('<li>'+ message +'</li>');
        });
    }

    $('#menu-toggle').on('click', function(evt) {
        evt.preventDefault();
        $('#wrapper').toggleClass('toggled');
    });

    $('.toggle-training').on('click', function(evt) {
        var user = $(evt.currentTarget).data('user');
        var icon = $(evt.currentTarget).find('span');
        var action = icon.hasClass('glyphicon-stop') ? 'stop' : 'start';

        $('.toggle-training span')
        .removeClass('glyphicon-stop')
        .addClass('glyphicon-play');

        if(action == 'start') {
            icon.addClass('glyphicon-stop');
            icon.removeClass('glyphicon-play');
        }

        $.post('/admin/train', { action: action, user: user })
        .success(function(data) {
            displayMessages(data.messages);
        })
        .error(function() {
            displayMessages(data.messages);
        });
    })
});