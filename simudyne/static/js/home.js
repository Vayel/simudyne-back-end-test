$(document).ready(function() {
    function cleanFormErrors(form) {
        $(form).find('.errors').html('');
    }

    function displayFormError(form, msg) {
        $(form).find('.errors').append('<p>' + msg + '</p>');
    }

    function renderAgent(agent) {
        var table = $('#agent');
        for(var attr in agent) {
            table.find('[name="' + attr + '"]').html(agent[attr]);
        }
    }

    function renderOne(id, data) {
        var points = [];
        for(var date in data) {
            points.push({x: date, y: data[date]});
        }

        var ctx = document.getElementById('one_agent_chart').getContext('2d');
        ctx.width = parseInt($('#one_agent_chart').attr('width'));
        ctx.height= parseInt($('#one_agent_chart').attr('height'));

        var chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(data),
                datasets: [{
                    label: 'Agent ' + id,
                    steppedLine: true,
                    data: Object.values(data),
                    borderColor: 'red',
					fill: false,
                }]
            },
            options: {
                maintainAspectRatio: false,
                tooltips: false,
                scales: {
                    xAxes: [{
                        offset: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Year'
                        },
                    }],
                    yAxes: [{
                        type: 'category',
                        labels: ['C', 'NC'],
                        offset: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Breed'
                        }
                    }]
                }
            }
        });
    }

    $('#simulate_one_form').submit(function(e) {
        e.preventDefault();
        cleanFormErrors(this);

        var agentId = $(this).find('[name="agent_id"]').val();
        var brandFactor = $(this).find('[name="brand_factor"]').val();
        var url = '/simulate/' + agentId + '?brand_factor=' + brandFactor;
        var form = this;

        $.getJSON(url, function(data) {
            url = '/agents/' + agentId;
            $.getJSON(url, renderAgent);
            renderOne(agentId, data);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            displayFormError(form, jqXHR.responseJSON);
        });
    });
});
