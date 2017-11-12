from flask import Flask, jsonify, abort, request

from . import model, simulation

app = Flask(__name__)
model.connect('database.db')
N_YEARS = 15  # TODO: to put in config file
MIN_BRAND_FACTOR, MAX_BRAND_FACTOR = 0.1, 2.9 # TODO: config file

@app.route('/')
def home():
    return "Hello World!"


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
