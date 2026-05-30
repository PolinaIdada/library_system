from functools import wraps
from flask import request, jsonify
import jwt

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Токен отсутствует'}), 401
        try:
            token = token.split(' ')[1]
            from flask import current_app
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            from models import User
            current_user = User.query.get(data['user_id'])
        except:
            return jsonify({'message': 'Неверный токен'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

def role_required(allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated(current_user, *args, **kwargs):
            if current_user.role not in allowed_roles:
                return jsonify({'message': 'Доступ запрещен'}), 403
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator