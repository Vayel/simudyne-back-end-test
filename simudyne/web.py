from flask import Flask, jsonify, request, render_template

from . import config, model, simulation
from .agent import BREED_C, BREED_NC

app = Flask(__name__)
model.connect(config.DB_PATH)

@app.route('/')
def home():
    return render_template('home.html', min_brand_factor=config.MIN_BRAND_FACTOR,
                           max_brand_factor=config.MAX_BRAND_FACTOR)


@app.route('/agents/<id_>')
def get_agent(id_):
    agent = model.get_by_id(id_)
    if agent is None:
        resp = jsonify('No agent with the id "{}" found.'.format(id_))
        resp.status_code = 404
        return resp
    return jsonify(**agent.to_json())


def parse_brand_factor(val):
    try:
        val = float(val)
    except TypeError:
        raise ValueError('The brand_factor param must be a float.')
    if val < config.MIN_BRAND_FACTOR or val > config.MAX_BRAND_FACTOR:
        raise ValueError('The brand_factor must be in [{min}, {max}]'.format(
            min=config.MIN_BRAND_FACTOR,
            max=config.MAX_BRAND_FACTOR,
        ))
    return val


@app.route('/simulate/<id_>')
def simulate_one(id_):
    agent = model.get_by_id(id_)
    if agent is None:
        resp = jsonify('No agent with the id "{}" found.'.format(id_))
        resp.status_code = 404
        return resp

    try:
        brand_factor = parse_brand_factor(request.args.get('brand_factor'))
    except ValueError as e:
        resp = jsonify(str(e))
        resp.status_code = 400
        return resp

    states = simulation.simulate(agent, brand_factor, config.N_SIMULATED_YEARS)
    return jsonify({
        'states': states,
        'agent_id': id_,
        'brand_factor': brand_factor,
    })


@app.route('/simulate')
def simulate_all():
    FORMATS = ('per_agent', 'per_year')

    try:
        brand_factor = parse_brand_factor(request.args.get('brand_factor'))
    except ValueError as e:
        resp = jsonify(str(e))
        resp.status_code = 400
        return resp

    format_ = request.args.get('format', FORMATS[0])
    if format_ not in FORMATS:
        resp = jsonify('Invalid format. Should be in ' + str(FORMATS))
        resp.status_code = 400
        return resp

    agents = list(model.get_all())
    simulations = simulation.simulate_all(agents, brand_factor, config.N_SIMULATED_YEARS)

    if format_ == 'per_agent':
        resp = simulations
    elif format_ == 'per_year':
        def create_year_resp():
            return {'C': [], 'NC': [], 'C_lost': [], 'C_gained': [], 'C_regained': []}

        # +1 because we include the original year
        resp = [create_year_resp() for _ in range(config.N_SIMULATED_YEARS + 1)]

        for agent_id, states in simulations.items():
            for i, state in enumerate(states):
                resp[i][state['breed']].append(agent_id)
                for key in ('C_lost', 'C_gained', 'C_regained'):
                    if state[key]:
                        resp[i][key].append(agent_id)

    return jsonify({
        'brand_factor': brand_factor,
        'data': resp
    })
