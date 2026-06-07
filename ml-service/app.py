import os
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.cluster import KMeans
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, silhouette_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

app = Flask(__name__)
CORS(app)

MODEL_DIR = Path(os.getenv('MODEL_DIR', './models'))
DATASET_DIR = Path(os.getenv('DATASET_DIR', './datasets'))
MODEL_DIR.mkdir(parents=True, exist_ok=True)
DATASET_DIR.mkdir(parents=True, exist_ok=True)

LR_MODEL_PATH = MODEL_DIR / 'linear_regression.joblib'
KMEANS_MODEL_PATH = MODEL_DIR / 'kmeans.joblib'
SCALER_PATH = MODEL_DIR / 'scaler.joblib'

REQUIRED_COLUMNS = ['quiz_score', 'coding_score', 'study_hours', 'attendance', 'final_marks']
FEATURE_COLUMNS = ['quiz_score', 'coding_score', 'study_hours', 'attendance']
CLUSTER_FEATURES = ['quiz_score', 'coding_score', 'study_hours']


def generate_sample_dataset():
    np.random.seed(42)
    n = 200
    quiz = np.random.uniform(40, 100, n)
    coding = np.random.uniform(40, 100, n)
    hours = np.random.uniform(10, 80, n)
    attendance = np.random.uniform(60, 100, n)
    final = quiz * 0.3 + coding * 0.35 + hours * 0.15 + attendance * 0.2 + np.random.normal(0, 5, n)
    final = np.clip(final, 0, 100)
    return pd.DataFrame({
        'quiz_score': quiz,
        'coding_score': coding,
        'study_hours': hours,
        'attendance': attendance,
        'final_marks': final,
    })


def load_dataset(filepath=None):
    if filepath and Path(filepath).exists():
        path = Path(filepath)
        if path.suffix.lower() in ['.xlsx', '.xls']:
            df = pd.read_excel(path)
        else:
            df = pd.read_csv(path)
        df.columns = [c.strip().lower().replace(' ', '_') for c in df.columns]
        return df

    sample_path = DATASET_DIR / 'sample_dataset.csv'
    if not sample_path.exists():
        df = generate_sample_dataset()
        df.to_csv(sample_path, index=False)
    return pd.read_csv(sample_path)


@app.route('/status', methods=['GET'])
def status():
    return jsonify({
        'status': 'online',
        'service': 'EduVerse ML Service',
        'models': {
            'linear_regression': LR_MODEL_PATH.exists(),
            'kmeans': KMEANS_MODEL_PATH.exists(),
        },
    })


@app.route('/dataset/info', methods=['POST'])
def dataset_info():
    data = request.get_json() or {}
    filepath = data.get('filepath')
    try:
        df = load_dataset(filepath)
        return jsonify({
            'row_count': len(df),
            'columns': list(df.columns),
            'preview': df.head(3).to_dict(orient='records'),
        })
    except Exception as e:
        return jsonify({'message': str(e)}), 400


@app.route('/train', methods=['POST'])
def train():
    data = request.get_json() or {}
    filepath = data.get('dataset_path')
    retrain = data.get('retrain', False)

    try:
        df = load_dataset(filepath)

        for col in REQUIRED_COLUMNS:
            if col not in df.columns:
                if col == 'final_marks' and 'final_score' in df.columns:
                    df['final_marks'] = df['final_score']
                elif col not in df.columns:
                    return jsonify({'message': f'Missing column: {col}'}), 400

        # Clean missing values and coerce to numeric
        for col in REQUIRED_COLUMNS:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        df = df.dropna(subset=REQUIRED_COLUMNS)

        if len(df) == 0:
            return jsonify({'message': 'Dataset contains only invalid or empty rows.'}), 400

        X = df[FEATURE_COLUMNS].values
        y = df['final_marks'].values

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        lr = LinearRegression()
        lr.fit(X_train, y_train)
        y_pred = lr.predict(X_test)
        lr_accuracy = float(r2_score(y_test, y_pred))

        joblib.dump(lr, LR_MODEL_PATH)

        X_cluster = df[CLUSTER_FEATURES].values
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X_cluster)

        kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
        labels = kmeans.fit_predict(X_scaled)
        silhouette = float(silhouette_score(X_scaled, labels)) if len(set(labels)) > 1 else 0.5

        joblib.dump(kmeans, KMEANS_MODEL_PATH)
        joblib.dump(scaler, SCALER_PATH)

        cluster_names = {0: 'Beginner', 1: 'Intermediate', 2: 'Advanced'}
        label_map = {}
        centers = kmeans.cluster_centers_
        sorted_idx = np.argsort(centers.mean(axis=1))
        for i, idx in enumerate(sorted_idx):
            label_map[int(idx)] = list(cluster_names.values())[i]

        metadata = {
            'label_map': label_map,
            'cluster_names': cluster_names,
        }
        with open(MODEL_DIR / 'kmeans_metadata.json', 'w') as f:
            json.dump(metadata, f)

        return jsonify({
            'message': 'Models trained successfully',
            'retrain': retrain,
            'linear_regression': {
                'accuracy': round(lr_accuracy, 4),
                'dataset_size': len(df),
                'model_path': str(LR_MODEL_PATH),
            },
            'kmeans': {
                'accuracy': round(silhouette, 4),
                'silhouette': round(silhouette, 4),
                'dataset_size': len(df),
                'model_path': str(KMEANS_MODEL_PATH),
                'clusters': cluster_names,
            },
        })
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@app.route('/predict/student', methods=['POST'])
def predict_student():
    data = request.get_json() or {}
    quiz_score = float(data.get('quiz_score', 0))
    coding_score = float(data.get('coding_score', 0))
    study_hours = float(data.get('study_hours', 0))
    attendance = float(data.get('attendance', 70))

    features = np.array([[quiz_score, coding_score, study_hours, attendance]])

    if LR_MODEL_PATH.exists():
        lr = joblib.load(LR_MODEL_PATH)
        predicted_score = float(lr.predict(features)[0])
    else:
        predicted_score = quiz_score * 0.3 + coding_score * 0.35 + study_hours * 0.15 + attendance * 0.2

    predicted_score = round(min(100, max(0, predicted_score)), 2)

    skill_level = 'Beginner'
    if KMEANS_MODEL_PATH.exists() and SCALER_PATH.exists():
        kmeans = joblib.load(KMEANS_MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        cluster_features = np.array([[quiz_score, coding_score, study_hours]])
        scaled = scaler.transform(cluster_features)
        label = int(kmeans.predict(scaled)[0])

        metadata_path = MODEL_DIR / 'kmeans_metadata.json'
        if metadata_path.exists():
            with open(metadata_path) as f:
                meta = json.load(f)
            skill_level = meta['label_map'].get(str(label), meta['label_map'].get(label, 'Intermediate'))
        else:
            skill_level = ['Beginner', 'Intermediate', 'Advanced'][label % 3]
    else:
        if predicted_score >= 75:
            skill_level = 'Advanced'
        elif predicted_score >= 50:
            skill_level = 'Intermediate'

    weak_subject = 'Theory (Quizzes)' if quiz_score < coding_score else 'Coding Practice'
    recommendations = (
        f'Focus on improving {weak_subject}. '
        f'Your predicted performance is {predicted_score}%. '
        f'Skill level: {skill_level}. '
        'Complete more practice quizzes and coding challenges.'
    )

    return jsonify({
        'predicted_score': predicted_score,
        'skill_level': skill_level,
        'weak_subject': weak_subject,
        'recommendations': recommendations,
    })


@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    try:
        df = load_dataset(request.get_json().get('dataset_path') if request.is_json else None)
        results = []
        for _, row in df.head(50).iterrows():
            resp = predict_student_internal(row)
            results.append(resp)
        return jsonify({'predictions': results})
    except Exception as e:
        return jsonify({'message': str(e)}), 500


def predict_student_internal(row):
    data = {
        'quiz_score': float(row.get('quiz_score', 0)),
        'coding_score': float(row.get('coding_score', 0)),
        'study_hours': float(row.get('study_hours', 0)),
        'attendance': float(row.get('attendance', 70)),
    }
    with app.test_request_context(json=data):
        return predict_student().get_json()


# ============================================================
# STUDENT PROFILE ANALYSIS ENGINE
# ============================================================

CAREER_MAP = {
    'BCA': [
        'Software Developer', 'Data Analyst', 'AI Engineer',
        'Full Stack Developer', 'Cloud Architect', 'DevOps Engineer',
    ],
    'BBA': [
        'Marketing Manager', 'HR Executive', 'Business Analyst',
        'Operations Manager', 'Entrepreneur', 'Brand Strategist',
    ],
    'BCom': [
        'Accountant', 'Auditor', 'Tax Consultant',
        'Financial Analyst', 'Banking Professional', 'Investment Analyst',
    ],
}

ROADMAP_MAP = {
    'BCA': [
        {'phase': 'Foundation', 'subjects': ['Programming Fundamentals', 'Mathematics', 'Computer Organization'], 'duration': '1-2 Months'},
        {'phase': 'Core Development', 'subjects': ['Data Structures', 'Database Management', 'Web Development'], 'duration': '2-3 Months'},
        {'phase': 'Advanced Topics', 'subjects': ['Software Engineering', 'Machine Learning Basics', 'Cloud Computing'], 'duration': '2-3 Months'},
        {'phase': 'Specialization', 'subjects': ['AI/ML Projects', 'Full Stack Development', 'Industry Internship'], 'duration': '3-4 Months'},
    ],
    'BBA': [
        {'phase': 'Foundation', 'subjects': ['Business Communication', 'Principles of Management', 'Economics'], 'duration': '1-2 Months'},
        {'phase': 'Core Business', 'subjects': ['Marketing Management', 'Financial Accounting', 'HR Management'], 'duration': '2-3 Months'},
        {'phase': 'Advanced Topics', 'subjects': ['Strategic Management', 'Business Analytics', 'International Business'], 'duration': '2-3 Months'},
        {'phase': 'Specialization', 'subjects': ['Digital Marketing', 'Leadership Development', 'Industry Project'], 'duration': '3-4 Months'},
    ],
    'BCom': [
        {'phase': 'Foundation', 'subjects': ['Financial Accounting', 'Business Mathematics', 'Business Law'], 'duration': '1-2 Months'},
        {'phase': 'Core Commerce', 'subjects': ['Cost Accounting', 'Taxation', 'Auditing'], 'duration': '2-3 Months'},
        {'phase': 'Advanced Topics', 'subjects': ['Corporate Finance', 'Investment Analysis', 'E-Commerce'], 'duration': '2-3 Months'},
        {'phase': 'Specialization', 'subjects': ['GST & Tax Planning', 'Financial Portfolio', 'Industry Internship'], 'duration': '3-4 Months'},
    ],
}


def _determine_learning_type(skills, favorite_subjects, career_goal, hobbies):
    """Classify learning style based on textual profile data."""
    all_text = ' '.join(filter(None, [skills, favorite_subjects, career_goal, hobbies])).lower()

    analytical_kw = ['math', 'logic', 'algorithm', 'data', 'analytics', 'statistics', 'research', 'analysis']
    practical_kw = ['coding', 'programming', 'project', 'development', 'building', 'hands-on', 'lab', 'hackathon']
    visual_kw = ['design', 'ui', 'ux', 'graphics', 'art', 'video', 'animation', 'figma', 'photoshop']
    kinesthetic_kw = ['sports', 'workshop', 'internship', 'field', 'travel', 'experiment', 'outdoor']

    scores = {
        'Analytical Learner': sum(1 for k in analytical_kw if k in all_text),
        'Practical Learner': sum(1 for k in practical_kw if k in all_text),
        'Visual Learner': sum(1 for k in visual_kw if k in all_text),
        'Kinesthetic Learner': sum(1 for k in kinesthetic_kw if k in all_text),
    }
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else 'Analytical Learner'


def _analyze_strengths_weaknesses(sslc, puc, cgpa, skills, favorite_subjects, career_goal):
    """Derive strengths and weaknesses from academic + skill profile."""
    all_text = ' '.join(filter(None, [skills, favorite_subjects, career_goal])).lower()
    skills_list = [s.strip() for s in (skills or '').split(',') if s.strip()]

    strengths, weaknesses = [], []

    if sslc >= 80:
        strengths.append('Strong Academic Foundation')
    if puc >= 80:
        strengths.append('Consistent Academic Performance')
    if cgpa and cgpa >= 8.0:
        strengths.append('Excellent University Performance')
    if len(skills_list) >= 4:
        strengths.append('Diverse Skill Set')
    elif len(skills_list) >= 2:
        strengths.append('Focused Technical Skills')

    skill_map = {
        'Programming': ['programming', 'coding', 'python', 'java', 'c++', 'javascript'],
        'Database Concepts': ['database', 'sql', 'mysql', 'mongodb', 'postgresql'],
        'Problem Solving': ['problem solving', 'logic', 'algorithm', 'dsa', 'competitive'],
        'Web Development': ['html', 'css', 'react', 'web', 'frontend', 'backend', 'fullstack'],
        'Data Analysis': ['data', 'excel', 'analytics', 'tableau', 'power bi'],
        'Communication Skills': ['communication', 'public speaking', 'presentation', 'writing'],
        'Leadership': ['leadership', 'team', 'management', 'captain', 'lead'],
    }

    for skill_name, keywords in skill_map.items():
        if any(k in all_text for k in keywords):
            if skill_name not in strengths:
                strengths.append(skill_name)

    # Weaknesses
    if sslc < 60:
        weaknesses.append('Mathematics')
    if puc < 60:
        weaknesses.append('Core Academics')
    if len(skills_list) < 2:
        weaknesses.append('Technical Skills Breadth')
    if not any(k in all_text for k in ['communication', 'speaking', 'writing']):
        weaknesses.append('Communication Skills')
    if not any(k in all_text for k in ['problem', 'logic', 'algorithm']):
        weaknesses.append('Logical Reasoning')
    if not any(k in all_text for k in ['team', 'leadership', 'collaboration']):
        weaknesses.append('Team Collaboration')

    if not strengths:
        strengths = ['Eagerness to Learn', 'Growth Mindset']
    if not weaknesses:
        weaknesses = ['Time Management', 'Advanced Specialization']

    return strengths[:6], weaknesses[:4]


def _compute_performance_score(sslc, puc, cgpa, skills, learning_level):
    """Weighted performance prediction 0-100."""
    skills_count = len([s for s in (skills or '').split(',') if s.strip()])
    level_bonus = {'Advanced': 10, 'Intermediate': 5, 'Beginner': 0}.get(learning_level, 0)
    gpa_component = (cgpa * 10) if cgpa else ((sslc + puc) / 2) * 0.1 * 10
    score = sslc * 0.20 + puc * 0.30 + gpa_component * 0.30 + skills_count * 2 + level_bonus
    return round(min(100, max(0, score)), 1)


def _compute_placement_score(perf_score, skills, learning_level, career_goal):
    skills_count = len([s for s in (skills or '').split(',') if s.strip()])
    level_bonus = {'Advanced': 10, 'Intermediate': 5, 'Beginner': 0}.get(learning_level, 0)
    goal_bonus = 5 if career_goal else 0
    score = perf_score * 0.60 + skills_count * 3 + level_bonus + goal_bonus
    return round(min(100, max(0, score)), 1)


@app.route('/analyze/profile', methods=['POST'])
def analyze_profile():
    """Full ML-based profile analysis for student onboarding."""
    data = request.get_json() or {}

    sslc = float(data.get('sslc_marks', 60))
    puc = float(data.get('puc_marks', 60))
    cgpa = float(data['cgpa']) if data.get('cgpa') else None
    course = data.get('course', 'BCA')
    skills = data.get('skills', '')
    favorite_subjects = data.get('favorite_subjects', '')
    career_goal = data.get('career_goal', '')
    hobbies = data.get('hobbies', '')
    learning_level = data.get('learning_level', 'Beginner')

    learning_type = _determine_learning_type(skills, favorite_subjects, career_goal, hobbies)
    strengths, weaknesses = _analyze_strengths_weaknesses(sslc, puc, cgpa, skills, favorite_subjects, career_goal)
    performance_score = _compute_performance_score(sslc, puc, cgpa, skills, learning_level)
    placement_score = _compute_placement_score(performance_score, skills, learning_level, career_goal)
    career_recommendations = CAREER_MAP.get(course, CAREER_MAP['BCA'])
    roadmap = ROADMAP_MAP.get(course, ROADMAP_MAP['BCA'])

    return jsonify({
        'learning_type': learning_type,
        'strengths': strengths,
        'weaknesses': weaknesses,
        'performance_score': performance_score,
        'placement_score': placement_score,
        'career_recommendations': career_recommendations,
        'roadmap': roadmap,
    })


if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    generate_sample_dataset().to_csv(DATASET_DIR / 'sample_dataset.csv', index=False)
    app.run(host='0.0.0.0', port=port, debug=os.getenv('FLASK_DEBUG', 'false') == 'true')

