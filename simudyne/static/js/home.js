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
        var C_TO_NC_THRESH = agent.C_to_NC_thresh;
        var NC_TO_C_THRESH = agent.C_to_NC_thresh * simulation.brand_factor;

        var labels = Object.keys(simulation.states).map(function(year) {
            return parseInt(year) + agent.age;
        });
        var breeds = [], affinities = [], thresholds = [];

        var thresh;
        for(var state of Object.values(simulation.states)) {
            if(!breeds.length) thresh = null;
            else thresh = 100 * (breeds[breeds.length - 1] == 'C' ? C_TO_NC_THRESH : NC_TO_C_THRESH) / state.affinity;
            thresholds.push(thresh);
            breeds.push(state.breed);
            affinities.push(state.affinity);
        }

        new Chart(getCtx('one_agent_line_chart'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [/*{
                    type: 'line',
                    data: [{x: labels[0], y: 100}, {x: labels[labels.length - 1], y: 100}],
                    borderColor: 'rgba(0, 0, 0)',
					fill: false,
                    pointRadius: 0,
                    pointHitRadius: 0,
                    pointHoverRadius: 0,
                    borderWidth: 1,
                    borderDash: [10, 5],
                    yAxisID: 'affinity-axis'
                }, */{
                    type: 'line',
                    label: 'Breed',
                    // steppedLine: true,
                    data: breeds,
                    borderColor: 'red',
					fill: false,
                    pointRadius: 3,
                    pointHitRadius: 3,
                    pointHoverRadius: 3,
                    showLine: false,
                    borderWidth: 2,
                    yAxisID: 'breed-axis'
                }, {
                    label: 'Affinity',
                    data: thresholds,
                    backgroundColor: 'rgba(0, 0, 255, 0.3)',
                    borderColor: 'blue',
                    borderWidth: 1,
                    yAxisID: 'affinity-axis'
                },]
            },
            options: {
                legend: {
                    display: false,
                },
                tooltips: false,
                scales: {
                    xAxes: [{
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
                        display: true,
                        offset: true,
                        id: "affinity-axis",
                        position: "right",
                        scaleLabel: {
                            display: true,
                            labelString: 'Threshold / affinity (%)'
                        },
                        ticks: {
                            stepSize: 100,
                            max: Math.max(100, (Math.floor(Math.max(...thresholds) / 50) + 1) * 50),
                            min: 0,
                            callback: function(value, index, values) {
                                if(value != 100) return null;
                                return value;
                            },
                        },
                        gridLines: {
                            borderDash: [10, 5],
                            // drawOnChartArea: false,
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
                backgroundColor: 'transparent',
                borderColor: color,
                borderWidth: 1,
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
                    createDataset(data.C_lost, 'C lost', 'green'),
                    createDataset(data.C_gained, 'C gained', 'yellow'),
                    createDataset(data.C_regained, 'C regained', 'black'),
                ]
            },
            options,
        });
    }

    var currentGridYear = 0,
        maxGridYear = -1,
        gridSize = 0,
        perAgentSim = null;

    function createGrid(size, data) {
        var table = document.createElement('table');
        table.setAttribute('border', 1);
        var tr, td;
        for(var i = 0; i < size; i++) {
            tr = document.createElement('tr');
            for(var j = 0; j < size; j++) {
                td = document.createElement('td');
                td.className = data[i * size + j] || '';
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        return table;
    }

    function renderGrid(year) {
        var data = [];
        for(var key in perAgentSim.data) {
            data.push(perAgentSim.data[key][year].breed);
        }

        document.getElementById('grids').innerHTML = '';
        document.getElementById('grids').appendChild(createGrid(gridSize, data));
        document.getElementById('grid_year').innerHTML = 'Year ' + year;
    }

    function renderAllAsGrid(sim) {
        var agentIds = Object.keys(sim.data);
        var nbAgents = agentIds.length;
        maxGridYear = Object.keys(sim.data[agentIds[0]]).length - 1;
        gridSize = Math.ceil(Math.sqrt(nbAgents));
        perAgentSim = sim;
        renderGrid(0);
    }

    $('#grids_legend .tools .left').click(function() {
        var nbGrids = maxGridYear + 1;
        currentGridYear = (currentGridYear - 1 + nbGrids) % nbGrids;
        renderGrid(currentGridYear);
    });

    $('#grids_legend .tools .right').click(function() {
        var nbGrids = maxGridYear + 1;
        currentGridYear = (currentGridYear + 1 + nbGrids) % nbGrids;
        renderGrid(currentGridYear);
    });

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
        $.getJSON('/simulate?format=per_year&brand_factor=' + brandFactor, function(sim) {
            $('#simulate_all').show();
            renderAll(sim);
            $('#loader').hide();
        }).fail(function(jqXHR, textStatus, errorThrown) {
            displayFormError(form, jqXHR.responseJSON);
        });
        $.getJSON('/simulate?format=per_agent&brand_factor=' + brandFactor, function(sim) {
            $('#simulate_all').show();
            renderAllAsGrid(sim);
            $('#loader').hide();
        }).fail(function(jqXHR, textStatus, errorThrown) {
            displayFormError(form, jqXHR.responseJSON);
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
