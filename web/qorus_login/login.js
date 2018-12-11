const vscode = acquireVsCodeApi();

$('.submit_on_enter').keypress(function(event) {
    if (event.which == 13) {
        $('form#login').submit();
        return false;
    }
});

$('form#login').submit(function(event) {
    vscode.postMessage({
        command: 'ok',
        username: $('#username').val(),
        password: $('#password').val()
    });
    return false;
});

$('#cancel').click(function() {
    vscode.postMessage({
        command: 'cancel'
    });
    return false;
});

$('#username').on('input', function() {
    vscode.setState({username: $(this).val()});
});

$('#username').val(function() {
    let state = vscode.getState();
    return state ? state.username : '';
});
