import random
from .agent import BREED_C, BREED_NC


def step(agent, brand_factor):
    agent.age += 1
    if agent.auto_renew:
        return

    rand = random.random() * 3  # Get a random number in [0, 3[
    affinity = (agent.payment_at_purchase / agent.attribute_price +
                rand * agent.attribute_promotions * agent.inertia_for_switch)

    if agent.breed == BREED_C and affinity < agent.social_grade * agent.attribute_brand:
        agent.breed = BREED_NC
    elif agent.breed == BREED_NC and affinity < agent.social_grade * agent.attribute_brand * brand_factor:
        agent.breed = BREED_C


def simulate(agent, brand_factor, n_years):
    states = {}
    states[agent.age] = agent.breed
    for _ in range(n_years):
        step(agent, brand_factor)
        states[agent.age] = agent.breed
    return states
