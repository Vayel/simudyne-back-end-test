$(document).ready(function() {
    function cleanFormError(form) {
        $(form).find('.error').hide();
        $(form).find('.error').html('');
    }

    function displayFormError(form, msg) {
        $(form).find('.error').html(msg);
        $(form).find('.error').show();
        $('#loader').hide();
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

    function getCtx(id) {
        var ctx = document.getElementById(id).getContext('2d');
        ctx.width = parseInt($('#' + id).attr('width'));
        ctx.height= parseInt($('#' + id).attr('height'));
        return ctx;
    }

    function renderOne(id, simulation, agent) {
        var CToNCThresh = agent.C_to_NC_thresh;
        var NCToCThresh = agent.C_to_NC_thresh * simulation.brand_factor;

        var labels = Object.keys(simulation.states).map(function(year) {
            return parseInt(year) + agent.age;
        });
        var breeds = [], affinities = [], thresholds = [];

        for(var state of Object.values(simulation.states)) {
            breeds.push(state.breed);
            affinities.push(state.affinity);
        }

        new Chart(getCtx('one_agent_chart'), {
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
                }, thresholdLine(
                    'NC->C threshold',
                    labels[0],
                    labels[labels.length - 1],
                    NCToCThresh,
                    [15, 5]
                ), thresholdLine(
                    'C->NC threshold',
                    labels[0],
                    labels[labels.length - 1],
                    CToNCThresh,
                    [5, 5]
                ), {
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
                            labelString: 'Age'
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

    function renderAll(simulation) {
        var labels = Object.keys(simulation.data);
        var data = {C: [], NC: [], C_gained: [], C_lost: [], C_regained: []};

        for(var obj of Object.values(simulation.data)) {
            for(var key in obj) {
                data[key].push(obj[key].length);
            }
        }

        function createDataset(data, label, color) {
            return {
                label: label,
                data: data,
                borderColor: color,
                fill: false,
            };
        }

        var options = {
            tooltips: false,
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Year'
                    },
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Number of agents'
                    },
                }],
            },
        };

        new Chart(getCtx('breeds_chart'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    createDataset(data.C, 'C', 'red'),
                    createDataset(data.NC, 'NC', 'blue'),
                ]
            },
            options,
        });
        new Chart(getCtx('breed_changes_chart'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    createDataset(data.C_lost, 'C_lost', 'green'),
                    createDataset(data.C_gained, 'C_gained', 'yellow'),
                    createDataset(data.C_regained, 'C_regained', 'black'),
                ]
            },
            options,
        });
    }

    function simulateOne(id, brandFactor, form) {
        $.getJSON('/simulate/' + id + '?brand_factor=' + brandFactor, function(simulation) {
            $.getJSON('/agents/' + id, function(agent) {
                $('#simulate_one').show();
                renderAgent(agent);
                renderOne(id, simulation, agent);
                $('#loader').hide();
            }).fail(function(jqXHR, textStatus, errorThrown) {
                displayFormError(form, jqXHR.responseJSON);
            });
        }).fail(function(jqXHR, textStatus, errorThrown) {
            displayFormError(form, jqXHR.responseJSON);
        });
    }

    function simulateAll(brandFactor, form) {
        $.getJSON('/simulate?brand_factor=' + brandFactor, function(sim) {
            $('#simulate_all').show();
            renderAll(sim);
            $('#loader').hide();
        });
    }

    $('#simulate_form').submit(function(e) {
        e.preventDefault();
        cleanFormError(this);

        $('#simulate_one').hide();
        $('#simulate_all').hide();
        $('#loader').show();

        var agentId = $(this).find('[name="agent_id"]').val();
        var brandFactor = $(this).find('[name="brand_factor"]').val();

        if(agentId) return simulateOne(agentId, brandFactor, this);
        simulateAll(brandFactor, this);
    });
});
