from flask import Flask, jsonify, abort

from . import model

app = Flask(__name__)
model.connect('database.db')

@app.route('/')
def home():
    return "Hello World!"


@app.route('/agents/<id_>')
def get_agent(id_):
    agent = model.get_by_id(id_)
    if agent is None:
        abort(404)
    return jsonify(**agent.to_json())
