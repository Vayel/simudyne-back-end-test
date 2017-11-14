import random
from .agent import BREED_C, BREED_NC

random.seed()


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
    states = [{
        'breed': agent.breed,
        'affinity': None,
        'C_lost': False,
        'C_gained': False,
        'C_regained': False,
    }]
    switched_to_NC = False

    for _ in range(n_years):
        affinity = step(agent)
        previous_state = states[-1]

        if previous_state['breed'] == BREED_C and agent.breed == BREED_NC:
            switched_to_NC = True

        states.append({
            'breed': agent.breed,
            'affinity': affinity,
            'C_lost': agent.breed == BREED_NC and previous_state['breed'] == BREED_C,
            'C_gained': agent.breed == BREED_C and previous_state['breed'] == BREED_NC,
            'C_regained': agent.breed == BREED_C and switched_to_NC,
        })

    return states
