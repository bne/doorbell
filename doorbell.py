from flask import Flask
app = Flask(__name__)

@app.route("/poppo/<bar>")
def doorbell(bar):
    return bar

if __name__ == "__main__":
    app.run()
