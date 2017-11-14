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

    function renderOne(id, simulation, agent) {
        var breeds = [], affinities = [], thresholds = [];
        var CToNCThresh = agent.C_to_NC_thresh;
        var NCToCThresh = agent.C_to_NC_thresh * simulation.brand_factor;

        for(var state of Object.values(simulation.states)) {
            if(!breeds.length) thresh = null;
            else thresh = (breeds[breeds.length - 1] == 'C' ? CToNCThresh : NCToCThresh);
            thresholds.push(thresh);
            breeds.push(state[0]);
            affinities.push(state[1]);
        }

        var ctx = document.getElementById('one_agent_chart').getContext('2d');
        ctx.width = parseInt($('#one_agent_chart').attr('width'));
        ctx.height= parseInt($('#one_agent_chart').attr('height'));

        var chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(simulation.states),
                datasets: [{
                    label: 'Affinity',
                    showLine: false,
                    data: affinities,
                    borderColor: 'blue',
					fill: false,
                    pointStyle: 'rectRot',
                    pointRadius: 5,
                    pointHitRadius: 5,
                    pointHoverRadius: 5,
                    yAxisID: 'affinity-axis'
                }, {
                    label: 'Threshold',
                    showLine: false,
                    data: thresholds,
                    borderColor: 'green',
					fill: false,
                    pointStyle: 'rectRot',
                    pointRadius: 5,
                    pointHitRadius: 5,
                    pointHoverRadius: 5,
                    pointBackgroundColor: 'gree',
                    yAxisID: 'affinity-axis'

                }, {
                    label: 'Breed',
                    steppedLine: true,
                    data: breeds,
                    borderColor: 'red',
					fill: false,
                    pointRadius: 0,
                    pointHitRadius: 0,
                    pointHoverRadius: 0,
                    yAxisID: 'breed-axis'
                },]
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
                        id: "breed-axis",
                        scaleLabel: {
                            display: true,
                            labelString: 'Breed'
                        }
                    }, {
                        type: 'linear',
                        display: true,
                        offset: true,
                        id: "affinity-axis",
                        position: "right",
                        scaleLabel: {
                            display: true,
                            labelString: 'Affinity'
                        },
                        gridLines: {
                            drawOnChartArea: false,
                        },
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

        $.getJSON(url, function(simulation) {
            url = '/agents/' + agentId;
            $.getJSON(url, function(agent) {
                renderAgent(agent);
                renderOne(agentId, simulation, agent);
            }).fail(function(jqXHR, textStatus, errorThrown) {
                displayFormError(form, jqXHR.responseJSON);
            });
        }).fail(function(jqXHR, textStatus, errorThrown) {
            displayFormError(form, jqXHR.responseJSON);
        });
    });
});
