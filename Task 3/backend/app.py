from flask import Flask, send_from_directory, request, jsonify
import os
import urllib.parse
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from utils import generate_token
from bson.objectid import ObjectId
from bson.errors import InvalidId
from decorators import admin_required
from logger import logger
import datetime
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)

# --- App Configuration ---
cors = CORS()
cors.init_app(app, resources={
    r"/*": {
        "origins":"*",
        "supports_credentials": True,
        "allow_headers": ["Content-Type", "Authorization"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }
})
app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/owl_db")
app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY", "super-secret-key-change-in-production")
mongo = PyMongo(app)
jwt = JWTManager(app)

# --- Helper Functions ---
def get_admin_status(user_id):
    """Helper function to check if a user is an admin."""
    try:
        admin = mongo.db.admins.find_one({"_id": ObjectId(user_id), "is_admin": True})
        return admin is not None
    except InvalidId:
        return False

def normalize_url(url: str | None) -> str | None:
    """Ensure links always start with https:// if provided."""
    if not url or not url.strip(): return None
    url = url.strip()
    if not url.startswith(("http://", "https://")):
        return "https://" + url
    return url

# --- Basic & File Serving Routes ---
@app.route('/')
def home():
    return "Backend is running!"

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
    decoded_filename = urllib.parse.unquote(filename)
    file_path = os.path.join(uploads_dir, decoded_filename)
    if os.path.isfile(file_path):
        return send_from_directory(uploads_dir, decoded_filename)
    else:
        logger.error(f"File not found: {file_path}")
        return jsonify({"error": "File not found"}), 404

# --- Application Status Update Endpoints ---
@app.route('/api/project_applications/<application_id>/status', methods=['PUT'])
@jwt_required()
@admin_required(mongo)
def update_project_application_status(application_id):
    data = request.get_json()
    new_status = data.get("status")
    if not new_status or new_status not in ["approved", "rejected"]:
        return jsonify({"error": "Invalid status value"}), 400

    application = mongo.db.project_applications.find_one({"_id": ObjectId(application_id)})
    if not application:
        return jsonify({"error": "Application not found"}), 404

    final_status = new_status
    current_status = application.get("status")
    if current_status in ["submitted", "resubmit"] and new_status == "approved":
        final_status = "completed"
    elif current_status in ["submitted", "resubmit"] and new_status == "rejected":
        final_status = "resubmit"
        
    mongo.db.project_applications.update_one({"_id": ObjectId(application_id)}, {"$set": {"status": final_status}})
    return jsonify({"msg": "Status updated", "id": application_id, "status": final_status})

@app.route('/api/internship_applications/<application_id>/status', methods=['PUT'])
@jwt_required()
@admin_required(mongo)
def update_internship_application_status(application_id):
    data = request.get_json()
    new_status = data.get("status")
    if not new_status or new_status not in ["approved", "rejected"]:
        return jsonify({"error": "Invalid status value"}), 400

    application = mongo.db.internship_applications.find_one({"_id": ObjectId(application_id)})
    if not application:
        return jsonify({"error": "Application not found"}), 404

    final_status = new_status
    current_status = application.get("status")
    if current_status in ["submitted", "resubmit"] and new_status == "approved":
        final_status = "completed"
    elif current_status in ["submitted", "resubmit"] and new_status == "rejected":
        final_status = "resubmit"
    
    mongo.db.internship_applications.update_one({"_id": ObjectId(application_id)}, {"$set": {"status": final_status}})
    return jsonify({"msg": "Status updated", "id": application_id, "status": final_status})

# --- Application Submission Routes ---
@app.route('/api/apply_internship', methods=['POST'])
@jwt_required()
def apply_internship():
    user_id = get_jwt_identity()
    data = request.form.to_dict()
    resume_file = request.files.get('resume')
    
    if resume_file:
        uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
        os.makedirs(uploads_dir, exist_ok=True)
        filename = resume_file.filename
        resume_file.save(os.path.join(uploads_dir, filename))
        data['resumeName'] = filename

    required_fields = ["internshipId", "internshipTitle", "name", "email"]
    if not all(data.get(field) for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    application = {
        "user_id": user_id,
        "internship_id": data.get("internshipId"),
        "internship_title": data.get("internshipTitle"),
        "name": data.get("name"),
        "email": data.get("email"),
        "resume_name": data.get("resumeName"),
        "status": "in_process",
        "created_at": datetime.datetime.now(datetime.timezone.utc)
    }
    result = mongo.db.internship_applications.insert_one(application)
    return jsonify({"msg": "Application submitted successfully", "id": str(result.inserted_id)})

@app.route('/api/apply_project/<project_id>', methods=['POST'])
@jwt_required()
def apply_project(project_id):
    user_id = get_jwt_identity()
    data = request.form.to_dict()
    resume_file = request.files.get('resume')
    
    if resume_file:
        uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
        os.makedirs(uploads_dir, exist_ok=True)
        filename = resume_file.filename
        resume_file.save(os.path.join(uploads_dir, filename))
        data['resumeName'] = filename
        
    required_fields = ["name", "email"]
    if not all(data.get(field) for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    project = mongo.db.projects.find_one({"id": project_id})
    if not project and ObjectId.is_valid(project_id):
        project = mongo.db.projects.find_one({"_id": ObjectId(project_id)})
    project_name = project.get("name") if project else "Unknown Project"

    application = {
        "user_id": user_id, "project_id": project_id, "project_name": project_name,
        "name": data.get("name"), "email": data.get("email"), "resume_name": data.get("resumeName"),
        "status": "in_process", "created_at": datetime.datetime.now(datetime.timezone.utc), "type": "project"
    }
    result = mongo.db.project_applications.insert_one(application)
    return jsonify({"msg": "Project application submitted successfully", "id": str(result.inserted_id)})

# --- Data Retrieval Routes ---
@app.route('/api/my_applications', methods=['GET'])
@jwt_required()
def get_my_applications():
    user_id = get_jwt_identity()
    internship_apps = list(mongo.db.internship_applications.find({"user_id": user_id}))
    project_apps = list(mongo.db.project_applications.find({"user_id": user_id}))
    
    formatted_internships = [{
        "id": str(app["_id"]), "type": "internship", "internshipId": app.get("internship_id"),
        "internshipTitle": app.get("internship_title"), "resumeName": app.get("resume_name"),
        "status": app.get("status"),
        "date": app.get("created_at").isoformat() if app.get("created_at") else None
    } for app in internship_apps]
    
    formatted_projects = [{
        "id": str(app["_id"]), "type": "project", "projectId": app.get("project_id"),
        "projectTitle": app.get("project_name"), "resumeName": app.get("resume_name"),
        "status": app.get("status"),
        "date": app.get("created_at").isoformat() if app.get("created_at") else None
    } for app in project_apps]
    
    return jsonify(formatted_internships + formatted_projects)

@app.route('/api/project_applications', methods=['GET'])
@jwt_required()
def get_project_applications():
    current_user_id = get_jwt_identity()
    is_admin = get_admin_status(current_user_id)
    query = {}
    if not is_admin:
        query["user_id"] = current_user_id
    
    applications = list(mongo.db.project_applications.find(query))
    result = [{
        "id": str(app["_id"]), "applicant": app.get("name"), "email": app.get("email"),
        "projectTitle": app.get("project_name"), "projectId": app.get("project_id"),
        "resumeName": app.get("resume_name"), "status": app.get("status"),
        "date": app.get("created_at").isoformat() if app.get("created_at") else None,
        "type": "project", "submission": app.get("submission", {})
    } for app in applications]
    return jsonify(result)

@app.route('/api/internship_applications', methods=['GET'])
@jwt_required()
def get_internship_applications():
    current_user_id = get_jwt_identity()
    is_admin = get_admin_status(current_user_id)
    query = {}
    if not is_admin:
        query["user_id"] = current_user_id
        
    applications = list(mongo.db.internship_applications.find(query))
    result = [{
        "id": str(app["_id"]), "applicant": app.get("name"), "email": app.get("email"),
        "internshipTitle": app.get("internship_title"), "internshipId": app.get("internship_id"),
        "resume": app.get("resume_name"), "status": app.get("status"),
        "date": app.get("created_at").isoformat() if app.get("created_at") else None,
        "submission": app.get("submission", {})
    } for app in applications]
    return jsonify(result)

# --- Projects, Internships, Users Management (Admin) & Public Views ---
@app.route('/api/projects', methods=['GET', 'POST'])
@jwt_required()
def handle_projects():
    if request.method == 'GET':
        projects_cursor = mongo.db.projects.find({})
        projects_list = []
        for p in projects_cursor:
            p['_id'] = str(p['_id'])
            projects_list.append(p)
        return jsonify(projects_list)
    
    if request.method == 'POST':
        if not get_admin_status(get_jwt_identity()):
            return jsonify({"msg": "Admins only"}), 403
        data = request.json
        result = mongo.db.projects.insert_one(data)
        return jsonify({"msg": "Project added", "id": str(result.inserted_id)})

@app.route('/api/projects/<project_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def handle_single_project(project_id):
    if request.method == 'GET':
        query = {"$or": [{"id": project_id}]}
        if ObjectId.is_valid(project_id):
            query["$or"].append({"_id": ObjectId(project_id)})
        
        project = mongo.db.projects.find_one(query)
        if not project:
            return jsonify({"error": "Project not found"}), 404
        project['_id'] = str(project['_id'])
        return jsonify(project)

    if not get_admin_status(get_jwt_identity()):
        return jsonify({"msg": "Admins only"}), 403

    if request.method == 'PUT':
        data = request.json
        result = mongo.db.projects.update_one({"id": project_id}, {"$set": data})
        if result.matched_count == 0:
            return jsonify({"error": "Project not found"}), 404
        return jsonify({"msg": "Project updated"})

    if request.method == 'DELETE':
        result = mongo.db.projects.delete_one({"id": project_id})
        if result.deleted_count == 0:
            return jsonify({"error": "Project not found"}), 404
        return jsonify({"msg": "Project deleted"})

@app.route('/api/internships', methods=['GET', 'POST'])
@jwt_required()
def handle_internships():
    if request.method == 'GET':
        internships_cursor = mongo.db.internships.find({})
        internships_list = []
        for i in internships_cursor:
            i['_id'] = str(i['_id'])
            internships_list.append(i)
        return jsonify(internships_list)
    
    if request.method == 'POST':
        if not get_admin_status(get_jwt_identity()):
            return jsonify({"msg": "Admins only"}), 403
        data = request.json
        result = mongo.db.internships.insert_one(data)
        return jsonify({"msg": "Internship added", "id": str(result.inserted_id)})

@app.route('/api/internships/<internship_id>', methods=['PUT', 'DELETE'])
@jwt_required()
@admin_required(mongo)
def handle_single_internship(internship_id):
    if request.method == 'PUT':
        data = request.json
        result = mongo.db.internships.update_one({"id": internship_id}, {"$set": data})
        if result.matched_count == 0:
            return jsonify({"error": "Internship not found"}), 404
        return jsonify({"msg": "Internship updated"})

    if request.method == 'DELETE':
        result = mongo.db.internships.delete_one({"id": internship_id})
        if result.deleted_count == 0:
            return jsonify({"error": "Internship not found"}), 404
        return jsonify({"msg": "Internship deleted"})

@app.route('/api/users', methods=['GET'])
@jwt_required()
@admin_required(mongo)
def get_users():
    users = list(mongo.db.users.find({}, {"password_hash": 0}))
    for user in users:
        user["id"] = str(user["_id"])
        user["joinDate"] = user["_id"].generation_time.date().isoformat()
        del user["_id"]
    return jsonify(users)

# --- Work Submission ---
@app.route('/api/project_applications/<application_id>/submission', methods=['PUT'])
@jwt_required()
def update_project_submission(application_id):
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    
    github_url = normalize_url(data.get("githubLink"))
    live_url = normalize_url(data.get("liveLink"))
    docs_url = normalize_url(data.get("docsLink"))
    
    if not any([github_url, live_url, docs_url]):
        return jsonify({"error": "At least one link is required"}), 400

    application = mongo.db.project_applications.find_one({'_id': ObjectId(application_id), 'user_id': user_id})
    if not application:
        return jsonify({"error": "Application not found or access denied"}), 404

    submission = {
        'github_url': github_url, 'live_url': live_url, 'docs_url': docs_url,
        'notes': (data.get("notes") or "").strip(),
        'submitted_at': datetime.datetime.now(datetime.timezone.utc)
    }
    
    mongo.db.project_applications.update_one(
        {'_id': ObjectId(application_id)},
        {'$set': {'submission': submission, 'status': 'submitted'}}
    )
    return jsonify({'message': 'Submission saved successfully'})

@app.route('/api/internship_applications/<application_id>/submission', methods=['PUT'])
@jwt_required()
def update_internship_submission(application_id):
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    
    github_url = normalize_url(data.get("githubLink"))
    live_url = normalize_url(data.get("liveLink"))
    
    if not any([github_url, live_url]):
        return jsonify({"error": "At least GitHub or Live URL is required"}), 400

    application = mongo.db.internship_applications.find_one({'_id': ObjectId(application_id), 'user_id': user_id})
    if not application:
        return jsonify({'error': 'Application not found or access denied'}), 404

    submission = {
        'github_url': github_url, 'live_url': live_url,
        'notes': (data.get("notes") or "").strip(),
        'submitted_at': datetime.datetime.now(datetime.timezone.utc)
    }
    
    mongo.db.internship_applications.update_one(
        {'_id': ObjectId(application_id)},
        {'$set': {'submission': submission, 'status': 'submitted'}}
    )
    return jsonify({'message': 'Submission saved successfully'})

# --- Authentication ---
@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"msg": "Missing email or password"}), 400
    if mongo.db.users.find_one({"email": data["email"]}):
        return jsonify({"msg": "User already exists"}), 400
    
    user = {"email": data["email"], "name": data.get("name", ""), "password_hash": generate_password_hash(data["password"])}
    mongo.db.users.insert_one(user)
    return jsonify({"msg": "Registration successful"})

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    user = mongo.db.users.find_one({"email": data["email"]})
    if user and check_password_hash(user.get("password_hash", ""), data["password"]):
        token = generate_token(str(user["_id"]))
        name = user.get("name") or data["email"].split("@")[0]
        return jsonify({"token": token, "name": name, "email": data["email"]})
    return jsonify({"msg": "Invalid credentials"}), 401

@app.route('/auth/admin-login', methods=['POST'])
def admin_login():
    data = request.json
    email = data.get("email", "")
    password = data.get("password", "")
    
    admin = mongo.db.admins.find_one({"email": email})
    if not admin and email == "admin":
        admin = mongo.db.admins.find_one({"username": "admin"})

    if admin and check_password_hash(admin.get("password_hash", ""), password):
        token = generate_token(str(admin["_id"]))
        return jsonify({"token": token, "is_admin": True})
        
    return jsonify({"msg": "Invalid admin credentials"}), 401


if __name__ == '__main__':
    app.run(debug=True)