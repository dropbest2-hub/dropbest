import zipfile
import os

zip_path = r"d:\dropbest-project.zip"

with zipfile.ZipFile(zip_path, 'a') as zipf:
    env_local = r"d:\dropbest\frontend\.env.local"
    if os.path.exists(env_local):
        zipf.write(env_local, arcname=r"frontend/.env.local")
        
    env_backend = r"d:\dropbest\backend\.env"
    if os.path.exists(env_backend):
        zipf.write(env_backend, arcname=r"backend/.env")

print("Added env files to zip successfully.")
