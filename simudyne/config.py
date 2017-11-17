import os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

N_SIMULATED_YEARS = 15
MIN_BRAND_FACTOR, MAX_BRAND_FACTOR = 0.1, 2.9
DB_PATH = os.path.join(ROOT, 'data/database.db')
MODEL_PATH = os.path.join(ROOT, 'data/model.pth')
TRAINLOADER_PATH = os.path.join(ROOT, 'data/trainloader.pickle')
TESTLOADER_PATH = os.path.join(ROOT, 'data/testloader.pickle')
VALIDLOADER_PATH = os.path.join(ROOT, 'data/validloader.pickle')
