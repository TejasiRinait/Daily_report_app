from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager, create_access_token
from flask_socketio import SocketIO
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import timedelta
from bson.objectid import ObjectId


import bcrypt

app = Flask(__name__)

# MongoDB Connection
app.config["MONGO_URI"] = "mongodb://localhost:27017/daily_report_db"
mongo = PyMongo(app)

# JWT Setup
app.config["JWT_SECRET_KEY"] = "supersecretkey"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=5)
jwt = JWTManager(app)

# SocketIO Setup
socketio = SocketIO(app, cors_allowed_origins="*")

# ----------------------
# REGISTER
# ----------------------
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    
    hashed_pw = bcrypt.hashpw(data["password"].encode('utf-8'), bcrypt.gensalt())

    mongo.db.users.insert_one({
        "name": data["name"],
        "email": data["email"],
        "password": hashed_pw,
        "role": data["role"],
        "status": "offline"
    })

    return jsonify({"message": "User registered successfully"})

# ----------------------
# LOGIN
# ----------------------
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    user = mongo.db.users.find_one({"email": data["email"]})

    if user and bcrypt.checkpw(data["password"].encode
    ('utf-8'), user["password"]):
        access_token = create_access_token(identity=str(user["_id"]))
        return jsonify({
            "token": access_token,
            "role": user["role"]
        })

    return jsonify({"message": "Invalid credentials"}), 401

# ----------------------
# SUBMIT REPORT
# ----------------------
@app.route("/submit-report", methods=["POST"])
@jwt_required()
def submit_report():
    user_id = get_jwt_identity()
    data = request.json

    mongo.db.reports.insert_one({
        "user_id": user_id,
        "completed_tasks": data["completed"],
        "pending_tasks": data["pending"],
        "remarks": data["remarks"],
        "date": datetime.utcnow()
    })

    return jsonify({"message": "Report submitted successfully"})

@app.route("/my-reports", methods=["GET"])
@jwt_required()
def get_my_reports():
    user_id = get_jwt_identity()

    reports = list(mongo.db.reports.find({"user_id": user_id}))

    for report in reports:
        report["_id"] = str(report["_id"])

    return jsonify(reports)

@app.route("/all-reports", methods=["GET"])
@jwt_required()
def get_all_reports():
    user_id = get_jwt_identity()
    user = mongo.db.users.find_one({"_id": ObjectId(user_id)})

    if user["role"] != "admin":
        return jsonify({"message": "Access denied"}), 403

    reports = list(mongo.db.reports.find())

    for report in reports:
        report["_id"] = str(report["_id"])
        report["user_id"] = str(report["user_id"])

    return jsonify(reports)

@app.route("/add-task", methods=["POST"])
@jwt_required()
def add_task():
    user_id = get_jwt_identity()
    data = request.json

    mongo.db.tasks.insert_one({
        "user_id": user_id,
        "task_name": data["task_name"],
        "status": "pending",
        "date": datetime.utcnow()
    })

    return jsonify({"message": "Task added successfully"})

@app.route("/my-tasks", methods=["GET"])
@jwt_required()
def get_my_tasks():
    user_id = get_jwt_identity()

    tasks = list(mongo.db.tasks.find({"user_id": user_id}))

    for task in tasks:
        task["_id"] = str(task["_id"])

    return jsonify(tasks)

@app.route("/update-task/<task_id>", methods=["PUT"])
@jwt_required()
def update_task(task_id):
    data = request.json

    mongo.db.tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"status": data["status"]}}
    )

    return jsonify({"message": "Task updated"})

@app.route("/delete-task/<task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):

    mongo.db.tasks.delete_one({"_id": ObjectId(task_id)})

    return jsonify({"message": "Task deleted"})


def move_pending_tasks():
    print("Running scheduler...")

    pending_tasks = mongo.db.tasks.find({"status": "pending"})

    for task in pending_tasks:
        new_date = datetime.utcnow() + timedelta(days=1)

        mongo.db.tasks.update_one(
            {"_id": task["_id"]},
            {"$set": {"date": new_date}}
        )

    print("Pending tasks moved to next day.")

scheduler = BackgroundScheduler()
scheduler.add_job(move_pending_tasks, 'interval', minutes=60)  # For testing use minutes
scheduler.start()
# ----------------------
# CHAT
# ----------------------
@socketio.on("message")
def handle_message(msg):
    mongo.db.chats.insert_one({
        "message": msg,
        "timestamp": datetime.utcnow()
    })
    socketio.emit("message", msg, broadcast=True)

# ----------------------
# SCHEDULER
# ----------------------
def check_pending_tasks():
    reports = mongo.db.reports.find({"pending_tasks": {"$ne": ""}})
    for report in reports:
        print("Pending task found")

scheduler = BackgroundScheduler()
scheduler.add_job(check_pending_tasks, 'interval', hours=24)
scheduler.start()

if __name__ == "__main__":
    socketio.run(app, debug=True)