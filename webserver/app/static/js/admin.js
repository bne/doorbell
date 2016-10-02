$(function() {

    var messages = MESSAGES || [];

    function displayMessages(_messages) {
        if(_messages) {
            messages = _messages;
        }
        if(messages.length) {
            $('#messages').html(messages.shift());
            setTimeout(displayMessages, 5000);
        }
        else {
            $('#messages').html('');
        }
    }

    if(messages) {
        displayMessages();
    }

    $('#menu-toggle').on('click', function(evt) {
        evt.preventDefault();
        $('#wrapper').toggleClass('toggled');
    });

    /*
        User
    */

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
    });

    $('#clear-train').on('click', function(evt) {
        if (confirm('Are you absolutely definitely 100% sure you want to clear the training data?')) {
            $.post('/admin/train/clear')
            .success(function(data) {
                displayMessages(data.messages);
            })
            .error(function() {
                displayMessages(data.messages);
            });
        }
    });

});