from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from bson.objectid import ObjectId
from bson.errors import InvalidId

def admin_required(mongo):
    """Decorator to check if the user is an admin"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            from flask import request
            if request.method == 'OPTIONS':
                return '', 200  # Allow CORS preflight
            try:
                user_id = get_jwt_identity()
                admin = mongo.db.admins.find_one({"_id": ObjectId(user_id)})
                if not admin or not admin.get("is_admin", False):
                    return jsonify({"msg": "Unauthorized - Admin access required"}), 401
                return f(*args, **kwargs)
            except InvalidId:
                return jsonify({"msg": "Invalid user ID format"}), 400
            except Exception as e:
                return jsonify({"msg": f"Error: {str(e)}"}), 500
        
        return decorated_function
    return decorator