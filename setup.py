import os
from setuptools import setup, find_packages


def readme():
    with open(os.path.join(os.path.dirname(__file__), 'README.md')) as f:
        return f.read()

# Allow setup.py to be run from any path
os.chdir(os.path.normpath(os.path.join(os.path.abspath(__file__), os.pardir)))

setup(
    name='simudyne',
    version='0.0.1',
    url='https://github.com/Vayel/simudyne-back-end-test',
    description='The code for the back-end test of Simudyne.',
    long_description=readme(),
    author='Vincent Lefoulon',
    author_email='vincent.lefoulon@free.fr',
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'Flask',
        # 'torch',
    ],
)
