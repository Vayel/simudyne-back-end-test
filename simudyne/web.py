from flask import Flask, jsonify, abort, request, render_template

from . import model, simulation
from .agent import BREED_C, BREED_NC

app = Flask(__name__)
model.connect('database.db')
N_YEARS = 15  # TODO: to put in config file
MIN_BRAND_FACTOR, MAX_BRAND_FACTOR = 0.1, 2.9 # TODO: config file

@app.route('/')
def home():
    return render_template('home.html')


@app.route('/agents/<id_>')
def get_agent(id_):
    agent = model.get_by_id(id_)
    if agent is None:
        abort(404)
    return jsonify(**agent.to_json())


def parse_brand_factor(val):
    try:
        val = float(val)
    except TypeError:
        raise ValueError('The brand_factor param must be a float.')
    if val < MIN_BRAND_FACTOR or val > MAX_BRAND_FACTOR:
        raise ValueError('The brand_factor must be in [{min}, {max}]'.format(
            min=MIN_BRAND_FACTOR,
            max=MAX_BRAND_FACTOR,
        ))
    return val


@app.route('/simulate/<id_>')
def simulate_one(id_):
    agent = model.get_by_id(id_)
    if agent is None:
        abort(404)

    try:
        brand_factor = parse_brand_factor(request.args.get('brand_factor'))
    except ValueError as e:
        abort(500, str(e))

    states = simulation.simulate(agent, brand_factor, N_YEARS)
    return jsonify(states)


@app.route('/simulate')
def simulate_all():
    try:
        brand_factor = parse_brand_factor(request.args.get('brand_factor'))
    except ValueError as e:
        abort(500, str(e))

    def create_year_resp():
        return {'C': [], 'NC': [], 'C_lost': [], 'C_gained': [], 'C_regained': []}

    resp = []
    agents = list(model.get_all())

    year_resp = create_year_resp()
    year_resp['C'] = [agent.id_ for agent in agents if agent.breed == BREED_C]
    year_resp['NC'] = [agent.id_ for agent in agents if agent.breed == BREED_NC]
    resp.append(year_resp)

    for _ in range(N_YEARS):
        year_resp = create_year_resp()
        for agent in agents:
            original_breed = agent.breed
            states = simulation.simulate(agent, brand_factor, 1)

            if agent.breed == BREED_NC:
                year_resp['NC'].append(agent.id_)

                if original_breed == BREED_C:
                    year_resp['C_lost'].append(agent.id_)
            else:
                year_resp['C'].append(agent.id_)

                if original_breed == BREED_NC:
                    year_resp['C_gained'].append(agent.id_)
                elif BREED_NC in states.values():
                    year_resp['C_regained'].append(agent.id_)
        resp.append(year_resp)

    return jsonify(resp)
