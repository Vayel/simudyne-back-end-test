import random
from .agent import BREED_ENUM, REV_BREED_ENUM


def step(agent, brand_factor):
    agent.age += 1
    if agent.auto_renew:
        return

    rand = random.random() * 3  # Get a random number in [0, 3[
    affinity = (agent.payment_at_purchase / agent.attribute_price +
                rand * agent.attribute_promotions * agent.inertia_for_switch)

    if agent.breed == BREED_ENUM['C'] and affinity < agent.social_grade * agent.attribute_brand:
        agent.breed = BREED_ENUM['NC']
    elif agent.breed == BREED_ENUM['NC'] and affinity < agent.social_grade * agent.attribute_brand * brand_factor:
        agent.breed = BREED_ENUM['C']


def simulate(agent, brand_factor, n_years):
    states = {}
    states[agent.age] = REV_BREED_ENUM[agent.breed]
    for _ in range(n_years):
        step(agent, brand_factor)
        states[agent.age] = REV_BREED_ENUM[agent.breed]
    return states
