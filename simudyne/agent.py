import random
from enum import Enum


class Breed(Enum):
    C = 1
    NC = 2


class Agent:
    def __init__(self, breed, id_, age, social_grade, payment_at_purchase,
                 attribute_brand, attribute_price, attribute_promotions,
                 auto_renew, inertia_for_switch):
        self.breed = breed
        self.id_ = id_
        self.age = age
        self.social_grade = social_grade
        self.payment_at_purchase = payment_at_purchase
        self.attribute_brand = attribute_brand
        self.attribute_price = attribute_price
        self.attribute_promotions = attribute_promotions
        self.auto_renew = auto_renew
        self.inertia_for_switch = inertia_for_switch

    def step(self, brand_factor):
        self.age += 1
        if self.auto_renew:
            return

        rand = random.random() * 3  # Get a random number in [0, 3[
        affinity = (self.payment_at_purchase / self.attribute_price +
                    rand * self.attribute_promotions * self.inertia_for_switch)

        if self.breed == Breed.C and affinity < self.social_grade * self.attribute_brand:
            self.breed = Breed.NC
        elif self.breed == Breed.NC and affinity < self.social_grade * self.attribute_brand * brand_factor:
            self.breed = Breed.C
