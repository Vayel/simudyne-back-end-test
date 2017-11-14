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

    states = simulation.simulate(agent, brand_factor, config.N_YEARS)
    return jsonify({
        'states': states,
        'agent_id': id_,
        'brand_factor': brand_factor,
    })


@app.route('/simulate')
def simulate_all():
    try:
        brand_factor = parse_brand_factor(request.args.get('brand_factor'))
    except ValueError as e:
        resp = jsonify(str(e))
        resp.status_code = 400
        return resp

    def create_year_resp():
        return {'C': [], 'NC': [], 'C_lost': [], 'C_gained': [], 'C_regained': []}

    resp = []
    agents = list(model.get_all())

    year_resp = create_year_resp()
    year_resp['C'] = [agent.id_ for agent in agents if agent.breed == BREED_C]
    year_resp['NC'] = [agent.id_ for agent in agents if agent.breed == BREED_NC]
    resp = [year_resp, *[create_year_resp() for _ in range(config.N_YEARS)]]

    for agent in agents:
        original_age = agent.age
        switched_to_NC = False
        states = simulation.simulate(agent, brand_factor, config.N_YEARS)

        for i in range(1, config.N_YEARS+1):
            previous_breed = states[original_age + i - 1][0]
            breed = states[original_age + i][0]

            if breed == BREED_NC:
                resp[i]['NC'].append(agent.id_)

                if previous_breed == BREED_C:
                    resp[i]['C_lost'].append(agent.id_)
                    switched_to_NC = True
            # Do not use else keyword to make it easier to add new breeds
            elif breed == BREED_C:
                resp[i]['C'].append(agent.id_)

                if previous_breed == BREED_NC:
                    resp[i]['C_gained'].append(agent.id_)
                if switched_to_NC:
                    resp[i]['C_regained'].append(agent.id_)

    return jsonify({
        'brand_factor': brand_factor,
        'data': resp
    })
