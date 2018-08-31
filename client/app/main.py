from datetime import datetime
from apiclient.discovery import build
from httplib2 import Http
from oauth2client import file
from flask import Flask, render_template, jsonify


SCOPES = 'https://www.googleapis.com/auth/calendar.readonly'

app = Flask(__name__)
app.config.from_object('config')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calendar')
def calendar():
    store = file.Storage('gapi/credentials.json')
    creds = store.get()
    service = build('calendar', 'v3', http=creds.authorize(Http()))

    events_result = service.events().list(
        calendarId=app.config.get('GOOGLE_API_CALENDAR_ID'),
        timeMin=datetime.utcnow().isoformat() + 'Z',
        maxResults=25,
        singleEvents=True,
        orderBy='startTime').execute()
    events = events_result.get('items', [])

    return jsonify(events)
