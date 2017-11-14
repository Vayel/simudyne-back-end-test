import random
from .agent import BREED_C, BREED_NC


def step(agent):
    agent.age += 1
    if agent.auto_renew:
        return

    rand = random.random() * 3  # Get a random number in [0, 3[
    affinity = (agent.payment_at_purchase / agent.attribute_price +
                rand * agent.attribute_promotions * agent.inertia_for_switch)

    if agent.breed == BREED_C and affinity < agent.C_to_NC_thresh:
        agent.breed = BREED_NC
    elif agent.breed == BREED_NC and affinity < agent.NC_to_C_thresh:
        agent.breed = BREED_C

    return affinity


def simulate(agent, brand_factor, n_years):
    agent.NC_to_C_thresh = agent.social_grade * agent.attribute_brand * brand_factor
    states = {}
    states[agent.age] = (agent.breed, None)
    for _ in range(n_years):
        affinity = step(agent)
        states[agent.age] = (agent.breed, affinity)
    return states
