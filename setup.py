from setuptools import setup

setup(
    name='doorbell',
    version='0.1',
    entry_points="""
    [console_scripts]
    webserver=webserver.run:main
    """,
)