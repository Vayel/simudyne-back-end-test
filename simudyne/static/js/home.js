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

    function thresholdLine(label, x1, x2, y, dash) {
        return {
            label: label,
            data: [{x: x1, y: y}, {x: x2, y: y}],
            borderColor: 'black',
            borderDash: dash,
            borderWidth: 1,
            fill: false,
            pointRadius: 0,
            pointHitRadius: 0,
            pointHoverRadius: 0,
            yAxisID: 'affinity-axis'
        };
    }

    function renderOne(id, simulation, agent) {
        var CToNCThresh = agent.C_to_NC_thresh;
        var NCToCThresh = agent.C_to_NC_thresh * simulation.brand_factor;

        var labels = Object.keys(simulation.states);
        var breeds = [], affinities = [], thresholds = [];

        for(var state of Object.values(simulation.states)) {
            breeds.push(state[0]);
            affinities.push(state[1]);
        }

        var ctx = document.getElementById('one_agent_chart').getContext('2d');
        ctx.width = parseInt($('#one_agent_chart').attr('width'));
        ctx.height= parseInt($('#one_agent_chart').attr('height'));

        var NCToCThreshLine = thresholdLine(
            'NC->C threshold',
            labels[0],
            labels[labels.length - 1],
            NCToCThresh,
            [15, 5]
        );
        var CToNCThreshLine = thresholdLine(
            'C->NC threshold',
            labels[0],
            labels[labels.length - 1],
            CToNCThresh,
            [5, 5]
        );

        var chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Affinity',
                    showLine: false,
                    data: affinities,
                    borderColor: 'blue',
                    borderWidth: 1,
					fill: false,
                    pointStyle: 'rectRot',
                    pointRadius: 5,
                    pointHitRadius: 5,
                    pointHoverRadius: 5,
                    yAxisID: 'affinity-axis'
                },
                NCToCThreshLine, CToNCThreshLine,
                {
                    label: 'Breed',
                    steppedLine: true,
                    data: breeds,
                    borderColor: 'red',
					fill: false,
                    pointRadius: 0,
                    pointHitRadius: 0,
                    pointHoverRadius: 0,
                    yAxisID: 'breed-axis'
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
