$(document).ready(function() {
    function cleanFormError(form) {
        $(form).find('.error').hide();
        $(form).find('.error').html('');
    }

    function displayFormError(form, msg) {
        $(form).find('.error').html(msg);
        $(form).find('.error').show();
    }

    function hideResults() {
        $('#simulate_one').hide();
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

    function simulateOne(id, brandFactor, form) {
        $.getJSON('/simulate/' + id + '?brand_factor=' + brandFactor, function(simulation) {
            $.getJSON('/agents/' + id, function(agent) {
                $('#simulate_one').show();
                renderAgent(agent);
                renderOne(id, simulation, agent);
            }).fail(function(jqXHR, textStatus, errorThrown) {
                displayFormError(form, jqXHR.responseJSON);
            });
        }).fail(function(jqXHR, textStatus, errorThrown) {
            displayFormError(form, jqXHR.responseJSON);
        });
    }

    $('#simulate_form').submit(function(e) {
        e.preventDefault();
        cleanFormError(this);
        hideResults();

        var agentId = $(this).find('[name="agent_id"]').val();
        var brandFactor = $(this).find('[name="brand_factor"]').val();

        if(agentId) simulateOne(agentId, brandFactor, this);
    });
});
