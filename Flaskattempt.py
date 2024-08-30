from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
import pytz

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///submissions.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

scheduler = BackgroundScheduler()

class Submission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), unique=True, nullable=False)
    submission_time = db.Column(db.DateTime, default=datetime.utcnow)
    content = db.Column(db.String(500), nullable=False)
    reviewed = db.Column(db.Boolean, default=False)

with app.app_context():
    db.create_all()

def unlock_reviews():
    with app.app_context():
        submissions = Submission.query.filter_by(reviewed=False).all()
        for submission in submissions:
            submission.reviewed = True
        db.session.commit()

scheduler.add_job(unlock_reviews, 'cron', day_of_week='sun', hour=13, minute=0, timezone='US/Eastern')
scheduler.start()

@app.route('/submit', methods=['POST'])
def submit():
    user_id = request.form.get('user_id')
    content = request.form.get('content')

    if not user_id or not content:
        return jsonify({'error': 'Missing user_id or content'}), 400

    one_week_ago = datetime.utcnow() - timedelta(weeks=1)
    existing_submission = Submission.query.filter(
        Submission.user_id == user_id,
        Submission.submission_time >= one_week_ago
    ).first()

    if existing_submission:
        return jsonify({'error': 'You have already submitted this week'}), 403

    new_submission = Submission(user_id=user_id, content=content)
    db.session.add(new_submission)
    db.session.commit()

    return jsonify({'message': 'Submission received'}), 200

@app.route('/review', methods=['GET'])
def review():
    now = datetime.utcnow()
    if now.weekday() != 6 or now.hour != 13:
        return jsonify({'error': 'Reviews are only available on Sundays at 1 PM EST'}), 403

    submissions = Submission.query.filter_by(reviewed=False).all()
    submissions_data = [{'user_id': s.user_id, 'content': s.content, 'submission_time': s.submission_time} for s in submissions]

    return jsonify({'submissions': submissions_data}), 200

if __name__ == '__main__':
    app.run(debug=True)
