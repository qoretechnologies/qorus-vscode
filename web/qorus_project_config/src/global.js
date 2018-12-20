export let texts = {};

export function setInputs(name, url = undefined) {
    $('#name').val(name);
    $('#url').val(url);
}

export function setRemovedName(name) {
    $('#confirm_remove_name').html(name);
}

$('#edit_config_modal').on('shown.bs.modal', function(event) {
    var caller = $(event.relatedTarget);
    var action = caller.data('action');
    if (['add-env', 'edit-env', 'edit-qorus'].includes(action)) {
        $('#form_group_url').hide();
    }
    else {
        $('#form_group_url').show();
    }
    if (['edit-main-url'].includes(action)) {
        $('#form_group_name').hide();
        $('#url').trigger('focus');
    }
    else {
        $('#form_group_name').show();
        $('#name').trigger('focus');
    }
    $('#action').val(action);
    $('#edit_config_text').html(caller.data('text'));
    $('#env_id').val(caller.data('env-id'));
    $('#qorus_id').val(caller.data('qorus-id'));
    $('#url_id').val(caller.data('url-id'));
});

$('#remove_config_modal').on('shown.bs.modal', function(event) {
    var caller = $(event.relatedTarget);
    $('#confirm_remove_text_1').html(caller.data('text-1'));
    $('#confirm_remove_text_2').html(caller.data('text-2'));
    $('#action').val(caller.data('action'));
    $('#env_id').val(caller.data('env-id'));
    $('#qorus_id').val(caller.data('qorus-id'));
    $('#url_id').val(caller.data('url-id'));
});

$('.form-control').focus(function() {
    $(this).removeClass('bg-warning').removeAttr('placeholder');
});
