import os
import shutil

os.makedirs('templates', exist_ok=True)
os.makedirs('static', exist_ok=True)

if os.path.exists('index.html'):
    shutil.move('index.html', 'templates/index.html')
if os.path.exists('style.css'):
    shutil.move('style.css', 'static/style.css')
if os.path.exists('script.js'):
    shutil.move('script.js', 'static/script.js')
