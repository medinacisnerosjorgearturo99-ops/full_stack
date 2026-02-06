from flask import Flask, request, jsonify
app = Flask(__name__)

users = []

@app.route('/users', methods=['POST'])

def create_user():
    data = request.get_json()
    user = {
        "id": len(users) + 1,
        "name": data["name"],
        "email": data["email"]
    } 
    users.append(user)
    return jsonify({
        "message": "Usuario creado correctamente",
        "user": user
    }), 201

@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    for user in users:
        if user["id"] == user_id:
            return jsonify({"user": user}), 200

    return jsonify({"error": "Usuario no encontrado"}), 404

@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):

    data = request.get_json()

    
    for user in users:
        if user["id"] == user_id:

            if "name" in data:
                user["name"] = data["name"]

            if "email" in data:
                user["email"] = data["email"]

            return jsonify({
                "message": "Usuario actualizado correctamente",
                "user": user
            }), 201

    return jsonify({"error": "Usuario no encontrado"}), 405

@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):

    for i, user in enumerate(users):
        if user["id"] == user_id:

            deleted_user = users.pop(i)

            return jsonify({
                "message": "Usuario eliminado correctamente",
                "user": deleted_user
            }), 203

    return jsonify({"error": "Usuario no encontrado"}), 406


if __name__ == '__main__':
    app.run(debug=True)