import pickle

import numpy as np
import torch
import torch.utils.data
from torch.utils.data.sampler import SubsetRandomSampler
import torch.nn as nn
from torch.autograd import Variable

from . import config
from .agent import BREED_C
from .model import get_all
from .simulation import simulate


Model = nn.Sequential


def agent_to_tensor(agent, brand_factor):
    return torch.FloatTensor([
        agent.breed == BREED_C,
        agent.social_grade,
        agent.payment_at_purchase,
        agent.attribute_brand,
        agent.attribute_price,
        agent.attribute_promotions,
        agent.auto_renew,
        agent.inertia_for_switch,
        brand_factor,
        agent.social_grade * agent.attribute_brand,
        agent.social_grade * agent.attribute_brand * brand_factor,
    ])


def build_dataset():
    agents = list(get_all())
    brand_factor_step = 0.1
    brand_factors = np.arange(
        config.MIN_BRAND_FACTOR,
        config.MAX_BRAND_FACTOR + brand_factor_step,
        brand_factor_step
    )
    tensor_x = torch.stack([
        agent_to_tensor(agent, brand_factor)
        for agent in agents
        for brand_factor in brand_factors
    ])
    tensor_y = torch.stack([
        torch.Tensor([simulate(agent, brand_factor, 1)[1]['breed'] == BREED_C])
        for agent in agents
        for brand_factor in brand_factors
    ])
    return torch.utils.data.TensorDataset(tensor_x, tensor_y)


def get_loaders(batch_size, random_seed, train_proportion=0.6, test_proportion=0.2,
                shuffle=True, save=True):
    # The seed is a parameter for reproducibility

    try:
        train = open(config.TRAINLOADER_PATH, 'rb')
        test = open(config.TESTLOADER_PATH, 'rb')
        valid = open(config.VALIDLOADER_PATH, 'rb')
    except FileNotFoundError:
        pass
    else:
        return pickle.load(train), pickle.load(valid), pickle.load(test)

    dataset = build_dataset()
    num_elements = len(dataset)
    indices = list(range(num_elements))
    train_split = int(np.floor(train_proportion * num_elements))
    test_split = int(np.floor(test_proportion * num_elements))
    valid_split = num_elements - train_split - test_split

    if shuffle:
        np.random.seed(random_seed)
        np.random.shuffle(indices)

    train_idx, test_idx = indices[:train_split], indices[train_split:]
    test_idx, valid_idx = test_idx[:test_split], test_idx[test_split:]

    train_sampler = SubsetRandomSampler(train_idx)
    valid_sampler = SubsetRandomSampler(valid_idx)
    test_sampler = SubsetRandomSampler(test_idx)

    train_loader = torch.utils.data.DataLoader(dataset, batch_size=batch_size, sampler=train_sampler)
    valid_loader = torch.utils.data.DataLoader(dataset, batch_size=batch_size, sampler=test_sampler)
    test_loader = torch.utils.data.DataLoader(dataset, batch_size=batch_size, sampler=valid_sampler)

    if save:
        with open(config.TRAINLOADER_PATH, 'wb') as f:
            pickle.dump(train_loader, f)
        with open(config.VALIDLOADER_PATH, 'wb') as f:
            pickle.dump(valid_loader, f)
        with open(config.TESTLOADER_PATH, 'wb') as f:
            pickle.dump(test_loader, f)

    return train_loader, valid_loader, test_loader


def train(model, loader, criterion, optimizer, n_epochs=2):
    running_loss = 0
    N_RUNS = 100
    for epoch in range(n_epochs):
        for i, data in enumerate(loader):
            inputs, labels = data
            inputs, labels = Variable(inputs), Variable(labels, requires_grad=False)

            optimizer.zero_grad()

            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.data[0]
            if i and not i % N_RUNS:
                print('{} - {}: loss = {}'.format(epoch, i, running_loss / N_RUNS))
                running_loss = 0


def test(model, loader, testset_len):
    correct = 0
    for data in loader:
        inputs, labels = data
        output = model(Variable(inputs))
        pred = (output.data > 0.5).float()
        correct += (pred == labels).sum()
    return 100 * correct / testset_len


def load_model(f):
    try:
        model = torch.load(config.MODEL_PATH)
    except FileNotFoundError:
        f.model = None
    else:
        model.eval()  # Set the model in eval mode
        f.model = model

    def wrapper(*args, **kwargs):
        return f(*args, **kwargs)
    return wrapper


@load_model
def predict(agent, brand_factor):
    if predict.model is None:
        raise RuntimeError('The model must be trained and saved to "' +
                           config.MODEL_PATH + '" before being used.')
    input_ = Variable(agent_to_tensor(agent, brand_factor))
    input_.unsqueeze(0)
    output = predict.model(input_)
    _, predicted = torch.max(output.data, 1)  # TODO: > 0.5
    return predicted
