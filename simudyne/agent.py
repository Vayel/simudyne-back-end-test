from enum import Enum


BREED_C, BREED_NC = 'C', 'NC'

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

    def __str__(self):
        return ('Agent(breed={breed}, id={id}, age={age}, social_grade={social_grade}, '
                'payment_at_purchase={payment_at_purchase}, attribute_brand={attribute_brand}, '
                'attribute_price={attribute_price}, attribute_promotions={attribute_promotions}, '
                'auto_renew={auto_renew}, inertia_for_switch={inertia_for_switch})'
                .format(**self.to_json()))

    def to_json(self):
        return dict(
            breed=self.breed,
            id=self.id_,
            age=self.age,
            social_grade=self.social_grade,
            payment_at_purchase=self.payment_at_purchase,
            attribute_brand=self.attribute_brand,
            attribute_price=self.attribute_price,
            attribute_promotions=self.attribute_promotions,
            auto_renew=self.auto_renew,
            inertia_for_switch=self.inertia_for_switch,
        )
