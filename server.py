from flask import Flask, render_template, request, redirect, url_for, flash, get_flashed_messages, make_response, send_from_directory
import datetime
from util.auth import *

app = Flask(__name__)
app.secret_key = 'your_secret_key'



@app.after_request
def add_header(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    return response

@app.route('/')
def index():
    return render_template('login.html')

@app.route('/playstyles.css')
def playstyle():
    return send_from_directory('static', 'playstyles.css')


@app.route('/styles.css')
def style():
    return send_from_directory('static', 'styles.css')


@app.route('/login_or_create', methods=['POST'])
def login_or_create():

    flash_messages = get_flashed_messages(with_categories=False, category_filter=['danger'])

    for message in flash_messages:
        flash(message, 'danger')

    username = request.form['username']
    password = request.form['password']
    action = request.form['action']
    confirm_password = request.form['confirm_password']

    if action == 'login':
        user = users_collection.find_one({'username': username})
        if user:
            salt = user['salt']
            hashed_password = hash_password(password, salt)
            if hashed_password == user['password']:
                token = generate_token()
                hashed_token = hash_token(token)
                tokens_collection.delete_one({'username': username})
                tokens_collection.insert_one({'username': username, 'token': hashed_token})
                response = make_response(redirect(url_for('dashboard')))
                response.set_cookie('auth_token', token, httponly=True, expires=datetime.datetime.now() + datetime.timedelta(hours=1))
                return response
        flash('Login failed. Please check your username and password.', 'danger')
        return redirect(url_for('index'))
        
    elif action == 'create_account':
        if password != confirm_password:
            flash('Passwords do not match. Please try again.', 'danger')
            return redirect(url_for('index'))
        
        user = users_collection.find_one({'username': username})
        if not user:
            token = generate_token()
            hashed_token = hash_token(token)
            tokens_collection.insert_one({'username': username, 'token': hashed_token})
            salt = generate_salt()
            hashed_password = hash_password(password, salt)
            users_collection.insert_one({'username': username, 'password': hashed_password, 'salt': salt})
            response = make_response(redirect(url_for('dashboard')))
            response.set_cookie('auth_token', token, httponly=True, expires=datetime.datetime.now() + datetime.timedelta(hours=1))
            return response
        else:
            flash('Username already taken. Please choose another username.', 'danger')
            return redirect(url_for('index'))

@app.route('/play_as_guest', methods=['POST'])
def play_as_guest():
    flash('Playing as Guest!', 'info')
    return redirect(url_for('dashboard'))

@app.route('/game')
def dashboard():
    return render_template('playPage.html')

def main():
    host = "0.0.0.0"
    port = 8080

    print("Listening on port " + str(port))

    app.run(host=host, port=port)

if __name__ == "__main__":
    main()