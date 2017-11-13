$(document).ready(function() {
    function cleanFormErrors(form) {
        $(form).find('.errors').html('');
    }

    function displayFormError(form, msg) {
        $(form).find('.errors').append('<p>' + msg + '</p>');
    }

    function renderOne(data) {
        alert(data);
    }

    $('#simulate_one_form').submit(function(e) {
        e.preventDefault();
        cleanFormErrors(this);

        var agentId = $(this).find('[name="agent_id"]').val();
        var brandFactor = $(this).find('[name="brand_factor"]').val();
        var url = '/simulate/' + agentId + '?brand_factor=' + brandFactor;
        var form = this;

        $.getJSON(url, renderOne)
         .fail(function(jqXHR, textStatus, errorThrown) {
             displayFormError(form, jqXHR.responseJSON);
         });
    });
});
